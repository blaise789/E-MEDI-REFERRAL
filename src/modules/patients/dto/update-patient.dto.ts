import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class UpdatePatientDto {
  @ApiProperty({ required: false, example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Mugabo' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: '1998-05-12' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

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
