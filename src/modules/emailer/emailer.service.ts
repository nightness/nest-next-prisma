import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EMAIL_HOST, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER } from '../../config/config.env';

@Injectable()
export class EmailerService {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = createTransport({
      // @ts-ignore
      // FIXME: This should be fine, but the types are not correct
      host: EMAIL_HOST,        
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject,
      html: message,
      replyTo: email,
    } as Mail.Options;

    return transporter.sendMail(mailOptions);
  }
}
