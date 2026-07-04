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

  @ApiProperty({ required: false, enum: TransportType, default: TransportType.AMBULANCE })
  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;
}
