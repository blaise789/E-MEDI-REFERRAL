import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEmail } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: '1199880012345678' })
  @IsNotEmpty({ message: 'National ID is required' })
  @IsString()
  nationalId: string;

  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mugabo' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1998-05-12' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsNotEmpty()
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

  @ApiProperty({ required: false, example: 'patient@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: 'Hospital that registered this patient' })
  @IsOptional()
  @IsString()
  hospitalId?: string;

  @ApiProperty({ required: false, example: 'Kigarama' })
  @IsOptional()
  @IsString()
  cell?: string;

  @ApiProperty({ required: false, example: 'Kagarama' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ required: false, example: 'Kicukiro' })
  @IsOptional()
  @IsString()
  district?: string;
}
