import { ApiProperty } from '@nestjs/swagger';
import { HospitalLevel } from '@prisma/client';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateHospitalDto {
  @ApiProperty({ example: 'Nyamata District Hospital' })
  @IsString()
  name: string;

  @ApiProperty({ enum: HospitalLevel, example: 'DISTRICT', description: 'DISTRICT or REFERRAL' })
  @IsEnum(HospitalLevel)
  level: HospitalLevel;

  @ApiProperty({ example: 'Bugesera District, Eastern Province' })
  @IsString()
  location: string;

  @ApiProperty({ required: false, example: '+250788000000' })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}
