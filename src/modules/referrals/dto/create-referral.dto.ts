import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

enum TransportType {
  AMBULANCE = 'AMBULANCE',
  PRIVATE = 'PRIVATE',
}

export class CreateReferralDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  referringHospitalId: string;

  @ApiProperty()
  @IsString()
  receivingHospitalId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetWardType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetSpecialistId?: string;

  @ApiProperty()
  @IsString()
  reasonForTransfer: string;

  @ApiProperty()
  @IsString()
  diagnosis: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preTransferTreatment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  significantFindings?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  proceduresReceived?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  patientCondition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  monitoringRequired?: string;

  @ApiProperty({ required: false, enum: TransportType, default: TransportType.AMBULANCE })
  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;

  @ApiProperty({ required: false, default: false, description: 'Mark as true for emergency transfers. Triggers strict compatibility checks.' })
  @IsOptional()
  isEmergency?: boolean;

  @ApiProperty({ required: false, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' })
  @IsOptional()
  @IsString()
  urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referringDoctorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referringDoctorContact?: string;

  @ApiProperty({ required: false, description: 'Expected date and time of admission' })
  @IsOptional()
  @IsString()
  expectedAdmissionDate?: string;
}
