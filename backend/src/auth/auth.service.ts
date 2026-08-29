import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private otpService: OtpService,
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.googleClient = new OAuth2Client(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET')
        );
    }

    private formatUserResponse(user: any) {
        const baseUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
        let picture = (user as any).avatarUrl;
        if (picture && picture.startsWith('/uploads/')) {
            picture = `${baseUrl}${picture}`;
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalXP: (user as any).totalXP,
            level: Math.floor(((user as any).totalXP || 0) / 500) + 1,
            professionalFocus: (user as any).professionalFocus,
            bio: (user as any).bio,
            isVerified: (user as any).isVerified,
            hasAlphaAccess: (user as any).hasAlphaAccess,
            picture: picture || (user as any).picture,
            avatarUrl: (user as any).avatarUrl,
        };
    }

    async generateTokens(user: any) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') as any,
            }),
        ]);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async updateRefreshToken(userId: string, refreshToken: string, expiresInDays: number = 7) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        await (this.prisma as any).refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: userId,
                expiresAt: expiresAt,
            },
        });
    }


    async decodeRefreshToken(token: string) {
        try {
            return this.jwtService.decode(token) as any;
        } catch (e) {
            return null;
        }
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });

            const savedTokens = await (this.prisma as any).refreshToken.findMany({
                where: { userId: payload.userId },
            });

            if (!savedTokens.length) throw new ForbiddenException('Access Denied');

            let matchingToken: any = null;
            for (const t of savedTokens) {
                const isMatch = await bcrypt.compare(refreshToken, t.token);
                if (isMatch) {
                    matchingToken = t;
                    break;
                }
            }

            if (!matchingToken) throw new ForbiddenException('Access Denied');
            if (new Date() > matchingToken.expiresAt) {
                await (this.prisma as any).refreshToken.delete({ where: { id: matchingToken.id } });
                throw new ForbiddenException('Token expired');
            }

            const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user) throw new ForbiddenException('User not found');

            const tokens = await this.generateTokens(user);
            
            await (this.prisma as any).refreshToken.delete({ where: { id: matchingToken.id } });
            await this.updateRefreshToken(user.id, tokens.refresh_token);


            return {
                ...tokens,
                user: this.formatUserResponse(user)
            };
        } catch (e) {
            throw new ForbiddenException('Invalid refresh token');
        }
    }

    async logout(userId: string, refreshToken: string) {
        const savedTokens = await (this.prisma as any).refreshToken.findMany({
            where: { userId },
        });

        for (const t of savedTokens) {
            const isMatch = await bcrypt.compare(refreshToken, t.token);
            if (isMatch) {
                await (this.prisma as any).refreshToken.delete({ where: { id: t.id } });
                break;
            }
        }
    }

    async verifyGoogleToken(token: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) throw new BadRequestException('Invalid Google Token');

            const { email, given_name, family_name, picture } = payload;

            if (!email) throw new BadRequestException('Email not provided by Google');

            let user = await this.prisma.user.findUnique({ where: { email } });

            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name: `${given_name} ${family_name}`.trim(),
                        auth_provider: 'EMAIL',
                        role: 'student',
                        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                    }
                });
            }

            const tokens = await this.generateTokens(user);
            await this.updateRefreshToken(user.id, tokens.refresh_token);

            return {
                ...tokens,
                user: {
                    ...this.formatUserResponse(user),
                    picture: picture || this.formatUserResponse(user).picture, // Google picture fallback
                }
            };
        } catch (error) {
            console.error(error);
            throw new UnauthorizedException('Invalid Google Token');
        }
    }

    async googleLogin(reqUser: any) {
        if (!reqUser) throw new BadRequestException('No user from google');

        const { email, firstName, lastName } = reqUser;

        let user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`.trim(),
                    auth_provider: 'EMAIL',
                    role: 'student',
                }
            });
        }

        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: {
                ...this.formatUserResponse(user),
                isNewUser: !user.username,
            }
        };
    }

    async sendEmailOtp(email: string) {
        if (!email) throw new BadRequestException('Email is required');
        return this.otpService.sendEmailOtp(email);
    }

    async verifyEmailOtp(email: string, otp: string) {
        if (!email || !otp) throw new BadRequestException('Email and OTP are required');

        const isValid = await this.otpService.verifyEmailOtp(email, otp);
        if (!isValid) throw new BadRequestException('Invalid OTP');

        let user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    auth_provider: 'EMAIL',
                    role: 'student',
                }
            });
        }

        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: {
                ...this.formatUserResponse(user),
                isNewUser: !user.username,
            }
        };
    }

    async verifyOtpCheck(email: string, otp: string) {
        if (!email || !otp) throw new BadRequestException('Email and OTP are required');
        const normalizedEmail = email.toLowerCase().trim();

        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            throw new BadRequestException('No account found with this email address');
        }

        const isValid = await this.otpService.verifyEmailOtp(normalizedEmail, otp, true);

        const resetToken = this.jwtService.sign(
            { email: normalizedEmail, purpose: 'reset-password' },
            { expiresIn: '15m' }
        );

        return { valid: isValid, resetToken };
    }

    async checkOtp(email: string, otp: string) {
        if (!email || !otp) throw new BadRequestException('Email and OTP are required');
        const isValid = await this.otpService.verifyEmailOtp(email, otp, false);
        return { valid: isValid };
    }

    async register(data: any) {
        const { password, name, username, otp } = data;
        const email = data.email?.toLowerCase().trim();

        if (otp) {
            const isOtpValid = await this.otpService.verifyEmailOtp(email, otp);
            if (!isOtpValid) throw new BadRequestException('Invalid or expired OTP');
        }

        if (email) {
            const existingEmail = await this.prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                throw new BadRequestException('Email already registered');
            }
        }

        if (username) {
            const existingUsername = await this.prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
                throw new BadRequestException('Username already taken');
            }
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prisma.user.create({
            data: {
                email,
                username,
                name,
                password: hashedPassword,
                auth_provider: 'EMAIL',
                role: 'student',
            }
        });

        return { message: 'User registered successfully' };
    }

    async login(data: any, rememberMe: boolean = true) {
        const { password } = data;
        const input = data.email?.trim(); 
        let email = input;
        let user;

        const isEmail = input?.includes('@');

        if (isEmail) {
            email = input.toLowerCase();
            user = await this.prisma.user.findUnique({ where: { email } });
        } else {
            user = await this.prisma.user.findUnique({ where: { username: email } });
        }

        if (!user || !user['password']) {
            throw new BadRequestException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user['password']);
        if (!isMatch) {
            throw new BadRequestException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);
        const expiresInDays = rememberMe ? 7 : 1; 
        await this.updateRefreshToken(user.id, tokens.refresh_token, expiresInDays);


        return {
            ...tokens,
            user: this.formatUserResponse(user)
        };
    }

    async resetPasswordWithOtp(data: any) {
        const { resetToken, newPassword } = data;
        let email: string;

        try {
            const payload = this.jwtService.verify(resetToken);
            if (payload.purpose !== 'reset-password') {
                throw new BadRequestException('Invalid reset token');
            }
            email = payload.email;
        } catch (error) {
            throw new BadRequestException('Reset token expired or invalid');
        }

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new BadRequestException('User internal error: session mismatch');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { message: 'Password reset successfully' };
    }

    async guestLogin() {
        const guestId = `guest_${Math.random().toString(36).substring(7)}`;
        const payload = {
            id: guestId,
            email: `${guestId}@example.com`,
            role: 'guest',
        };

        const tokens = await this.generateTokens(payload);
        return {
            ...tokens,
            user: {
                id: guestId,
                email: payload.email,
                role: 'guest',
                name: 'Guest User',
            }
        };
    }

    async getMe(userId: string) {
        let user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new BadRequestException('User not found');

        if (user.currentStreak > 0 && user.lastActivityDate) {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const lastDateStr = user.lastActivityDate.toISOString().split('T')[0];

            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
                user = await this.prisma.user.update({
                    where: { id: userId },
                    data: { currentStreak: 0 },
                });
            }
        }

        return this.formatUserResponse(user);
    }
}
