import { Controller, Get, Post, Body, Patch, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    
    @Public()
    @Get('check-username')
    async checkUsername(@Req() req: any) {
        const username = req.query.username?.trim();
        if (!username) return { available: true };
        const user = await this.usersService.findOneByUsername(username);
        return { available: !user };
    }

    @Public()
    @Get('check-email')
    async checkEmail(@Req() req: any) {
        const email = req.query.email?.toLowerCase().trim();
        if (!email) return { available: true };
        const user = await this.usersService.findOneByEmail(email);
        return { available: !user };
    }


    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: any) {
        return this.usersService.findOne(req.user.userId || req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('settings')
    getSettings(@Req() req: any) {
        return this.usersService.getSettings(req.user.userId || req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    updateSettings(@Req() req: any, @Body() body: any) {
        return this.usersService.updateSettings(req.user.userId || req.user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('goals')
    getGoals(@Req() req: any) {
        return this.usersService.getGoals(req.user.userId || req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('goals')
    updateGoal(@Req() req: any, @Body() body: any) {
        return this.usersService.createOrUpdateGoal(req.user.userId || req.user.id, body);
    }

    @Get('leaderboard')
    getLeaderboard(@Req() req: any) {
        const { timeFilter, category } = req.query;
        return this.usersService.getLeaderboard(timeFilter as any, category as any);
    }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.usersService.updateUser(req.user.userId || req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('xp-history')
  getXpHistory(@Req() req: any) {
    return this.usersService.getXpHistory(req.user.userId || req.user.id);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }))
  async uploadAvatar(@UploadedFile() file: any, @Req() req: any) {
    const avatarUrl = `/uploads/${file.filename}`;
    const user = await this.usersService.updateUser(req.user.userId || req.user.id, { avatarUrl });
    return { avatarUrl: (user as any).avatarUrl };
  }
}
