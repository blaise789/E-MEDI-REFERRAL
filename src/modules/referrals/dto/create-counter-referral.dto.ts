import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCounterReferralDto {
  @ApiProperty()
  @IsString()
  dischargeNotes: string;

  @ApiProperty()
  @IsString()
  followUpInstructions: string;
}
