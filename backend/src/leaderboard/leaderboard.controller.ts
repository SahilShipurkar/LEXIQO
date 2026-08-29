import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLeaderboard(
    @Query('timeFilter') timeFilter: string,
    @Query('categoryFilter') categoryFilter: string,
  ) {
    return this.leaderboardService.getLeaderboard(timeFilter || 'Weekly', categoryFilter || 'All');
  }
}
