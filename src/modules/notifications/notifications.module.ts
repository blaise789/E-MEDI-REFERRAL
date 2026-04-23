import { Module, forwardRef } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { HospitalsModule } from '../hospitals/hospitals.module';

@Module({
  imports: [PrismaModule, forwardRef(() => HospitalsModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
