import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CaslModule } from '../casl/casl.module';
import { HospitalsModule } from '../hospitals/hospitals.module';

@Module({
  imports: [PrismaModule, NotificationsModule, CaslModule, HospitalsModule],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
