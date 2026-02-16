import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendUserOtp(email: string, otp: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Your Login OTP',
            text: `Your OTP is ${otp}. This code expires in 15 minutes. Do not share this OTP with anyone.`,
            html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>This code expires in 15 minutes.</p><p>Do not share this OTP with anyone.</p>`,
        });
    }
}
