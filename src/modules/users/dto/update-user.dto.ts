import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  hospitalId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  telephone?: string;
}
