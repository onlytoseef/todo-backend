import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(email: string, code: string, context: string): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('MAIL_FROM', user || 'no-reply@todoapp.local');

    if (!host || !user || !pass) {
      this.logger.warn(
        `SMTP config missing; OTP for ${email} (${context}) is ${code}. This is a dev fallback.`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: `Your OTP for ${context}`,
      text: `Your OTP is ${code}. It expires in ${this.configService.get('OTP_EXPIRES_MINUTES', '10')} minutes.`,
    });
  }
}
