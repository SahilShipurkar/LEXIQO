import { Controller, Post, Body, Get, UseGuards, Request, Req, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('send-email-otp')
    @ApiOperation({ summary: 'Send OTP to email' })
    async sendEmailOtp(@Body() body: { email: string }) {
        return this.authService.sendEmailOtp(body.email);
    }

    @Public()
    @Post('verify-email-otp')
    @ApiOperation({ summary: 'Verify OTP and Login/Register (Passwordless)' })
    async verifyEmailOtp(@Body() body: { email: string, otp: string }) {
        return this.authService.verifyEmailOtp(body.email, body.otp);
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
    async login(@Body() body: any) {
        return this.authService.login(body);
    }

    @Public()
    @Post('guest-login')
    @ApiOperation({ summary: 'Login as Guest' })
    async guestLogin() {
        return this.authService.guestLogin();
    }

    @Public()
    @Post('google-login')
    @ApiOperation({ summary: 'Login with Google Token' })
    async googleLogin(@Body() body: { token: string }) {
        return this.authService.verifyGoogleToken(body.token);
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
    async googleAuthRedirect(@Req() req, @Res() res) {
        const { access_token, user } = await this.authService.googleLogin(req.user);
        res.redirect(`http://localhost:5173/auth/callback?token=${access_token}&email=${user.email}&userId=${user.id}`);
    }
    @Public()
    @Post('verify-otp-check')
    @ApiOperation({ summary: 'Verify OTP Validity (No Login/Register)' })
    async verifyOtpCheck(@Body() body: { email: string, otp: string }) {
        return this.authService.verifyOtpCheck(body.email, body.otp);
    }
}
