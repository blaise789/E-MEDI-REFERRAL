import { Module } from '@nestjs/common';
import { AccountsModule } from './modules/accounts/accounts.module';
import { FileModule } from './modules/file/file.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import appConfig from './config/app.config';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { PatientsModule } from './modules/patients/patients.module';
import { CaslModule } from './modules/casl/casl.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      global: true,
      secret: appConfig().jwt.secret,
      signOptions: { expiresIn: appConfig().jwt.expiresIn as any },
    }),

    FileModule,
    MailModule,
    PrismaModule,
    AccountsModule,
    HospitalsModule,
    ReferralsModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    PatientsModule,
    UsersModule,
    CaslModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
