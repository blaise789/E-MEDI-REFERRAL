import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClinicalGateway } from '../hospitals/clinical.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ClinicalGateway,
  ) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Send a notification to a single user.
   */
  async dispatchNotification(recipientId: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { recipientId, message },
    });

    // Broadcast live
    this.gateway.broadcastNotification(recipientId, {
      id: notification.id,
      message,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * Send a notification to all staff at a given hospital.
   * Used when a referral is submitted, accepted, rejected, etc.
   */
  async notifyHospitalStaff(hospitalId: string, message: string) {
    const users = await this.prisma.user.findMany({
      where: { hospitalId },
      select: { id: true },
    });

    if (users.length === 0) return;

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        recipientId: user.id,
        message,
      })),
    });

    // Broadcast to all (could be optimized with rooms)
    users.forEach((user) => {
      this.gateway.broadcastNotification(user.id, {
        message,
        hospitalId,
      });
    });
  }
}
