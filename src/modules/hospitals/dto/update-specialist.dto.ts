import { PartialType } from '@nestjs/swagger';
import { AddSpecialistDto } from './add-specialist.dto';

export class UpdateSpecialistDto extends PartialType(AddSpecialistDto) {}
