import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray } from "class-validator";

export class AddSpecialistDto {
  @ApiProperty({ example: "Jean" })
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Mugabo" })
  @IsString()
  lastName: string;

  @ApiProperty({ example: "uuid-of-ward" })
  @IsString()
  wardId: string;

  @ApiProperty({ example: "Cardiology" })
  @IsString()
  discipline: string;

  @ApiProperty({ example: "08:00", required: false })
  @IsString()
  @IsOptional()
  shiftStartTime?: string;

  @ApiProperty({ example: "17:00", required: false })
  @IsString()
  @IsOptional()
  shiftEndTime?: string;

  @ApiProperty({ example: ["MONDAY", "TUESDAY"], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workingDays?: string[];
}
