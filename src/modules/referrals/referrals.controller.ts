import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { CreateCounterReferralDto } from './dto/create-counter-referral.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReferralStatus } from '@prisma/client';

import { RolesGuard } from '../../guards/roles.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CheckPolicies } from '../../decorators/policies.decorator';
import { Action } from '../casl/casl-ability.factory';
import { Role } from '@prisma/client';

@ApiTags('referrals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, PoliciesGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @ApiOperation({
    summary: 'Submit a new referral',
    description: 'Creates a new patient referral by specifying the referring hospital (referringHospitalId) and the receiving hospital (receivingHospitalId), along with patient details, urgency level, diagnosis, and reason for transfer.',
  })
  @ApiResponse({ status: 201, description: 'Referral created successfully.' })
  @Roles(Role.CLINICIAN, Role.SYS_ADMIN)
  @CheckPolicies((ability) => ability.can(Action.Create, 'Referral'))
  @Post()
  create(@Body() createReferralDto: CreateReferralDto, @Req() req) {
    return this.referralsService.create(createReferralDto, req.user);
  }

  @ApiOperation({
    summary: 'List referrals',
    description: 'Returns all referrals. Optionally filter by hospital ID to see only referrals sent or received by a specific facility. Includes patient, hospital, and counter-referral details.',
  })
  @ApiQuery({ name: 'hospitalId', required: false, description: 'Filter referrals by sending or receiving hospital' })
  @ApiResponse({ status: 200, description: 'List of referrals returned.' })
  @Get()
  findAll(@Query('hospitalId') hospitalId?: string) {
    return this.referralsService.findAll(hospitalId);
  }

  @ApiOperation({
    summary: 'Update referral status',
    description: 'Transitions a referral to a new status: ACCEPTED, REJECTED, IN_TRANSIT, or ADMITTED. Each transition is logged in the audit trail.',
  })
  @ApiParam({ name: 'id', description: 'Referral UUID' })
  @ApiResponse({ status: 200, description: 'Referral status updated.' })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Referral'))
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ReferralStatus, @Req() req) {
    return this.referralsService.updateStatus(id, status, req.user);
  }

  @ApiOperation({
    summary: 'Submit a counter-referral',
    description: 'Completes the referral feedback loop by providing discharge notes and follow-up instructions from the receiving hospital back to the referring district hospital. This is a key INHSRG requirement for continuity of care.',
  })
  @ApiParam({ name: 'id', description: 'Referral UUID' })
  @ApiResponse({ status: 201, description: 'Counter-referral created. Referral status set to COUNTER_REFERRED.' })
  @Post(':id/counter')
  addCounterReferral(@Param('id') id: string, @Body() dto: CreateCounterReferralDto, @Req() req) {
    return this.referralsService.addCounterReferral(id, dto, req.user);
  }
}
