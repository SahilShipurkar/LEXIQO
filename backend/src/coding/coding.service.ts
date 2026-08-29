import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodingDifficulty, ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';
import { CodeExecutionService } from './code-execution.service';

@Injectable()
export class CodingService {
    constructor(
        private prisma: PrismaService,
        private executionService: CodeExecutionService
    ) { }

    async getProblems(filters: {
        difficulty?: CodingDifficulty;
        tag?: string;
        search?: string;
    }, userId?: string) {
        const { difficulty, tag, search } = filters;

        const where: any = {
            isPublished: true,
        };

        if (difficulty) where.difficulty = difficulty;
        if (tag) where.tags = { some: { name: tag } };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const problems = await this.prisma.codingProblem.findMany({
            where,
            include: {
                tags: true,
                solvedBy: userId ? { where: { userId } } : false,
            },
            orderBy: { createdAt: 'desc' },
        });

        return problems.map(p => ({
            ...p,
            isSolved: userId ? (p.solvedBy as any[]).length > 0 : false,
        }));
    }

    async getProblemBySlug(slug: string, userId: string) {
        const problem = await this.prisma.codingProblem.findUnique({
            where: { slug },
            include: {
                tags: true,
                examples: { orderBy: { order: 'asc' } },
                hints: { orderBy: { order: 'asc' } },
                starterCode: true,
                testCases: { where: { isSample: true }, orderBy: { order: 'asc' } },
                savedBy: { where: { userId } },
                solvedBy: { where: { userId } },
            },
        });

        if (!problem) throw new NotFoundException('Problem not found');

        return {
            ...problem,
            isSaved: problem.savedBy.length > 0,
            isSolved: problem.solvedBy.length > 0,
        };
    }

    async runCode(problemId: string, language: ProgrammingLanguage, sourceCode: string) {
        const problem = await this.prisma.codingProblem.findUnique({
            where: { id: problemId },
            include: { testCases: { where: { isSample: true } } },
        });

        if (!problem) throw new NotFoundException('Problem not found');

        const result = await this.executionService.runOnSampleTests(language, sourceCode, problem.testCases, problem.slug);

        return result;
    }

    async submitCode(userId: string, problemId: string, language: ProgrammingLanguage, sourceCode: string) {
        const problem = await this.prisma.codingProblem.findUnique({
            where: { id: problemId },
            include: { testCases: true },
        });

        if (!problem) throw new NotFoundException('Problem not found');

        const result = await this.executionService.submitAgainstAllTests(language, sourceCode, problem.testCases, problem.slug);

        const submission = await this.prisma.codingSubmission.create({
            data: {
                userId,
                problemId,
                language,
                sourceCode,
                verdict: result.status,
                passedCount: result.passedCount,
                totalCount: result.totalCount,
                runtimeMs: result.runtimeMs,
                memoryKb: result.memoryKb,
                output: result.output,
                errorMessage: result.errorMessage,
            },
        });

        if (result.status === SubmissionVerdict.ACCEPTED) {
            await this.markAsSolved(userId, problemId, result.runtimeMs, result.memoryKb);
        }

        return submission;
    }

    private async markAsSolved(userId: string, problemId: string, runtime: number, memory: number) {
        const existing = await this.prisma.userSolvedProblem.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });

        if (existing) {
            await this.prisma.userSolvedProblem.update({
                where: { id: existing.id },
                data: {
                    lastSolvedAt: new Date(),
                    solvedCount: { increment: 1 },
                    bestRuntimeMs: existing.bestRuntimeMs ? Math.min(existing.bestRuntimeMs, runtime) : runtime,
                    bestMemoryKb: existing.bestMemoryKb ? Math.min(existing.bestMemoryKb, memory) : memory,
                },
            });
        } else {
            await this.prisma.userSolvedProblem.create({
                data: {
                    userId,
                    problemId,
                    bestRuntimeMs: runtime,
                    bestMemoryKb: memory,
                },
            });
            await this.awardXP(userId);
        }
    }

    private async awardXP(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { totalXP: { increment: 50 } },
        });
    }

    async getSubmissions(userId: string, problemIdOrSlug: string) {
        // Check if it's a slug or ID
        const problem = await this.prisma.codingProblem.findFirst({
            where: { OR: [{ id: problemIdOrSlug }, { slug: problemIdOrSlug }] }
        });

        if (!problem) throw new NotFoundException('Problem not found');

        return this.prisma.codingSubmission.findMany({
            where: { userId, problemId: problem.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleSaveProblem(userId: string, problemId: string) {
        const existing = await this.prisma.savedCodingProblem.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });

        if (existing) {
            await this.prisma.savedCodingProblem.delete({ where: { id: existing.id } });
            return { saved: false };
        } else {
            await this.prisma.savedCodingProblem.create({ data: { userId, problemId } });
            return { saved: true };
        }
    }

    async getCodingStats(userId: string) {
        const solved = await this.prisma.userSolvedProblem.findMany({
            where: { userId },
            include: { problem: true },
        });

        const submissions = await this.prisma.codingSubmission.findMany({
            where: { userId },
        });

        const difficultyStats = {
            EASY: solved.filter(s => s.problem.difficulty === CodingDifficulty.EASY).length,
            MEDIUM: solved.filter(s => s.problem.difficulty === CodingDifficulty.MEDIUM).length,
            HARD: solved.filter(s => s.problem.difficulty === CodingDifficulty.HARD).length,
        };

        return {
            totalSolved: solved.length,
            difficultyStats,
            totalSubmissions: submissions.length,
            accuracy: submissions.length > 0
                ? (submissions.filter(s => s.verdict === SubmissionVerdict.ACCEPTED).length / submissions.length) * 100
                : 0,
        };
    }
}
