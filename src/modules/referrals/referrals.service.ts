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
    // ── Referral routing checks ────────────────────────────
    // (Specialist assignments are no longer hardcoded per referral.
    //  The recommender handles routing based on active shifts and ward capacity.)

    // ── EMERGENCY COMPATIBILITY ALGORITHM ──────────────────────────────────
    // For emergency referrals, perform strict upfront checks before saving.
    const isEmergency = createReferralDto.urgency === 'EMERGENCY' || !!createReferralDto.isEmergency;
    if (isEmergency) {
      // 1. Check if there are beds available in the target ward
      const availableWard = await this.prisma.ward.findFirst({
        where: {
          hospitalId: createReferralDto.receivingHospitalId,
          ...(createReferralDto.targetWardName
            ? { name: { equals: createReferralDto.targetWardName, mode: 'insensitive' } }
            : {}),
        },
      });
      if (!availableWard || availableWard.occupiedBeds >= availableWard.totalBeds) {
        const wardName = createReferralDto.targetWardName ?? 'requested';
        throw new BadRequestException(
          `Emergency Transfer Blocked: The ${wardName} ward at the receiving hospital is at full capacity. Please select a different hospital or ward.`,
        );
      }
    }

    // ── Enforce target ward has free beds (non-emergency pre-check) ─────────
    if (createReferralDto.targetWardName && !isEmergency) {
      const ward = await this.prisma.ward.findFirst({
        where: {
          hospitalId: createReferralDto.receivingHospitalId,
          name: { equals: createReferralDto.targetWardName, mode: 'insensitive' },
        },
      });
      if (ward && ward.occupiedBeds >= ward.totalBeds) {
        throw new BadRequestException(
          `Referral rejected: the ${createReferralDto.targetWardName} ward at the receiving hospital is at full capacity.`,
        );
      }
    }

    const urgency = createReferralDto.urgency || (createReferralDto.isEmergency ? 'EMERGENCY' : 'ROUTINE');

    // ── Resolve wardId from ward name for FK linkage ─────────────────────────
    let resolvedWardId: string | null = null;
    if (createReferralDto.targetWardName) {
      const matchedWard = await this.prisma.ward.findFirst({
        where: {
          hospitalId: createReferralDto.receivingHospitalId,
          name: { equals: createReferralDto.targetWardName, mode: 'insensitive' },
        },
      });
      resolvedWardId = matchedWard?.id ?? null;
    }

    const { expectedAdmissionDate, ...restDto } = createReferralDto;

    const referral = await this.prisma.referral.create({
      data: {
        ...restDto,
        isEmergency,
        urgency: urgency as any,
        targetWardName: createReferralDto.targetWardName,
        wardId: resolvedWardId,
        initiatedById: user.id,
        expectedAdmissionDate: expectedAdmissionDate ? new Date(expectedAdmissionDate) : null,
      },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
        ward: true,
        assignedSpecialist: true,
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
        hospitalId: user.hospitalId,
        details: `Referral submitted from ${referral.referringHospital.name} to ${referral.receivingHospital.name}`,
      },
    });

    // Notify receiving hospital staff
    await this.notificationsService.notifyHospitalStaff(
      createReferralDto.receivingHospitalId,
      `New referral received from ${referral.referringHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}.`,
      referral.id,
    );

    // Send patient email if they have one
    if (referral.patient.email) {
      this.notificationsService.sendPatientEmail(
        referral.patient,
        referral,
      ).catch(error => {
        console.error('Failed to send email to patient:', error);
      });
    }

    return referral;
  }

  async getRecommendations(targetWardName: string) {
    if (!targetWardName) {
      throw new BadRequestException('Target ward name is required for recommendations');
    }

    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = dayNames[new Date().getDay()];
    const currentHour = format(new Date(), 'HH:mm');

    // Find all hospitals that have a matching ward
    const hospitals = await this.prisma.hospital.findMany({
      where: {
        wards: {
          some: {
            name: { equals: targetWardName, mode: 'insensitive' },
          },
        },
      },
      include: {
        wards: {
          where: {
            name: { equals: targetWardName, mode: 'insensitive' },
          },
          include: {
            specialists: true,
          },
        },
      },
    });

    const recommendations = hospitals.map(hospital => {
      const ward = hospital.wards[0]; // Since we filtered, there should be exactly 1 matching ward
      const availableBeds = ward.totalBeds - ward.occupiedBeds;

      // Count how many specialists assigned to this ward are currently on shift
      let activeSpecialistsCount = 0;
      for (const spec of ward.specialists) {
        if (spec.status === 'UNAVAILABLE') continue; // Explicitly marked unavailable
        if (spec.workingDays.length > 0 && !spec.workingDays.includes(currentDay)) continue;
        
        if (spec.shiftStartTime && spec.shiftEndTime) {
          if (currentHour >= spec.shiftStartTime && currentHour <= spec.shiftEndTime) {
            activeSpecialistsCount++;
          }
        } else {
           // If no specific shift times are set but status is AVAILABLE, count them
           if (spec.status === 'AVAILABLE') activeSpecialistsCount++;
        }
      }

      // Score: 10 points per active specialist + 1 point per available bed
      const score = (activeSpecialistsCount * 10) + Math.max(0, availableBeds);

      return {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        location: hospital.location,
        level: hospital.level,
        wardId: ward.id,
        availableBeds,
        activeSpecialistsCount,
        score,
      };
    });

    // Sort by score descending (only recommend if score > 0, meaning beds > 0 or staff > 0)
    return recommendations.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }

  async findOne(id: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        ward: true,
        assignedSpecialist: true,
        receivingHospital: {
          include: {
            wards: true,
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
    // Prefer wardId FK, fall back to name lookup for legacy referrals
    const wardKey = existingReferral.wardId
      ? { id: existingReferral.wardId }
      : existingReferral.targetWardName
        ? { hospitalId_name: { hospitalId: existingReferral.receivingHospitalId, name: existingReferral.targetWardName } }
        : null;

    if (status === "ADMITTED" && wardKey) {
      const ward = await this.prisma.ward.findUnique({ where: wardKey as any });
      if (ward && ward.occupiedBeds >= ward.totalBeds) {
        throw new ForbiddenException(
          `Admission cannot be confirmed: The target ward (${existingReferral.targetWardName ?? 'requested'}) is at 100% capacity.`,
        );
      }
    }

    // ── Automate Bed Count on Lifecycle Events ────────────────────────────
    if (wardKey) {
      if (status === "ADMITTED") {
        const ward = await this.prisma.ward.update({
          where: wardKey as any,
          data: { occupiedBeds: { increment: 1 } },
        });
        this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
      } else if (status === "DISCHARGED" || status === "COUNTER_REFERRED") {
        if (existingReferral.status === "ADMITTED") {
          const ward = await this.prisma.ward.update({
            where: wardKey as any,
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
        ward: true,
        assignedSpecialist: true,
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
        hospitalId: user.hospitalId,
      },
    });

    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Referral for patient ${referral.patient.firstName} ${referral.patient.lastName} has been ${status} by ${referral.receivingHospital.name}.`,
      referral.id,
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
    if (existingReferral.targetWardName) {
      const ward = await this.prisma.ward.update({
        where: {
          hospitalId_name: {
            hospitalId: existingReferral.receivingHospitalId,
            name: existingReferral.targetWardName,
          },
        },
        data: { occupiedBeds: { decrement: 1 } },
      });
      this.clinicalGateway.broadcastCapacityUpdate(existingReferral.receivingHospitalId, ward);
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
        hospitalId: user.hospitalId,
      },
    });

    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Counter-referral received from ${referral.receivingHospital.name} for patient ${referral.patient.firstName} ${referral.patient.lastName}. Please review discharge notes and follow-up instructions.`,
      id,
    );

    return counterReferral;
  }

  /**
   * Unified Discharge: marks referral as DISCHARGED and optionally creates
   * a counter-referral with follow-up instructions + evidence URL.
   */
  async discharge(id: string, dto: any, user: any) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: { referringHospital: true, receivingHospital: true, patient: true },
    });
    if (!referral) throw new BadRequestException('Referral not found');
    if (referral.status !== 'ADMITTED') {
      throw new BadRequestException('Only ADMITTED referrals can be discharged.');
    }

    // Free up the bed
    if (referral.targetWardName) {
      await this.prisma.ward.update({
        where: { hospitalId_name: { hospitalId: referral.receivingHospitalId, name: referral.targetWardName } },
        data: { occupiedBeds: { decrement: 1 } },
      });
    }

    const newStatus = dto.counterRefer ? 'COUNTER_REFERRED' : 'DISCHARGED';

    // Create counter-referral record if requested
    if (dto.counterRefer) {
      await this.prisma.counterReferral.create({
        data: {
          referralId: id,
          dischargeNotes: dto.dischargeNotes,
          followUpInstructions: dto.followUpInstructions,
          evidenceUrl: dto.evidenceUrl,
        },
      });
    }

    const updated = await this.prisma.referral.update({
      where: { id },
      data: { status: newStatus as any },
      include: { referringHospital: true, receivingHospital: true, patient: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: `PATIENT_DISCHARGED`,
        entity: 'Referral',
        entityId: id,
        referralId: id,
        performedById: user.id,
        hospitalId: user.hospitalId,
        details: `Patient discharged. Status set to ${newStatus}`,
      },
    });

    await this.notificationsService.notifyHospitalStaff(
      referral.referringHospitalId,
      `Patient ${referral.patient.firstName} ${referral.patient.lastName} has been discharged from ${referral.receivingHospital.name}.${dto.counterRefer ? ' A counter-referral has been submitted.' : ''}`,
      id,
    );

    return updated;
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
    doc.text(`Address: ${[referral.patient.cell ? `Cell: ${referral.patient.cell}` : '', referral.patient.sector ? `Sector: ${referral.patient.sector}` : '', referral.patient.district ? `District: ${referral.patient.district}` : ''].filter(Boolean).join(', ') || 'N/A'}`);
    doc.moveDown();

    doc.fillColor("#1e40af").fontSize(12).text("CLINICAL SUMMARY");
    doc.fillColor("#000000").fontSize(10);
    doc.text(`Primary Diagnosis: ${referral.diagnosis}`);
    if (referral.significantFindings) {
      doc.text(`Significant Findings: ${referral.significantFindings}`);
    }
    if (referral.proceduresReceived) {
      doc.text(`Procedures & Treatments Received: ${referral.proceduresReceived}`);
    }
    if (referral.currentMedications) {
      doc.text(`Current Medications: ${referral.currentMedications}`);
    }
    if (referral.patientCondition) {
      doc.text(`Immediate Condition: ${referral.patientCondition}`);
    }
    doc.text(`Reason for Transfer: ${referral.reasonForTransfer}`);
    if (referral.preTransferTreatment) {
      doc.text(`Pre-Transfer Treatment: ${referral.preTransferTreatment}`);
    }
    doc.text(`Transport: ${referral.transportType || "AMBULANCE"}`);
    if (referral.monitoringRequired) {
      doc.text(`Transport Monitoring: ${referral.monitoringRequired}`);
    }
    doc.moveDown();

    doc.fillColor("#1e40af").fontSize(12).text("TRANSFER CHAIN");
    doc.fillColor("#000000").fontSize(10);
    doc.text(`Referring Hospital: ${referral.referringHospital.name} (${referral.referringHospital.location})`);
    doc.text(`Receiving Hospital: ${referral.receivingHospital.name} (${referral.receivingHospital.location})`);
    if (referral.targetWardName) {
      doc.text(`Ward: ${referral.targetWardName}`);
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
