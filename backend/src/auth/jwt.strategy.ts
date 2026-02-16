import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
        });
    }

    async validate(payload: any) {
        const userId = payload.sub || payload.userId;

        if (payload.role === 'guest') {
            return {
                userId: userId,
                username: 'Guest',
                role: 'guest',
                email: payload.email,
                name: 'Guest User'
            };
        }

        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        // If token version doesn't match, session is invalid
        if (payload.version !== undefined && user.tokenVersion !== payload.version) {
            throw new UnauthorizedException('Session expired');
        }
        return {
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            name: user.name
        };
    }
}
