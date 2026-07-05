import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class DischargeReferralDto {
  /** Optional discharge summary notes */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dischargeNotes?: string;

  /** Whether to create a counter-referral back to the originating hospital */
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  counterRefer?: boolean;

  /** Follow-up instructions (required if counterRefer = true) */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  /** URL of the uploaded evidence file (PDF/image) */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}
