import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Public()
    @Get('check-username')
    async checkUsername(@Query('username') username: string) {
        if (!username) throw new BadRequestException('Username is required');

        const user = await this.usersService.findOneByUsername(username);
        return { available: !user };
    }

    @Public()
    @Get('check-email')
    async checkEmail(@Query('email') email: string) {
        if (!email) throw new BadRequestException('Email is required');
        const user = await this.usersService.findOneByEmail(email);
        return { available: !user };
    }
}
