import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { HospitalsService } from './hospitals.service';

@Module({
  imports: [PrismaModule],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService]
})
export class HospitalsModule {}
