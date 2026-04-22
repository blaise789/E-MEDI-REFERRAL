import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
    description: 'Creates a new patient record with national ID, name, date of birth, gender, and contact number.',
  })
  @ApiResponse({ status: 201, description: 'Patient registered successfully.' })
  @ApiResponse({ status: 409, description: 'Patient with this national ID already exists.' })
  @Roles(Role.CLINICIAN, Role.SYS_ADMIN)
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @ApiOperation({ summary: 'List all patients' })
  @ApiResponse({ status: 200, description: 'List of patients returned.' })
  @Roles(Role.CLINICIAN, Role.FOCAL_PERSON, Role.HOSPITAL_ADMIN, Role.SYS_ADMIN)
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @ApiOperation({
    summary: 'Get a patient by ID',
    description: 'Returns patient details along with their referral history.',
  })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({ status: 200, description: 'Patient returned.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @Roles(Role.CLINICIAN, Role.FOCAL_PERSON, Role.HOSPITAL_ADMIN, Role.SYS_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }
}
