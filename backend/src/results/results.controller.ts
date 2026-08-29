import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Results')
@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all results for current user' })
    async findAll(@Request() req) {
        return this.resultsService.findByUser(req.user.userId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get user leaderboard' })
    async getLeaderboard() {
        return this.resultsService.getLeaderboard();
    }

    @Get('history')
    @ApiOperation({ summary: 'Get history overview and records' })
    async getHistory(@Request() req) {
        return this.resultsService.getHistory(req.user.userId);
    }
}
