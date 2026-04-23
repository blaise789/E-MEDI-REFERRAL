import { ApiProperty } from '@nestjs/swagger';
import { ReferralUrgency } from '@prisma/client';
import { IsString, IsEnum, IsOptional } from 'class-validator';

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

  @ApiProperty({ enum: ReferralUrgency })
  @IsEnum(ReferralUrgency)
  urgency: ReferralUrgency;
  
  @ApiProperty({ enum: ['GENERAL_MEDICAL', 'SURGICAL', 'ICU', 'HDU', 'PAEDIATRICS', 'MATERNITY', 'EMERGENCY_DEPT'] })
  @IsOptional()
  @IsEnum(['GENERAL_MEDICAL', 'SURGICAL', 'ICU', 'HDU', 'PAEDIATRICS', 'MATERNITY', 'EMERGENCY_DEPT'])
  targetWardType?: any;

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
  transportType?: string;
}
