import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    async create(resultData: any) {
        // userId is expected to be part of resultData (as 'userId' string, not 'user' object)
        // If resultData comes with 'user' object from entity logic, we might need adjustment.
        // But usually DTOs have userId.
        // Assuming resultData matches Prisma CreateInput roughly.
        // We might need to make sure 'userAnswers' is handled as JSON (Prisma handles it if type matches).

        // Remove 'id' if present and let DB handle it
        const { id, ...data } = resultData;

        return this.prisma.testResult.create({
            data: data,
        });
    }

    async findByUser(userId: string) {
        return this.prisma.testResult.findMany({
            where: { userId },
            orderBy: { attemptDate: 'desc' }
        });
    }

    async getLeaderboard(sectionName: string) {
        const results = await this.prisma.testResult.findMany({
            where: { sectionName },
            orderBy: [
                { scorePercentage: 'desc' },
                { timeTaken: 'asc' }
            ],
            take: 5,
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Map to flat structure if needed, or return as is.
        // Previous TypeORM select: { id, scorePercentage, timeTaken, attemptDate, user: { name } }
        // Prisma include returns nested user object.
        return results.map(r => ({
            id: r.id,
            scorePercentage: r.scorePercentage,
            timeTaken: r.timeTaken,
            attemptDate: r.attemptDate,
            user: r.user
        }));
    }
}
