import { Controller, Post, Body, Get, UseGuards, Request, Req, Res, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    private setRefreshTokenCookie(res: Response, token: string, rememberMe: boolean = true) {
        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };

        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }
        // If not rememberMe, it's a session cookie (expires when browser closes)
        
        res.cookie('refresh_token', token, cookieOptions);
    }

    private clearRefreshTokenCookie(res: Response) {
        res.clearCookie('refresh_token');
    }

    @Public()
    @Post('send-email-otp')
    @ApiOperation({ summary: 'Send OTP to email' })
    async sendEmailOtp(@Body() body: { email: string }) {
        return this.authService.sendEmailOtp(body.email);
    }

    @Public()
    @Post('verify-email-otp')
    @ApiOperation({ summary: 'Verify OTP and Login/Register (Passwordless)' })
    async verifyEmailOtp(@Body() body: { email: string, otp: string, rememberMe?: boolean }, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyEmailOtp(body.email, body.otp);
        this.setRefreshTokenCookie(res, result.refresh_token, body.rememberMe !== false);
        const { refresh_token, ...response } = result;
        return response;
    }

    @Public()
    @Post('check-otp')
    @ApiOperation({ summary: 'Check OTP validity without consuming (for UI validation)' })
    async checkOtp(@Body() body: { email: string, otp: string }) {
        return this.authService.checkOtp(body.email, body.otp);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register with Email/Password' })
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with Email/Password' })
    async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const rememberMe = body.rememberMe !== false;
        const result = await this.authService.login(body, rememberMe);
        this.setRefreshTokenCookie(res, result.refresh_token, rememberMe);
        const { refresh_token, ...response } = result;
        return response;
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh tokens using cookie' })
    async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies['refresh_token'];
        if (!token) throw new UnauthorizedException('Refresh token missing');
        const result = await this.authService.refreshTokens(token);
        // On refresh, we should keep the same cookie setting. 
        // For simplicity, we'll assume long-lived for refresh rotation.
        this.setRefreshTokenCookie(res, result.refresh_token, true); 
        const { refresh_token, ...response } = result;
        return response;
    }

    @Public()
    @Post('logout')
    @ApiOperation({ summary: 'Logout and clear refresh token' })
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies['refresh_token'];
        if (token) {
            try {
                // We'll decode the token to find the userId even if expired
                const payload = await this.authService.decodeRefreshToken(token);
                if (payload) {
                    await this.authService.logout(payload.userId, token);
                }
            } catch (e) {
                // Token invalid, still clear cookie
            }
        }
        this.clearRefreshTokenCookie(res);
        return { message: 'Logged out successfully' };
    }

    @Public()
    @Post('guest-login')
    @ApiOperation({ summary: 'Login as Guest' })
    async guestLogin(@Res({ passthrough: true }) res: Response) {
        const result = await this.authService.guestLogin();
        this.setRefreshTokenCookie(res, result.refresh_token, false); // Guest always session-only
        const { refresh_token, ...response } = result;
        return response;
    }

    @Public()
    @Post('google-login')
    @ApiOperation({ summary: 'Login with Google Token' })
    async googleLogin(@Body() body: { token: string, rememberMe?: boolean }, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyGoogleToken(body.token);
        this.setRefreshTokenCookie(res, result.refresh_token, body.rememberMe !== false);
        const { refresh_token, ...response } = result;
        return response;
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset Password with OTP' })
    async resetPassword(@Body() body: any) {
        return this.authService.resetPasswordWithOtp(body);
    }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.googleLogin(req.user);
        this.setRefreshTokenCookie(res, result.refresh_token);
        res.redirect(`http://localhost:5173/auth/callback?token=${result.access_token}&email=${result.user.email}&userId=${result.user.id}`);
    }

    @Public()
    @Post('verify-otp-check')
    @ApiOperation({ summary: 'Verify OTP Validity (No Login/Register)' })
    async verifyOtpCheck(@Body() body: { email: string, otp: string }) {
        return this.authService.verifyOtpCheck(body.email, body.otp);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getMe(@Request() req: any) {
        return this.authService.getMe(req.user.userId);
    }
}
