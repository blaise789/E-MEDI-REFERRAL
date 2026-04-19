import { Controller, Get, Post, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { AddBedCapacityDto } from './dto/add-bed-capacity.dto';
import { AddSpecialistDto } from './dto/add-specialist.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SpecialistStatus } from '@prisma/client';

@ApiTags('hospitals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  // ──────────────────────────────── Hospital Registration ────────────────────────────────

  @ApiOperation({
    summary: 'Register a new hospital',
    description: 'Creates a new district or national referral hospital record. Use DISTRICT for Nyamata, Masaka, Nyarugenge and NATIONAL_REFERRAL for CHUK, RMH.',
  })
  @ApiResponse({ status: 201, description: 'Hospital created successfully.' })
  @ApiResponse({ status: 409, description: 'Hospital with this name already exists.' })
  @Post()
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(createHospitalDto);
  }

  @ApiOperation({
    summary: 'List all registered hospitals',
    description: 'Returns all hospitals with their bed configurations, specialists, and referral counts.',
  })
  @ApiResponse({ status: 200, description: 'List of hospitals returned.' })
  @Get()
  findAll() {
    return this.hospitalsService.findAll();
  }

  @ApiOperation({
    summary: 'Get a single hospital by ID',
    description: 'Returns full hospital details including beds and specialists.',
  })
  @ApiParam({ name: 'id', description: 'Hospital UUID' })
  @ApiResponse({ status: 200, description: 'Hospital returned.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  // ──────────────────────────────── Real-Time Dashboard ────────────────────────────────

  @ApiOperation({
    summary: 'Get real-time capacity dashboard',
    description: 'Returns bed occupancy by ward (ICU, HDU, Surgical, Maternity, etc.) and specialist on-duty/on-call status for a hospital. Used by referring clinicians to check receiving facility readiness before initiating a transfer.',
  })
  @ApiParam({ name: 'hospitalId', description: 'Hospital UUID' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  @Get('dashboard/:hospitalId')
  getDashboard(@Param('hospitalId') hospitalId: string) {
    return this.hospitalsService.getDashboard(hospitalId);
  }

  // ──────────────────────────────── Bed Capacity Management ────────────────────────────────

  @ApiOperation({
    summary: 'Add a ward/bed configuration to a hospital',
    description: 'Configures bed capacity for a specific ward type (e.g. ICU, MATERNITY, SURGICAL) at a hospital.',
  })
  @ApiParam({ name: 'hospitalId', description: 'Hospital UUID' })
  @ApiResponse({ status: 201, description: 'Bed capacity added.' })
  @Post(':hospitalId/beds')
  addBedCapacity(@Param('hospitalId') hospitalId: string, @Body() dto: AddBedCapacityDto) {
    return this.hospitalsService.addBedCapacity(hospitalId, dto);
  }

  @ApiOperation({
    summary: 'Update bed occupancy for a ward',
    description: 'Updates the number of occupied beds. Used by receiving facility administrators to keep the dashboard current.',
  })
  @ApiParam({ name: 'bedId', description: 'BedCapacity UUID' })
  @ApiResponse({ status: 200, description: 'Bed occupancy updated.' })
  @Patch('beds/:bedId')
  updateBedCapacity(@Param('bedId') bedId: string, @Body('occupiedBeds') occupiedBeds: number) {
    return this.hospitalsService.updateBedCapacity(bedId, occupiedBeds);
  }

  // ──────────────────────────────── Specialist Management ────────────────────────────────

  @ApiOperation({
    summary: 'Register a specialist under a hospital',
    description: 'Adds a specialist doctor (e.g. General Surgery, Internal Medicine) to a hospital roster.',
  })
  @ApiParam({ name: 'hospitalId', description: 'Hospital UUID' })
  @ApiResponse({ status: 201, description: 'Specialist registered.' })
  @Post(':hospitalId/specialists')
  addSpecialist(@Param('hospitalId') hospitalId: string, @Body() dto: AddSpecialistDto) {
    return this.hospitalsService.addSpecialist(hospitalId, dto);
  }

  @ApiOperation({
    summary: 'Update specialist availability status',
    description: 'Changes a specialist status to AVAILABLE, IN_THEATRE, ON_CALL, or UNAVAILABLE. Reflected on the real-time dashboard.',
  })
  @ApiParam({ name: 'specialistId', description: 'Specialist UUID' })
  @ApiResponse({ status: 200, description: 'Specialist status updated.' })
  @Patch('specialists/:specialistId')
  updateSpecialistStatus(
    @Param('specialistId') specialistId: string,
    @Body('status') status: SpecialistStatus,
  ) {
    return this.hospitalsService.updateSpecialistStatus(specialistId, status);
  }
}
