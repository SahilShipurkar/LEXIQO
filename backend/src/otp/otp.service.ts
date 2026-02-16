import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async sendEmailOtp(emailStr: string) {
        const email = emailStr.toLowerCase().trim();
        // 1. Check rate limit (optional basic check: if recent OTP exists)
        const existingOtp = await this.prisma.emailOtp.findFirst({
            where: { email, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } }, // 10 mins window
            orderBy: { createdAt: 'desc' },
        });

        // In a real app, count attempts in last 10 mins. For now, simple check.
        // If > 3 attempts in 10 mins, block.
        const attempts = await this.prisma.emailOtp.count({
            where: { email, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
        });

        if (attempts >= 3) {
            throw new BadRequestException('Too many OTP requests. Please try again later.');
        }

        // 2. Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // 3. Invalidate old OTPs (optional, but good practice is to just look for latest valid)
        // Actually, create new record.
        await this.prisma.emailOtp.create({
            data: {
                email,
                otp: hashedOtp,
                expiresAt,
            },
        });

        // Log for dev
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n====================================================');
            console.log(`🔒 [DEV MODE] New OTP for ${email}: ${otp}`);
            console.log('====================================================\n');
        }

        // Always send email (dev mode can use Mailtrap)
        try {
            await this.mailService.sendUserOtp(email, otp);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[DEV WARNING] Failed to send email to ${email}. Check your SMTP configuration.`, error.message);
                // In DEV, we allow proceeding because the OTP is logged to the console
            } else {
                throw error;
            }
        }

        return { message: 'OTP sent successfully' };
    }

    async verifyEmailOtp(emailStr: string, otpInput: string, consume: boolean = true) {
        const email = emailStr.toLowerCase().trim();
        const otp = otpInput.trim();

        console.log(`[OTP VERIFY] Checking OTP for ${email}...`);

        const record = await this.prisma.emailOtp.findFirst({
            where: { email, isUsed: false },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            console.warn(`[OTP VERIFY] No unused OTP record found for ${email}`);
            throw new BadRequestException('Invalid OTP or expired');
        }

        if (record.expiresAt < new Date()) {
            console.warn(`[OTP VERIFY] OTP record found but EXPIRED for ${email}`);
            throw new BadRequestException('OTP expired');
        }

        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            console.warn(`[OTP VERIFY] OTP code mismatch for ${email}. Input: [${otp}]`);
            throw new BadRequestException('Invalid OTP');
        }

        if (consume) {
            // Mark as used
            await this.prisma.emailOtp.update({
                where: { id: record.id },
                data: { isUsed: true },
            });
            console.log(`[OTP VERIFY] OTP successfully verified and consumed for ${email}`);
        } else {
            console.log(`[OTP VERIFY] OTP valid (not consumed) for ${email}`);
        }

        return true;
    }
}
