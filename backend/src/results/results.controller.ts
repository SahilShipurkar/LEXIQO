import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Results')
@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    @Post()
    @ApiOperation({ summary: 'Submit section result' })
    async create(@Request() req, @Body() body: any) {
        return this.resultsService.create({
            ...body,
            userId: req.user.userId
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all results for current user' })
    async findAll(@Request() req) {
        return this.resultsService.findByUser(req.user.userId);
    }

    @Get('leaderboard/:testId')
    @ApiOperation({ summary: 'Get leaderboard for a test' })
    async getLeaderboard(@Param('testId') testId: string) {
        return this.resultsService.getLeaderboard(testId);
    }
}
