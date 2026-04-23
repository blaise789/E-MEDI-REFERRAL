import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ required: false, example: '1199880012345678' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mugabo' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1998-05-12' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  gender: string;

  @ApiProperty({ required: false, example: 'RSSB (RAMA)' })
  @IsOptional()
  @IsString()
  insurance?: string;

  @ApiProperty({ required: false, example: '+250788123456' })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}
