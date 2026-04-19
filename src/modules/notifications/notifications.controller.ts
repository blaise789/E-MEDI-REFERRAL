import { Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Get current user notifications',
    description: 'Returns all notifications for the authenticated user, sorted by most recent first. Includes referral status changes, new referral assignments, and counter-referral alerts.',
  })
  @ApiResponse({ status: 200, description: 'Notifications list returned.' })
  @Get()
  getUserNotifications(@Req() req) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Sets the isRead flag to true for a specific notification.',
  })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
