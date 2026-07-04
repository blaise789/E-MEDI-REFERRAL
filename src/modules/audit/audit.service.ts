import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 recent logs
    });
  }
  async logAction(params: {
    action: string;
    entity?: string;
    entityId?: string;
    details?: string;
    performedById?: string;
    hospitalId?: string | null;
    referralId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: params,
    });
  }
}
