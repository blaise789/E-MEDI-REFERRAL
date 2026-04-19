import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Get referral performance metrics',
    description: 'Returns INHSRG core monitoring indicators: total referrals, counter-referral count, accepted/rejected counts, counter-referral rate, and acceptance rate. Optionally filter by hospital.',
  })
  @ApiQuery({ name: 'hospitalId', required: false, description: 'Filter metrics by hospital UUID' })
  @ApiResponse({ status: 200, description: 'Metrics returned.' })
  @Get('metrics')
  getMetrics(@Query('hospitalId') hospitalId?: string) {
    return this.reportsService.getMetrics(hospitalId);
  }
}
