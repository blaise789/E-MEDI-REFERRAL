import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Get referral performance metrics',
    description: 'Returns core monitoring indicators: total referrals, acceptance rate, counter-referral rate. Filter by hospital.',
  })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiResponse({ status: 200 })
  @Get('metrics')
  getMetrics(@Query('hospitalId') hospitalId?: string) {
    return this.reportsService.getMetrics(hospitalId);
  }

  @ApiOperation({
    summary: 'System-wide dashboard (SYS_ADMIN)',
    description: 'Returns aggregate stats across all hospitals: total referrals by status, bed occupancy, patient count, hospital summary.',
  })
  @ApiResponse({ status: 200 })
  @Roles(Role.SYS_ADMIN)
  @Get('dashboard')
  getSystemDashboard() {
    return this.reportsService.getSystemDashboard();
  }

  @ApiOperation({
    summary: 'Get filtered audit logs',
    description: 'Returns audit trail. HOSPITAL_ADMIN gets their hospital\'s logs; SYS_ADMIN gets all. Filter by date range.',
  })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200 })
  @Roles(Role.HOSPITAL_ADMIN, Role.FOCAL_PERSON, Role.SYS_ADMIN)
  @Get('audit')
  getAuditLogs(
    @Query('hospitalId') hospitalId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAuditLogs(hospitalId, startDate, endDate);
  }

  @ApiOperation({
    summary: 'Export referrals as CSV',
    description: 'Downloads a CSV file of all referrals, optionally filtered by hospital.',
  })
  @ApiQuery({ name: 'hospitalId', required: false })
  @Roles(Role.HOSPITAL_ADMIN, Role.FOCAL_PERSON, Role.SYS_ADMIN)
  @Get('referrals/export')
  exportCsv(
    @Query('hospitalId') hospitalId: string,
    @Res() res: Response,
  ) {
    return this.reportsService.exportReferralsCsv(hospitalId, res);
  }
}
