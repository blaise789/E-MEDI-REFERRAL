import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { CreateCounterReferralDto } from './dto/create-counter-referral.dto';
import { ReferralStatus } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReferralDto: CreateReferralDto, userId: string) {
    const referral = await this.prisma.referral.create({
      data: {
        ...createReferralDto,
        initiatedById: userId,
      },
    });

    // Automatically log this action
    await this.prisma.auditLog.create({
      data: {
        action: 'REFERRAL_CREATED',
        entity: 'Referral',
        entityId: referral.id,
        referralId: referral.id,
        performedById: userId,
        details: `Referral submitted from ${createReferralDto.referringHospitalId} to ${createReferralDto.receivingHospitalId}`,
      },
    });

    return referral;
  }

  async findAll(hospitalId?: string) {
    return this.prisma.referral.findMany({
      where: hospitalId ? {
        OR: [
          { referringHospitalId: hospitalId },
          { receivingHospitalId: hospitalId },
        ],
      } : undefined,
      include: {
        patient: true,
        receivingHospital: true,
        referringHospital: true,
        counterReferral: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: ReferralStatus, userId: string) {
    const referral = await this.prisma.referral.update({
      where: { id },
      data: { status },
    });

    await this.prisma.auditLog.create({
      data: {
        action: `STATUS_CHANGED_TO_${status}`,
        entity: 'Referral',
        entityId: referral.id,
        referralId: referral.id,
        performedById: userId,
      },
    });

    return referral;
  }

  async addCounterReferral(id: string, createCounterReferralDto: CreateCounterReferralDto, userId: string) {
    const counterReferral = await this.prisma.counterReferral.create({
      data: {
        ...createCounterReferralDto,
        referralId: id,
      },
    });

    await this.prisma.referral.update({
      where: { id },
      data: { status: 'COUNTER_REFERRED' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'COUNTER_REFERRAL_CREATED',
        entity: 'CounterReferral',
        entityId: counterReferral.id,
        referralId: id,
        performedById: userId,
      },
    });

    return counterReferral;
  }
}
