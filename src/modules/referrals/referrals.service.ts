import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { CreateCounterReferralDto } from './dto/create-counter-referral.dto';
import { ReferralStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { CaslAbilityFactory, Action } from '../casl/casl-ability.factory';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
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

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'REFERRAL_CREATED',
        entity: 'Referral',
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

  async updateStatus(id: string, status: ReferralStatus, user: any) {
    const existingReferral = await this.prisma.referral.findUnique({
      where: { id },
    });

    if (!existingReferral) {
      throw new ForbiddenException('Referral not found');
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Update, existingReferral as any)) {
      throw new ForbiddenException('You are not authorized to update this referral');
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

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: `STATUS_CHANGED_TO_${status}`,
        entity: 'Referral',
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

  async addCounterReferral(id: string, createCounterReferralDto: CreateCounterReferralDto, user: any) {
    const existingReferral = await this.prisma.referral.findUnique({
      where: { id },
    });

    if (!existingReferral) {
      throw new ForbiddenException('Referral not found');
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Update, existingReferral as any)) {
      throw new ForbiddenException('You are not authorized to add a counter-referral to this referral');
    }

    const counterReferral = await this.prisma.counterReferral.create({
      data: {
        ...createCounterReferralDto,
        referralId: id,
      },
    });

    const referral = await this.prisma.referral.update({
      where: { id },
      data: { status: 'COUNTER_REFERRED' },
      include: {
        referringHospital: true,
        receivingHospital: true,
        patient: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'COUNTER_REFERRAL_CREATED',
        entity: 'CounterReferral',
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
}
