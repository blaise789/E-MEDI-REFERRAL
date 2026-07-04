import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreatePatientDto, user: any) {
    const existing = await this.prisma.patient.findUnique({
      where: { nationalId: dto.nationalId },
    });
    if (existing) {
      throw new HttpException('Patient with this national ID already exists', HttpStatus.CONFLICT);
    }
    const patient = await this.prisma.patient.create({
      data: {
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
        hospitalId: dto.hospitalId || user.hospitalId,
      },
    });

    await this.audit.logAction({
      action: 'Registered Patient',
      entity: 'Patient',
      entityId: patient.id,
      details: `Registered ${patient.firstName} ${patient.lastName} (ID: ${patient.nationalId})`,
      performedById: user.id,
      hospitalId: user.hospitalId,
    });

    return patient;
  }

  async findAll(search?: string, hospitalId?: string) {
    return this.prisma.patient.findMany({
      where: {
        isActive: true,
        ...(hospitalId ? { hospitalId } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { nationalId: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        referrals: {
          include: {
            referringHospital: true,
            receivingHospital: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, user: any) {
    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
      },
    });

    await this.audit.logAction({
      action: 'Updated Patient Profile',
      entity: 'Patient',
      entityId: patient.id,
      details: `Updated details for ${patient.firstName} ${patient.lastName}`,
      performedById: user.id,
      hospitalId: user.hospitalId,
    });

    return patient;
  }

  async deactivate(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    return this.prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
