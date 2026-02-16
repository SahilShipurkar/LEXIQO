import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { OtpModule } from '../otp/otp.module';
import { GoogleStrategy } from './google.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule, // Added
    UsersModule,
    PassportModule,
    OtpModule, // Added
    PrismaModule, // Added
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy], // Added GoogleStrategy
  controllers: [AuthController],
})
export class AuthModule { }
