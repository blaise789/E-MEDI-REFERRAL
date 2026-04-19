import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { AddBedCapacityDto } from './dto/add-bed-capacity.dto';
import { AddSpecialistDto } from './dto/add-specialist.dto';
import { SpecialistStatus } from '@prisma/client';

@Injectable()
export class HospitalsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new hospital (District or National Referral).
   */
  async create(createHospitalDto: CreateHospitalDto) {
    const existing = await this.prisma.hospital.findUnique({
      where: { name: createHospitalDto.name },
    });
    if (existing) {
      throw new HttpException('Hospital with this name already exists', HttpStatus.CONFLICT);
    }
    return this.prisma.hospital.create({ data: createHospitalDto });
  }

  /**
   * List all registered hospitals.
   */
  async findAll() {
    return this.prisma.hospital.findMany({
      include: {
        beds: true,
        specialists: true,
        _count: {
          select: {
            referralsSent: true,
            referralsReceived: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single hospital by ID with full details.
   */
  async findOne(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        beds: true,
        specialists: true,
      },
    });
    if (!hospital) {
      throw new HttpException('Hospital not found', HttpStatus.NOT_FOUND);
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
      throw new HttpException('Hospital not found', HttpStatus.NOT_FOUND);
    }

    const beds = await this.prisma.bedCapacity.findMany({
      where: { hospitalId },
    });
    const specialists = await this.prisma.specialist.findMany({
      where: { hospitalId },
    });

    // Compute summary
    const totalBeds = beds.reduce((sum, b) => sum + b.totalBeds, 0);
    const occupiedBeds = beds.reduce((sum, b) => sum + b.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;

    return {
      hospital: { id: hospital.id, name: hospital.name, level: hospital.level },
      bedSummary: { totalBeds, occupiedBeds, availableBeds },
      beds,
      specialists,
    };
  }

  /**
   * Add a ward/bed configuration to a hospital.
   */
  async addBedCapacity(hospitalId: string, dto: AddBedCapacityDto) {
    return this.prisma.bedCapacity.create({
      data: {
        hospitalId,
        wardType: dto.wardType,
        totalBeds: dto.totalBeds,
      },
    });
  }

  /**
   * Update the occupied bed count for a specific ward.
   */
  async updateBedCapacity(bedId: string, occupiedBeds: number) {
    return this.prisma.bedCapacity.update({
      where: { id: bedId },
      data: { occupiedBeds },
    });
  }

  /**
   * Register a new specialist under a hospital.
   */
  async addSpecialist(hospitalId: string, dto: AddSpecialistDto) {
    return this.prisma.specialist.create({
      data: {
        hospitalId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        discipline: dto.discipline,
      },
    });
  }

  /**
   * Toggle a specialist's availability status.
   */
  async updateSpecialistStatus(specialistId: string, status: SpecialistStatus) {
    return this.prisma.specialist.update({
      where: { id: specialistId },
      data: { status },
    });
  }
}
