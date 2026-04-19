import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(hospitalId?: string) {
    const whereClause = hospitalId ? {
      OR: [
        { referringHospitalId: hospitalId },
        { receivingHospitalId: hospitalId },
      ]
    } : {};

    const totalReferrals = await this.prisma.referral.count({ where: whereClause });
    const counterReferrals = await this.prisma.counterReferral.count({
      where: {
        referral: whereClause
      }
    });

    const acceptedReferrals = await this.prisma.referral.count({
      where: { ...whereClause, status: 'ACCEPTED' }
    });

    const rejectedReferrals = await this.prisma.referral.count({
      where: { ...whereClause, status: 'REJECTED' }
    });

    const counterReferralRate = totalReferrals > 0 ? (counterReferrals / totalReferrals) * 100 : 0;
    const acceptanceRate = totalReferrals > 0 ? (acceptedReferrals / totalReferrals) * 100 : 0;

    return {
      totalReferrals,
      counterReferrals,
      acceptedReferrals,
      rejectedReferrals,
      metrics: {
        counterReferralRate: `${counterReferralRate.toFixed(2)}%`,
        acceptanceRate: `${acceptanceRate.toFixed(2)}%`,
      }
    };
  }
}
