import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    async findByUser(userId: string) {
        // Map new TestSession back to what frontend expects as "results"
        const sessions = await this.prisma.testSession.findMany({
            where: { userId, status: 'COMPLETED' },
            include: { test: true },
            orderBy: { startTime: 'desc' }
        });

        return sessions.map(s => ({
            id: s.id,
            testId: s.testId, // newly added to help with navigation
            sectionName: s.testTitle ?? s.test?.title ?? 'Unknown Test', // frontend uses this for display
            totalQuestions: s.totalQuestions || s.test?.totalQuestions || 0,
            correct: s.correctAnswers || s.correctCount,
            wrong: s.wrongCount,
            skipped: s.skippedCount,
            scorePercentage: s.accuracyPercentage ?? s.score ?? 0,
            timeTaken: s.durationSeconds ?? ((s.duration || 0) * 60), // Frontend expects seconds here
            attemptDate: s.startedAt ?? s.startTime
        }));
    }

    async getLeaderboard() {
        // Simple leaderboard fetch for backward compatibility if needed
        const topSessions = await this.prisma.testSession.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { score: 'desc' },
            take: 10,
            include: { user: { select: { name: true } }, test: { select: { title: true } } }
        });

        return topSessions.map(s => ({
            id: s.id,
            scorePercentage: s.accuracyPercentage ?? s.score ?? 0,
            sectionName: s.testTitle ?? s.test?.title ?? 'Unknown Test',
            user: s.user
        }));
    }

    async getHistory(userId: string) {
        // 1. Fetch all test sessions for user
        const sessions = await this.prisma.testSession.findMany({
            where: { userId },
            include: { test: { include: { category: true } } },
            orderBy: { startTime: 'desc' }
        });

        // 2. Compute Summary Stats
        const totalAttempted = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
        const completedCount = completedSessions.length;
        
        let avgAccuracy = 0;
        let avgTimePerTest = 0;
        let bestCategory = 'N/A';

        if (completedCount > 0) {
            avgAccuracy = completedSessions.reduce((acc, s) => acc + (s.accuracyPercentage ?? s.score ?? 0), 0) / completedCount;
            // avgTimePerTest is computed based on durationSeconds if available, else duration mapped to seconds
            avgTimePerTest = completedSessions.reduce((acc, s) => acc + (s.durationSeconds ?? ((s.duration || 0) * 60)), 0) / completedCount;
            
            // Best category calculation
            const catStats: Record<string, { accSum: number, count: number, latest: Date }> = {};
            for (const s of completedSessions) {
                const catName = s.category ?? s.test?.category?.name ?? 'Uncategorized';
                const sessionStart = new Date(s.startedAt ?? s.startTime);
                if (!catStats[catName]) catStats[catName] = { accSum: 0, count: 0, latest: sessionStart };
                catStats[catName].accSum += (s.accuracyPercentage ?? s.score ?? 0);
                catStats[catName].count += 1;
                if (sessionStart > catStats[catName].latest) catStats[catName].latest = sessionStart;
            }

            let maxScore = -1;
            let maxCount = -1;
            let maxLatest = new Date(0);

            for (const [catName, stats] of Object.entries(catStats)) {
                const catAvg = stats.accSum / stats.count;
                if (catAvg > maxScore || 
                   (catAvg === maxScore && stats.count > maxCount) || 
                   (catAvg === maxScore && stats.count === maxCount && stats.latest > maxLatest)) {
                    maxScore = catAvg;
                    maxCount = stats.count;
                    maxLatest = stats.latest;
                    bestCategory = catName;
                }
            }
        }

        // 3. Map to history data
        const historyData = sessions.map(s => {
            const dateObj = new Date(s.startedAt ?? s.startTime);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const mins = String(dateObj.getMinutes()).padStart(2, '0');

            let durationStr = '00:00';
            const durationSecs = s.durationSeconds ?? ((s.duration || 0) * 60);
            if (durationSecs > 0) {
                const h = Math.floor(durationSecs / 3600);
                const m = Math.floor((durationSecs % 3600) / 60);
                const sc = durationSecs % 60;
                if (h > 0) {
                    durationStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
                } else {
                    durationStr = `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
                }
            }

            let statusLabel = 'Aborted';
            if (s.status === 'COMPLETED') statusLabel = 'Completed';
            else if (s.status === 'IN_PROGRESS') statusLabel = 'In Progress';

            return {
                id: s.id,
                title: s.testTitle ?? s.test?.title ?? 'Unknown Test',
                category: s.category ?? s.test?.category?.name ?? 'Uncategorized',
                date: `${yyyy}-${mm}-${dd}`,
                time: `${hours}:${mins}`,
                accuracy: Math.round(s.accuracyPercentage ?? s.score ?? 0),
                duration: durationStr,
                durationSeconds: durationSecs,
                status: statusLabel,
                testId: s.testId
            };
        });

        return {
            summaryStats: {
                totalAttempted,
                completedTests: completedCount,
                avgAccuracy: Math.round(avgAccuracy),
                avgTimePerTest: Math.round(avgTimePerTest),
                bestCategory
            },
            historyData
        };
    }
}
