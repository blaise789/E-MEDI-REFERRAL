import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @ApiOperation({
    summary: 'Register a new patient',
    description: 'Creates a new patient record. National ID is required and must be unique.',
  })
  @ApiResponse({ status: 201, description: 'Patient registered successfully.' })
  @ApiResponse({ status: 409, description: 'Patient with this national ID already exists.' })
  @Roles(Role.CLINICIAN, Role.HOSPITAL_ADMIN, Role.FOCAL_PERSON, Role.SYS_ADMIN)
  @Post()
  create(@Body() dto: CreatePatientDto, @Req() req: any) {
    return this.patientsService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'List patients', description: 'Returns active patients. Optionally filter by name/nationalId (search) or hospitalId.' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by first name, last name, or national ID' })
  @ApiQuery({ name: 'hospitalId', required: false, description: 'Filter by hospital' })
  @ApiResponse({ status: 200, description: 'List of patients returned.' })
  @Roles(Role.CLINICIAN, Role.FOCAL_PERSON, Role.HOSPITAL_ADMIN, Role.SYS_ADMIN)
  @Get()
  findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return this.patientsService.findAll(req.user, search, hospitalId);
  }

  @ApiOperation({
    summary: 'Get a patient by ID',
    description: 'Returns patient details along with their full referral history.',
  })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({ status: 200, description: 'Patient returned.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @Roles(Role.CLINICIAN, Role.FOCAL_PERSON, Role.HOSPITAL_ADMIN, Role.SYS_ADMIN)
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.findOne(req.user, id);
  }

  @ApiOperation({ summary: 'Update patient details' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({ status: 200, description: 'Patient updated.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @Roles(Role.CLINICIAN, Role.HOSPITAL_ADMIN, Role.FOCAL_PERSON, Role.SYS_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto, @Req() req: any) {
    return this.patientsService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Deactivate a patient', description: 'Soft-deletes a patient by setting isActive to false.' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({ status: 200, description: 'Patient deactivated.' })
  @Roles(Role.HOSPITAL_ADMIN, Role.SYS_ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.patientsService.deactivate(id);
  }
}
