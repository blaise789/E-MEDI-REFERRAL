import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AccountsService } from './accounts.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
