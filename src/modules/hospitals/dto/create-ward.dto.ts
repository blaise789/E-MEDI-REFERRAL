import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateWardDto {
  @ApiProperty({ example: 'ICU' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  totalBeds: number;
}
