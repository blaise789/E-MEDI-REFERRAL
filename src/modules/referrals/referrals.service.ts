import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { Response } from "express";
import { format } from "date-fns";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateReferralDto } from "./dto/create-referral.dto";
import { CreateCounterReferralDto } from "./dto/create-counter-referral.dto";
import { ReferralStatus } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { CaslAbilityFactory, Action } from "../casl/casl-ability.factory";
import { subject } from "@casl/ability";
import { ClinicalGateway } from "../hospitals/clinical.gateway";

@Injectable()
export class ReferralsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly clinicalGateway: ClinicalGateway,
  ) {}

  async create(createReferralDto: CreateReferralDto, user: any) {
    // ── Validate specialist belongs to receiving hospital ──────────────────
    if (createReferralDto.targetSpecialistId) {
      const specialist = await this.prisma.specialist.findUnique({
        where: { id: createReferralDto.targetSpecialistId },
      });
      if (!specialist || specialist.hospitalId !== createReferralDto.receivingHospitalId) {
        throw new BadRequestException(
          "The selected specialist does not belong to the receiving hospital.",
        );
      }

      // ── Enforce specialist is AVAILABLE ────────────────────
      if (specialist.status !== "AVAILABLE") {
        throw new BadRequestException(
          `Referral rejected: specialist ${specialist.firstName} ${specialist.lastName} is currently UNAVAILABLE.`,
        );
      }
    }

    // ── Enforce target ward has free beds ──────────────────
    if (createReferralDto.targetWardType) {
      const ward = await this.prisma.bedCapacity.findUnique({
        where: {
          hospitalId_wardType: {
            hospitalId: createReferralDto.receivingHospitalId,
            wardType: createReferralDto.targetWardType as any,
          },
        },
      });
      if (ward && ward.occupiedBeds >= ward.totalBeds) {
        throw new BadRequestException(
          `Referral rejected: the ${createReferralDto.targetWardType} ward at the receiving hospital is at full capacity.`,
        );
      }
    }

    const referral = await this.prisma.referral.create({
      data: {
        ...createReferralDto,
        targetWardType: createReferralDto.targetWardType as any,
        initiatedById: user.id,
      },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
      },
    });

    // Broadcast new referral via WebSocket
    this.clinicalGateway.broadcastNewReferral(
      referral.receivingHospitalId,
      referral,
    );

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: "REFERRAL_CREATED",
        entity: "Referral",
        entityId: referral.id,
        referralId: referral.id,
        performedById: user.id,
        details: `Referral submitted from ${referral.referringHospital.name} to ${referral.receivingHospital.name}`,
      },
    });

    // Notify receiving hospital staff
    await this.notificationsService.notifyHospitalStaff(
      createReferralDto.receivingHospitalId,
      `New referral received from ${referral.referringHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}.`,
    );

    // Send patient email if they have one
    if (referral.patient.email) {
      await this.notificationsService.sendPatientEmail(
        referral.patient,
        referral,
      );
    }

    return referral;
  }

  async findOne(id: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        receivingHospital: {
          include: {
            beds: true,
            specialists: true,
          },
        },
        referringHospital: true,
        initiatedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        targetSpecialist: true,
        counterReferral: true,
        logs: {
          include: {
            performedBy: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!referral) {
      throw new ForbiddenException("Referral not found");
    }

    return referral;
  }

  async findAll(filters?: {
    hospitalId?: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    nationalId?: string;
  }) {
    const { hospitalId, search, status, startDate, endDate, nationalId } = filters || {};

    return this.prisma.referral.findMany({
      where: {
        ...(hospitalId
          ? {
              OR: [
                { referringHospitalId: hospitalId },
                { receivingHospitalId: hospitalId },
              ],
            }
          : {}),
        ...(status ? { status: status as ReferralStatus } : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
        ...(search || nationalId
          ? {
              patient: {
                OR: [
                  ...(search
                    ? [
                        { firstName: { contains: search, mode: "insensitive" as const } },
                        { lastName: { contains: search, mode: "insensitive" as const } },
                      ]
                    : []),
                  ...(nationalId
                    ? [{ nationalId: { contains: nationalId, mode: "insensitive" as const } }]
                    : []),
                ],
              },
            }
          : {}),
      },
      include: {
        patient: true,
        receivingHospital: true,
        referringHospital: true,
        counterReferral: true,
        targetSpecialist: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: ReferralStatus, user: any) {
    const existingReferral = await this.prisma.referral.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!existingReferral) {
      throw new ForbiddenException("Referral not found");
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (
      !ability.can(Action.Update, subject("Referral", existingReferral as any))
    ) {
      const details = `User Hospital: ${user.hospitalId}, Recipient: ${existingReferral.receivingHospitalId}, Sender: ${existingReferral.referringHospitalId}`;
      throw new ForbiddenException(
        `You are not authorized to update this referral. [Security Context: ${details}]`,
      );
    }

    // ── Clinical Automation: Bed availability lock when ADMITTING ──────────
    if (status === "ADMITTED" && existingReferral.targetWardType) {
      const ward = await this.prisma.bedCapacity.findUnique({
        where: {
          hospitalId_wardType: {
            hospitalId: existingReferral.receivingHospitalId,
            wardType: existingReferral.targetWardType,
          },
        },
      });
      if (ward && ward.occupiedBeds >= ward.totalBeds) {
        throw new ForbiddenException(
          `Admission cannot be confirmed: The target ward (${existingReferral.targetWardType}) is at 100% capacity.`,
        );
      }
    }

    // ── Automate Bed Count on Lifecycle Events ────────────────────────────
    if (existingReferral.targetWardType) {
      if (status === "ADMITTED") {
        const ward = await this.prisma.bedCapacity.update({
          where: {
            hospitalId_wardType: {
              hospitalId: existingReferral.receivingHospitalId,
              wardType: existingReferral.targetWardType,
            },
          },
          data: { occupiedBeds: { increment: 1 } },
        });
        this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
      } else if (status === "DISCHARGED" || status === "COUNTER_REFERRED") {
        if (existingReferral.status === "ADMITTED") {
          const ward = await this.prisma.bedCapacity.update({
            where: {
              hospitalId_wardType: {
                hospitalId: existingReferral.receivingHospitalId,
                wardType: existingReferral.targetWardType,
              },
            },
            data: { occupiedBeds: { decrement: 1 } },
          });
          this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
        }
      }
    }

    // ── Automate Specialist Status: only AVAILABLE/UNAVAILABLE ────────────
    if (existingReferral.targetSpecialistId) {
      if (status === "DISCHARGED" || status === "COUNTER_REFERRED") {
        if (existingReferral.status === "ADMITTED") {
          const spec = await this.prisma.specialist.update({
            where: { id: existingReferral.targetSpecialistId },
            data: { status: "AVAILABLE" },
          });
          this.clinicalGateway.broadcastSpecialistUpdate(existingReferral.receivingHospitalId, spec);
        }
      }
    }

    const referral = await this.prisma.referral.update({
      where: { id },
      data: { status },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
      },
    });

    this.clinicalGateway.broadcastNewReferral(referral.receivingHospitalId, referral);
    this.clinicalGateway.broadcastNewReferral(referral.referringHospitalId, referral);

    await this.prisma.auditLog.create({
      data: {
        action: `STATUS_CHANGED_TO_${status}`,
        entity: "Referral",
        entityId: referral.id,
        referralId: referral.id,
        performedById: user.id,
      },
    });

    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Referral for patient ${referral.patient.firstName} ${referral.patient.lastName} has been ${status} by ${referral.receivingHospital.name}.`,
    );

    return referral;
  }

  async addCounterReferral(
    id: string,
    createCounterReferralDto: CreateCounterReferralDto,
    user: any,
  ) {
    const existingReferral = await this.prisma.referral.findUnique({
      where: { id },
    });

    if (!existingReferral) {
      throw new ForbiddenException("Referral not found");
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (
      !ability.can(Action.Update, subject("Referral", existingReferral as any))
    ) {
      throw new ForbiddenException(
        "You are not authorized to add a counter-referral to this referral",
      );
    }

    // Restore bed capacity on discharge
    if (existingReferral.targetWardType) {
      const ward = await this.prisma.bedCapacity.update({
        where: {
          hospitalId_wardType: {
            hospitalId: existingReferral.receivingHospitalId,
            wardType: existingReferral.targetWardType,
          },
        },
        data: { occupiedBeds: { decrement: 1 } },
      });
      this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
    }

    // Free up specialist
    if (existingReferral.targetSpecialistId) {
      const spec = await this.prisma.specialist.update({
        where: { id: existingReferral.targetSpecialistId },
        data: { status: "AVAILABLE" },
      });
      this.clinicalGateway.broadcastSpecialistUpdate(existingReferral.receivingHospitalId, spec);
    }

    const counterReferral = await this.prisma.counterReferral.create({
      data: {
        ...createCounterReferralDto,
        referralId: id,
      },
    });

    const referral = await this.prisma.referral.update({
      where: { id },
      data: { status: "COUNTER_REFERRED" },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "COUNTER_REFERRAL_CREATED",
        entity: "CounterReferral",
        entityId: counterReferral.id,
        referralId: id,
        performedById: user.id,
      },
    });

    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Counter-referral received from ${referral.receivingHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}. Please review discharge notes and follow-up instructions.`,
    );

    return counterReferral;
  }

  async generatePdf(id: string, res: Response) {
    const referral = await this.findOne(id);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Referral_${id.substring(0, 8)}.pdf`,
    );
    doc.pipe(res);

    doc.fillColor("#1e40af").fontSize(20).text("DIGITAL REFERRAL SYSTEM", { align: "center" });
    doc.fontSize(10).fillColor("#64748b").text("Rwanda Healthcare Network - Continuity of Care Record", { align: "center" });
    doc.moveDown();
    doc.rect(50, doc.y, 500, 2).fill("#e2e8f0");
    doc.moveDown(2);

    doc.fillColor("#000000").fontSize(16).text("DISCHARGE & COUNTER-REFERRAL SUMMARY", { underline: true });
    doc.moveDown();

    doc.fillColor("#1e40af").fontSize(12).font("Helvetica-Bold").text("PATIENT IDENTIFICATION");
    doc.fillColor("#000000").fontSize(10).font("Helvetica");
    doc.text(`Full Name: ${referral.patient.firstName} ${referral.patient.lastName}`);
    doc.text(`Insurance: ${referral.patient.insurance || "None / Out-of-pocket"}`);
    doc.text(`National ID: ${referral.patient.nationalId || "N/A"}`);
    doc.text(`Gender: ${referral.patient.gender}`);
    doc.text(`DOB: ${format(new Date(referral.patient.dateOfBirth), "PPP")}`);
    doc.moveDown();

    doc.fillColor("#1e40af").fontSize(12).text("CLINICAL SUMMARY");
    doc.fillColor("#000000").fontSize(10);
    doc.text(`Primary Diagnosis: ${referral.diagnosis}`);
    doc.text(`Reason for Transfer: ${referral.reasonForTransfer}`);
    doc.text(`Transport: ${referral.transportType || "AMBULANCE"}`);
    doc.moveDown();

    doc.fillColor("#1e40af").fontSize(12).text("TRANSFER CHAIN");
    doc.fillColor("#000000").fontSize(10);
    doc.text(`Referring Hospital: ${referral.referringHospital.name} (${referral.referringHospital.location})`);
    doc.text(`Receiving Hospital: ${referral.receivingHospital.name} (${referral.receivingHospital.location})`);
    if ((referral as any).targetSpecialist) {
      doc.text(`Specialist: Dr. ${(referral as any).targetSpecialist.firstName} ${(referral as any).targetSpecialist.lastName} — ${(referral as any).targetSpecialist.discipline}`);
    }
    if (referral.targetWardType) {
      doc.text(`Ward: ${referral.targetWardType}`);
    }
    doc.moveDown();

    if (referral.counterReferral) {
      doc.rect(50, doc.y, 500, 100).stroke("#1e40af").fillOpacity(0.05).fill("#f8fafc").fillOpacity(1);
      doc.moveDown(0.5);
      doc.fillColor("#1e40af").fontSize(12).text("DISCHARGE NOTES & FOLLOW-UP", { indent: 10 });
      doc.fillColor("#000000").fontSize(10);
      doc.text(`Notes: ${referral.counterReferral.dischargeNotes}`, { indent: 10 });
      doc.text(`Follow-up instructions: ${referral.counterReferral.followUpInstructions}`, { indent: 10 });
    } else {
      doc.fillColor("#f43f5e").text("Pending counter-referral notes.");
    }
    doc.moveDown(2);

    doc.fontSize(8).fillColor("#94a3b8").text("Generated by Digital Referral System", 50, 750, { align: "center" });
    doc.text(`Date of Generation: ${format(new Date(), "PPP p")}`, { align: "center" });

    doc.end();
  }
}
