import { ApiProperty } from '@nestjs/swagger';
import { WardType } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class AddBedCapacityDto {
  @ApiProperty({ enum: WardType, example: 'ICU' })
  @IsEnum(WardType)
  wardType: WardType;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  totalBeds: number;
}
