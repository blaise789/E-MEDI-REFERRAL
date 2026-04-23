import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RecalibrateBedDto {
  @ApiProperty({ description: 'The absolute ground-truth number of occupied beds in this ward.' })
  @IsInt()
  @Min(0)
  occupiedBeds: number;
}
