import { ApiProperty } from '@nestjs/swagger';
import { SpecialistDiscipline } from '@prisma/client';
import { IsString, IsEnum } from 'class-validator';

export class AddSpecialistDto {
  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mugabo' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: SpecialistDiscipline, example: 'GENERAL_SURGERY' })
  @IsEnum(SpecialistDiscipline)
  discipline: SpecialistDiscipline;
}
