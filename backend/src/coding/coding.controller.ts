import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CodingService } from './coding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CodingDifficulty, ProgrammingLanguage } from '@prisma/client';

@Controller('coding')
@UseGuards(JwtAuthGuard)
export class CodingController {
    constructor(private readonly codingService: CodingService) { }

    @Get('problems')
    async getProblems(
        @Req() req,
        @Query('difficulty') difficulty?: CodingDifficulty,
        @Query('tag') tag?: string,
        @Query('search') search?: string,
    ) {
        console.log(`[CodingController] Fetching problems for user: ${req.user.userId}`);
        const problems = await this.codingService.getProblems({ difficulty, tag, search }, req.user.userId);
        console.log(`[CodingController] Found ${problems.length} problems`);
        return problems;
    }

    @Get('problems/:slug')
    getProblemBySlug(@Param('slug') slug: string, @Req() req) {
        return this.codingService.getProblemBySlug(slug, req.user.userId);
    }

    @Get('problems/:slug/submissions')
    getSubmissions(@Param('slug') slug: string, @Req() req) {
        return this.codingService.getSubmissions(req.user.userId, slug);
    }

    @Post('run')
    runCode(@Body() body: { problemId: string; language: ProgrammingLanguage; sourceCode: string }) {
        return this.codingService.runCode(body.problemId, body.language, body.sourceCode);
    }

    @Post('submit')
    submitCode(@Req() req, @Body() body: { problemId: string; language: ProgrammingLanguage; sourceCode: string }) {
        return this.codingService.submitCode(req.user.userId, body.problemId, body.language, body.sourceCode);
    }

    @Post('save/:problemId')
    toggleSaveProblem(@Req() req, @Param('problemId') problemId: string) {
        return this.codingService.toggleSaveProblem(req.user.userId, problemId);
    }

    @Get('stats')
    getCodingStats(@Req() req) {
        return this.codingService.getCodingStats(req.user.userId);
    }
}
