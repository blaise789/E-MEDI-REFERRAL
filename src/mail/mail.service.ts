import { HttpException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { welcome } from './templates/welcome';
import { initiateEmailVerification } from './templates/initiate-email-verification';
import { initiatePasswordReset } from './templates/initiate-password-reset';
import { passwordResetSuccessful } from './templates/password-reset-successful';
import { emailVerified } from './templates/email-verified';
import { ConfigService } from '@nestjs/config';
import { $Enums, Prisma } from '@prisma/client';


@Injectable()
export class MailService {

  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),

      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

 

}
