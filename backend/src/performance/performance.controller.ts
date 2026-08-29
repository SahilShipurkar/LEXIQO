import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserPerformance(@Req() req, @Query('filter') filter: string, @Query('type') type?: string) {
    const userId = req.user.userId || req.user.id;
    return this.performanceService.getUserPerformance(userId, filter, type);
  }
}
