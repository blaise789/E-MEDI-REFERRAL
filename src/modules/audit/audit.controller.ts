import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SYS_ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({
    summary: 'Get recent audit logs',
    description: 'Returns the 100 most recent audit log entries. Logs capture all referral lifecycle events: creation, status changes, counter-referrals, and bed/specialist updates. Supports full traceability for INHSRG compliance.',
  })
  @ApiResponse({ status: 200, description: 'Audit logs returned.' })
  @Get()
  getLogs() {
    return this.auditService.getLogs();
  }
}
