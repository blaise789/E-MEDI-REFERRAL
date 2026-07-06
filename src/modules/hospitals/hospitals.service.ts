import {
  HttpException,
  HttpStatus,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateHospitalDto } from "./dto/create-hospital.dto";
import { CreateWardDto } from "./dto/create-ward.dto";
import { AddSpecialistDto } from "./dto/add-specialist.dto";
import { UpdateSpecialistDto } from "./dto/update-specialist.dto";
import { SpecialistStatus } from "@prisma/client";
import { CaslAbilityFactory, Action } from "../casl/casl-ability.factory";
import { subject } from "@casl/ability";
import { ClinicalGateway } from "./clinical.gateway";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class HospitalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly clinicalGateway: ClinicalGateway,
    private readonly audit: AuditService,
  ) {}

  /**
   * Register a new hospital (District or National Referral).
   */
  async create(createHospitalDto: CreateHospitalDto, user: any) {
    const existing = await this.prisma.hospital.findUnique({
      where: { name: createHospitalDto.name },
    });
    if (existing) {
      throw new HttpException(
        "Hospital with this name already exists",
        HttpStatus.CONFLICT,
      );
    }
    const hospital = await this.prisma.hospital.create({
      data: createHospitalDto,
    });

    await this.audit.logAction({
      action: "REGISTERED_HOSPITAL",
      entity: "Hospital",
      entityId: hospital.id,
      details: `Registered new hospital facility: ${hospital.name} (${hospital.level})`,
      performedById: user.id,
      hospitalId: null, // Purely system-level!
    });

    return hospital;
  }

  /**
   * List all registered hospitals.
   */
  async findAll() {
    return this.prisma.hospital.findMany({
      include: {
        wards: true,
        specialists: true,
        _count: {
          select: {
            referralsSent: true,
            referralsReceived: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get a single hospital by ID with full details.
   */
  async findOne(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        wards: true,
        specialists: true,
      },
    });
    if (!hospital) {
      throw new HttpException("Hospital not found", HttpStatus.NOT_FOUND);
    }
    return hospital;
  }

  /**
   * Real-time dashboard: bed occupancy + specialist availability.
   */
  async getDashboard(hospitalId: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospital) {
      throw new HttpException("Hospital not found", HttpStatus.NOT_FOUND);
    }

    const wards = await this.prisma.ward.findMany({
      where: { hospitalId },
    });
    const specialists = await this.prisma.specialist.findMany({
      where: { hospitalId },
    });

    // Compute summary
    const totalBeds = wards.reduce((sum, b) => sum + b.totalBeds, 0);
    const occupiedBeds = wards.reduce((sum, b) => sum + b.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;

    return {
      hospital: { id: hospital.id, name: hospital.name, level: hospital.level },
      bedSummary: { totalBeds, occupiedBeds, availableBeds },
      wards,
      specialists,
    };
  }

  /**
   * Add a ward configuration to a hospital.
   */
  async addWard(hospitalId: string, dto: CreateWardDto, user: any) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (
      !ability.can(Action.Manage, subject("Ward" as any, { hospitalId } as any))
    ) {
      throw new ForbiddenException(
        "You are not authorized to manage wards for this hospital",
      );
    }

    const existing = await this.prisma.ward.findUnique({
      where: {
        hospitalId_name: {
          hospitalId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new HttpException(
        `Ward ${dto.name} already exists for this facility. Update the existing ward instead.`,
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.ward.create({
      data: {
        hospitalId,
        name: dto.name,
        totalBeds: dto.totalBeds,
      },
    });
  }

  /**
   * Update the occupied bed count for a specific ward.
   */
  async updateWardOccupancy(wardId: string, occupiedBeds: number, user: any) {
    const ward = await this.prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) throw new HttpException("Ward not found", HttpStatus.NOT_FOUND);

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Manage, subject("Ward" as any, ward as any))) {
      throw new ForbiddenException(
        "You are not authorized to update wards for this hospital",
      );
    }

    const updated = await this.prisma.ward.update({
      where: { id: wardId },
      data: { occupiedBeds },
    });

    this.clinicalGateway.broadcastCapacityUpdate(updated.hospitalId, updated);
    return updated;
  }

  /**
   * Manually force a specific bed occupancy (Admin Override).
   */
  async recalibrateWardOccupancy(
    wardId: string,
    occupiedBeds: number,
    user: any,
  ) {
    const ability = this.caslAbilityFactory.createForUser(user);
    const ward = await this.prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) throw new HttpException("Ward not found", HttpStatus.NOT_FOUND);

    if (!ability.can(Action.Manage, subject("Ward" as any, ward as any))) {
      throw new ForbiddenException(
        "You are not authorized to recalibrate wards for this hospital",
      );
    }

    const updated = await this.prisma.ward.update({
      where: { id: wardId },
      data: { occupiedBeds },
    });

    this.clinicalGateway.broadcastCapacityUpdate(updated.hospitalId, updated);
    return updated;
  }

  /**
   * Register a new specialist under a hospital.
   */
  async addSpecialist(hospitalId: string, dto: AddSpecialistDto, user: any) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (
      !ability.can(Action.Manage, subject("Specialist", { hospitalId } as any))
    ) {
      throw new ForbiddenException(
        "You are not authorized to add specialists for this hospital",
      );
    }

    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(); // e.g., 'MONDAY'
    const currentHour = now.toTimeString().substring(0, 5); // e.g., '14:30'

    let initialStatus: 'AVAILABLE' | 'UNAVAILABLE' = 'UNAVAILABLE';
    if (dto.workingDays && dto.workingDays.includes(currentDay)) {
      if (dto.shiftStartTime && dto.shiftEndTime) {
        if (currentHour >= dto.shiftStartTime && currentHour <= dto.shiftEndTime) {
          initialStatus = 'AVAILABLE';
        }
      } else {
        initialStatus = 'AVAILABLE';
      }
    }

    return this.prisma.specialist.create({
      data: {
        hospitalId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        wardId: dto.wardId,
        discipline: dto.discipline,
        status: initialStatus,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
        workingDays: dto.workingDays,
      },
    });
  }

  /**
   * Update specialist details (name, discipline, schedule, ward assignment).
   */
  async updateSpecialist(
    specialistId: string,
    dto: UpdateSpecialistDto,
    user: any,
  ) {
    const specialist = await this.prisma.specialist.findUnique({
      where: { id: specialistId },
    });
    if (!specialist)
      throw new HttpException("Specialist not found", HttpStatus.NOT_FOUND);

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Manage, subject("Specialist", specialist as any))) {
      throw new ForbiddenException(
        "You are not authorized to update specialists for this hospital",
      );
    }

    const updated = await this.prisma.specialist.update({
      where: { id: specialistId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        wardId: dto.wardId,
        discipline: dto.discipline,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
        workingDays: dto.workingDays,
      },
    });

    this.clinicalGateway.broadcastSpecialistUpdate(updated.hospitalId, updated);
    return updated;
  }

  /**
   * Toggle a specialist's availability status.
   */
  async updateSpecialistStatus(
    specialistId: string,
    status: SpecialistStatus,
    user: any,
  ) {
    const specialist = await this.prisma.specialist.findUnique({
      where: { id: specialistId },
    });
    if (!specialist)
      throw new HttpException("Specialist not found", HttpStatus.NOT_FOUND);

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Manage, subject("Specialist", specialist as any))) {
      throw new ForbiddenException(
        "You are not authorized to update specialists for this hospital",
      );
    }

    const updated = await this.prisma.specialist.update({
      where: { id: specialistId },
      data: { status },
    });

    this.clinicalGateway.broadcastSpecialistUpdate(updated.hospitalId, updated);
    return updated;
  }

  /**
   * Remove a ward from a hospital.
   */
  async removeWard(wardId: string, user: any) {
    const ward = await this.prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) throw new HttpException("Ward not found", HttpStatus.NOT_FOUND);

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Manage, subject("Ward" as any, ward as any))) {
      throw new ForbiddenException(
        "You are not authorized to manage wards for this hospital",
      );
    }

    return this.prisma.ward.delete({ where: { id: wardId } });
  }
}
