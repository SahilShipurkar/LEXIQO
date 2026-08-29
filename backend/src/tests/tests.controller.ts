import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path if needed

@Controller('tests')
export class TestsController {
    constructor(private readonly testsService: TestsService) { }

    @Get('categories')
    getCategories() {
        return this.testsService.getCategories();
    }

    @Get()
    getTests(@Query('categoryId') categoryId?: string) {
        return this.testsService.getTests(categoryId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getTest(@Param('id') id: string, @Req() req: any) {
        return this.testsService.getTestDetails(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sessions/start/:testId')
    startSession(@Param('testId') testId: string, @Req() req: any) {
        return this.testsService.startSession(req.user.userId, testId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sessions/:sessionId/response')
    recordResponse(
        @Param('sessionId') sessionId: string,
        @Body() body: { questionId: string; selectedOption: string; timeSpent: number }
    ) {
        return this.testsService.recordResponse(sessionId, body.questionId, body.selectedOption, body.timeSpent);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sessions/:sessionId/complete')
    completeSession(@Param('sessionId') sessionId: string) {
        return this.testsService.completeSession(sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sessions/:sessionId/abort')
    abortSession(@Param('sessionId') sessionId: string) {
        return this.testsService.abortSession(sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('dashboard/summary')
    getDashboardSummary(@Req() req: any) {
        return this.testsService.getDashboardStats(req.user.userId);
    }
}
