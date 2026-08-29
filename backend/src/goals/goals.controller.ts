import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  async getGoals(@Request() req) {
    return this.goalsService.getGoals(req.user.userId);
  }

  @Post('update')
  async updateGoal(@Request() req, @Body() body: { type: GoalType; targetValue: number }) {
    return this.goalsService.updateGoal(req.user.userId, body.type, body.targetValue);
  }
}
