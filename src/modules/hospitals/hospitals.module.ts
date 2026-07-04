import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { HospitalsService } from './hospitals.service';
import { CaslModule } from '../casl/casl.module';
import { ClinicalGateway } from './clinical.gateway';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, CaslModule, AuditModule],
  controllers: [HospitalsController],
  providers: [HospitalsService, ClinicalGateway],
  exports: [HospitalsService, ClinicalGateway]
})
export class HospitalsModule {}
