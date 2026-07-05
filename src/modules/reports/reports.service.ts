import { Injectable } from '@nestjs/common';
import { Response } from 'express';
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
    const counterReferrals = await this.prisma.counterReferral.count({ where: { referral: whereClause } });
    const submittedReferrals = await this.prisma.referral.count({ where: { ...whereClause, status: 'SUBMITTED' } });
    const admittedReferrals = await this.prisma.referral.count({ where: { ...whereClause, status: 'ADMITTED' } });

    const counterReferralRate = totalReferrals > 0 ? (counterReferrals / totalReferrals) * 100 : 0;
    const admissionRate = totalReferrals > 0 ? (admittedReferrals / totalReferrals) * 100 : 0;

    // 1. Bed Occupancy Rate Data by Ward Type
    const bedOccupancies = hospitalId
      ? await this.prisma.ward.findMany({ where: { hospitalId } })
      : await this.prisma.ward.findMany();

    const totals: Record<string, { occupied: number; total: number }> = {};
    for (const b of bedOccupancies) {
      if (!totals[b.name]) totals[b.name] = { occupied: 0, total: 0 };
      totals[b.name].occupied += b.occupiedBeds;
      totals[b.name].total += b.totalBeds;
    }

    const bedOccupancyData = Object.entries(totals).map(([ward, counts]) => ({
      name: ward,
      "Occupied Beds": counts.occupied,
      "Total Beds": counts.total,
      rate: counts.total > 0 ? Math.round((counts.occupied / counts.total) * 100) : 0
    }));

    // 2. Referral Volume Data by Day of the Week (Last 7 days)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const referralVolumeData = dayNames.map(name => ({ name, referrals: 0, admitted: 0 }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReferrals = await this.prisma.referral.findMany({
      where: { ...whereClause, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true }
    });

    for (const r of recentReferrals) {
      const dayIdx = r.createdAt.getDay();
      const dayName = dayNames[dayIdx];
      const chartRow = referralVolumeData.find(row => row.name === dayName);
      if (chartRow) {
        chartRow.referrals += 1;
        if (r.status === "ADMITTED") {
          chartRow.admitted += 1;
        }
      }
    }

    return {
      totalReferrals,
      counterReferrals,
      submittedReferrals,
      admittedReferrals,
      bedOccupancyData,
      referralVolumeData,
      metrics: {
        counterReferralRate: `${counterReferralRate.toFixed(2)}%`,
        admissionRate: `${admissionRate.toFixed(2)}%`,
      }
    };
  }

  /**
   * System-wide dashboard for SYS_ADMIN.
   */
  async getSystemDashboard() {
    const [
      totalHospitals,
      totalPatients,
      totalReferrals,
      totalUsers,
      referralsByStatus,
      hospitals,
    ] = await Promise.all([
      this.prisma.hospital.count(),
      this.prisma.patient.count({ where: { isActive: true } }),
      this.prisma.referral.count(),
      this.prisma.user.count(),
      this.prisma.referral.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.hospital.findMany({
        include: {
          wards: true,
          _count: { select: { referralsSent: true, referralsReceived: true } },
        },
      }),
    ]);

    const totalBeds = hospitals.reduce((sum, h) => sum + h.wards.reduce((s, b) => s + b.totalBeds, 0), 0);
    const occupiedBeds = hospitals.reduce((sum, h) => sum + h.wards.reduce((s, b) => s + b.occupiedBeds, 0), 0);

    return {
      totalHospitals,
      totalPatients,
      totalReferrals,
      totalUsers,
      bedSummary: { totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds },
      referralsByStatus: referralsByStatus.map(r => ({ status: r.status, count: r._count.id })),
      hospitalSummary: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        level: h.level,
        sentCount: h._count.referralsSent,
        receivedCount: h._count.referralsReceived,
        bedOccupancy: {
          total: h.wards.reduce((s, b) => s + b.totalBeds, 0),
          occupied: h.wards.reduce((s, b) => s + b.occupiedBeds, 0),
        },
      })),
    };
  }

  /**
   * Filtered audit log for HOSPITAL_ADMIN (scoped) and SYS_ADMIN (all).
   */
  async getAuditLogs(hospitalId?: string, startDate?: string, endDate?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(hospitalId 
          ? { 
              OR: [
                { hospitalId: hospitalId }, 
                { referral: { OR: [{ referringHospitalId: hospitalId }, { receivingHospitalId: hospitalId }] } }
              ] 
            } 
          : { hospitalId: null } // System logs have no hospital
        ),
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          }
        } : {}),
      },
      include: {
        performedBy: { select: { firstName: true, lastName: true, role: true, hospitalId: true } },
        referral: {
          select: {
            id: true,
            patient: { select: { firstName: true, lastName: true, nationalId: true } },
            referringHospital: { select: { name: true } },
            receivingHospital: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  /**
   * Export referrals as CSV/Excel-compatible data.
   * Returns JSON array that can be streamed; the controller writes it as CSV.
   */
  async exportReferralsCsv(hospitalId?: string, res?: Response) {
    const referrals = await this.prisma.referral.findMany({
      where: hospitalId
        ? { OR: [{ referringHospitalId: hospitalId }, { receivingHospitalId: hospitalId }] }
        : undefined,
      include: {
        patient: true,
        referringHospital: true,
        receivingHospital: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Referral ID', 'Patient Name', 'National ID', 'Gender', 'DOB',
      'Diagnosis', 'Status', 'From Hospital', 'To Hospital',
      'Target Ward', 'Transport', 'Date Created',
    ];

    const rows = referrals.map(r => [
      r.id.substring(0, 8),
      `${r.patient.firstName} ${r.patient.lastName}`,
      r.patient.nationalId,
      r.patient.gender,
      r.patient.dateOfBirth.toISOString().split('T')[0],
      r.diagnosis,
      r.status,
      r.referringHospital.name,
      r.receivingHospital.name,
      r.targetWardName || '',
      r.transportType || 'AMBULANCE',
      r.createdAt.toISOString().split('T')[0],
    ]);

    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    if (res) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=referrals.csv');
      res.send(csv);
    }

    return csv;
  }
}
