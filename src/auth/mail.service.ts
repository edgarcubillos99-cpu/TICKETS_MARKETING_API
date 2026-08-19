import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.getOrThrow('SMTP_PORT'));

    const options: SMTPTransport.Options = {
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port,
      // 587 = STARTTLS (secure: false). 465 = TLS implícito (secure: true).
      secure:
        this.configService.get<string>('SMTP_SECURE') === 'true' ||
        port === 465,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport({
      ...options,
      // Evita ENETUNREACH si el host resuelve IPv6 y la red no tiene IPv6.
      family: 4,
    } as SMTPTransport.Options);
  }

  async sendMfaCode(to: string, code: string): Promise<void> {
    const from = this.configService.getOrThrow<string>('SMTP_FROM');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Código de verificación — Tickets Dashboard',
        text: `Tu código de verificación es: ${code}\n\nExpira en 10 minutos. Si no solicitaste este acceso, ignora este correo.`,
        html: `<p>Tu código de verificación es:</p><p style="font-size:24px;letter-spacing:4px"><strong>${code}</strong></p><p>Expira en 10 minutos. Si no solicitaste este acceso, ignora este correo.</p>`,
      });
    } catch (error) {
      this.logger.error('No se pudo enviar el correo MFA', error);
      throw error;
    }
  }
}
