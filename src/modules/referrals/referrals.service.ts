import { Injectable, ForbiddenException } from "@nestjs/common";
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
    const referral = await this.prisma.referral.create({
      data: {
        ...createReferralDto,
        initiatedById: user.id,
      },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
      },
    });

    // Broadcast new referral
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
      `New ${createReferralDto.urgency} referral received from ${referral.referringHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}.`,
    );

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

  async findAll(hospitalId?: string) {
    return this.prisma.referral.findMany({
      where: hospitalId
        ? {
            OR: [
              { referringHospitalId: hospitalId },
              { receivingHospitalId: hospitalId },
            ],
          }
        : undefined,
      include: {
        patient: true,
        receivingHospital: true,
        referringHospital: true,
        counterReferral: true,
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

    // ──────────────────────────────── Clinical Automation Logic ────────────────────────────────

    // 1. Availability Lock when ACCEPTING
    if (status === "ACCEPTED" && existingReferral.targetWardType) {
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
          `Transfer cannot be accepted: The target ward (${existingReferral.targetWardType}) is at 100% capacity.`,
        );
      }
    }

    // 2. Automate Bed Count on Lifecycle Events
    if (existingReferral.targetWardType) {
      if (status === "ADMITTED") {
        const ward = await this.prisma.bedCapacity.update({
          where: { hospitalId_wardType: { hospitalId: existingReferral.receivingHospitalId, wardType: existingReferral.targetWardType } },
          data: { occupiedBeds: { increment: 1 } },
        });
        this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
      } else if (status === "DISCHARGED" || status === "COUNTER_REFERRED") {
        // Only decrement if the referral was previously admitted
        if (existingReferral.status === "ADMITTED") {
          const ward = await this.prisma.bedCapacity.update({
            where: { hospitalId_wardType: { hospitalId: existingReferral.receivingHospitalId, wardType: existingReferral.targetWardType } },
            data: { occupiedBeds: { decrement: 1 } },
          });
          this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
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

    // Notify both facilities of the status transition
    this.clinicalGateway.broadcastNewReferral(referral.receivingHospitalId, referral);
    this.clinicalGateway.broadcastNewReferral(referral.referringHospitalId, referral);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: `STATUS_CHANGED_TO_${status}`,
        entity: "Referral",
        entityId: referral.id,
        referralId: referral.id,
        performedById: user.id,
      },
    });

    // Notify referring hospital staff about the status change
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

    // 3. Discharge Logic: Restore Bed Capacity
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

      this.clinicalGateway.broadcastCapacityUpdate(
        existingReferral.receivingHospitalId,
        ward,
      );
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

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: "COUNTER_REFERRAL_CREATED",
        entity: "CounterReferral",
        entityId: counterReferral.id,
        referralId: id,
        performedById: user.id,
      },
    });

    // Notify referring hospital that a counter-referral has been issued
    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Counter-referral received from ${referral.receivingHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}. Please review discharge notes and follow-up instructions.`,
    );

    return counterReferral;
  }

  async generatePdf(id: string, res: Response) {
    const referral = await this.findOne(id);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Stream to response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Referral_${id.substring(0, 8)}.pdf`,
    );
    doc.pipe(res);

    // Header
    doc
      .fillColor("#1e40af")
      .fontSize(20)
      .text("DIGITAL REFERRAL SYSTEM", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text("Rwanda Healthcare Network - Continuity of Care Record", {
        align: "center",
      });
    doc.moveDown();
    doc.rect(50, doc.y, 500, 2).fill("#e2e8f0");
    doc.moveDown(2);

    // Document Title
    doc
      .fillColor("#000000")
      .fontSize(16)
      .text("DISCHARGE & COUNTER-REFERRAL SUMMARY", { underline: true });
    doc.moveDown();

    // Section: Patient Information
    doc
      .fillColor("#1e40af")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("PATIENT IDENTIFICATION");
    doc.fillColor("#000000").fontSize(10).font("Helvetica");
    doc.text(
      `Full Name: ${referral.patient.firstName} ${referral.patient.lastName}`,
    );
    doc.text(
      `Insurance: ${referral.patient.insurance || "None / Out-of-pocket"}`,
    );
    doc.text(`National ID: ${referral.patient.nationalId || "N/A"}`);
    doc.text(`Gender: ${referral.patient.gender}`);
    doc.text(`DOB: ${format(new Date(referral.patient.dateOfBirth), "PPP")}`);
    doc.moveDown();

    // Section: Clinical Summary
    doc.fillColor("#1e40af").fontSize(12).text("CLINICAL SUMMARY");
    doc.fillColor("#000000").fontSize(10);
    doc.text(`Primary Diagnosis: ${referral.diagnosis}`);
    doc.text(`Reason for Transfer: ${referral.reasonForTransfer}`);
    doc.text(`Urgency: ${referral.urgency}`);
    doc.moveDown();

    // Section: Facility Chain
    doc.fillColor("#1e40af").fontSize(12).text("TRANSFER CHAIN");
    doc.fillColor("#000000").fontSize(10);
    doc.text(
      `Referring Hospital: ${referral.referringHospital.name} (${referral.referringHospital.location})`,
    );
    doc.text(
      `Receiving Hospital: ${referral.receivingHospital.name} (${referral.receivingHospital.location})`,
    );
    doc.moveDown();

    // Section: Counter-Referral Details (The loop closer)
    if (referral.counterReferral) {
      doc
        .rect(50, doc.y, 500, 100)
        .stroke("#1e40af")
        .fillOpacity(0.05)
        .fill("#f8fafc")
        .fillOpacity(1);
      doc.moveDown(0.5);
      doc
        .fillColor("#1e40af")
        .fontSize(12)
        .text("DISCHARGE NOTES & FOLLOW-UP", { indent: 10 });
      doc.fillColor("#000000").fontSize(10);
      doc.text(`Notes: ${referral.counterReferral.dischargeNotes}`, {
        indent: 10,
      });
      doc.text(
        `Follow-up instructions: ${referral.counterReferral.followUpInstructions}`,
        { indent: 10 },
      );
    } else {
      doc.fillColor("#f43f5e").text("Pending counter-referral notes.");
    }
    doc.moveDown(2);

    // Footer
    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text("Generated by Antigravity Referral System", 50, 750, {
        align: "center",
      });
    doc.text(`Date of Generation: ${format(new Date(), "PPP p")}`, {
      align: "center",
    });

    doc.end();
  }
}
