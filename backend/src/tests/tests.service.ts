import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class TestsService {
    constructor(private prisma: PrismaService) { }

    // --- CATEGORIES & TESTS ---
    async getCategories() {
        return this.prisma.category.findMany({
            include: {
                _count: {
                    select: { tests: true }
                }
            }
        });
    }

    async getTests(categoryId?: string) {
        return this.prisma.practiceTest.findMany({
            where: categoryId ? { categoryId } : {},
            include: {
                category: true,
                _count: {
                    select: { questions: true }
                }
            }
        });
    }

    async getTestDetails(testId: string, userId?: string) {
        const test = await this.prisma.practiceTest.findUnique({
            where: { id: testId },
            include: {
                category: true,
                questions: {
                    select: {
                        id: true,
                        content: true,
                        options: true,
                        difficulty: true,
                        // correctAnswer is NOT included for security during the test
                    }
                }
            }
        });

        if (!test) throw new NotFoundException('Practice Test not found');

        // Include user progress if userId provided
        let userProgress: any = null;
        if (userId) {
            const completedSessions = await this.prisma.testSession.findMany({
                where: { userId, testId, status: SessionStatus.COMPLETED },
                orderBy: { startTime: 'desc' },
                take: 1
            });
            
            if (completedSessions.length > 0) {
                userProgress = {
                    lastScore: completedSessions[0].score,
                    attemptedDate: completedSessions[0].startTime,
                    status: 'completed'
                };
            }
        }

        return { ...test, userProgress };
    }

    // --- SESSION FLOW ---
    async startSession(userId: string, testId: string) {
        const test = await this.prisma.practiceTest.findUnique({ where: { id: testId }, include: { category: true } });
        if (!test) throw new NotFoundException('Practice Test not found. Invalid ID.');

        const session = await this.prisma.testSession.create({
            data: {
                userId,
                testId,
                status: SessionStatus.IN_PROGRESS,
                startTime: new Date(),
                startedAt: new Date(),
                testTitle: test.title,
                category: test.category?.name || 'Uncategorized',
                totalQuestions: test.totalQuestions
            }
        });

        const questions = await this.prisma.question.findMany({
            where: { testId },
            include: {
                test: true
            }
        });

        return { session, questions };
    }

    async recordResponse(sessionId: string, questionId: string, selectedOption: string, timeSpent: number) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) throw new NotFoundException('Question not found');

        // selectedOption from frontend could be the text string (e.g. "Stack") or the ID (e.g. "A").
        // question.correctAnswer in DB is "A", "B", "C", "D".
        // Find if the selected string matches an option's text or id.
        const options = question.options as any[];
        const matchedOption = options?.find(opt => opt.text === selectedOption || opt.id === selectedOption);
        const isCorrect = matchedOption ? (matchedOption.id === question.correctAnswer) : false;

        return this.prisma.userResponse.upsert({
            where: {
                id: (await this.prisma.userResponse.findFirst({
                    where: { sessionId, questionId }
                }))?.id || 'temp-id'
            },
            update: {
                selectedOption,
                isCorrect,
                timeSpent,
            },
            create: {
                sessionId,
                questionId,
                selectedOption,
                isCorrect,
                timeSpent,
            }
        });
    }

    async completeSession(sessionId: string) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: { responses: true, test: true }
        });

        if (!session) throw new NotFoundException('Session not found');

        if (session.status === SessionStatus.COMPLETED) {
            return session;
        }

        const correctCount = session.responses.filter(r => r.isCorrect).length;
        const totalCount = session.test.totalQuestions;
        const score = (correctCount / totalCount) * 100;
        
        const endDt = new Date();
        const startDt = new Date(session.startedAt || session.startTime);
        const durationSecs = Math.round((endDt.getTime() - startDt.getTime()) / 1000);
        const durationMins = Math.round(durationSecs / 60);
        const attempted = session.responses.length;

    // Finalize session
    const updatedSession = await this.prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        endTime: endDt,
        completedAt: endDt,
        duration: durationMins,
        durationSeconds: durationSecs,
        score,
        accuracyPercentage: score,
        correctCount,
        correctAnswers: correctCount,
        attemptedQuestions: attempted,
        wrongCount: attempted - correctCount,
        skippedCount: totalCount - attempted,
      },
    });

    // Update User Stats (Streak, Points, Performance, XP/Level)
    await this.updateUserStats(session.userId, score, updatedSession.duration || durationMins, sessionId, correctCount);

    return updatedSession;
  }

  async abortSession(sessionId: string) {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.status !== SessionStatus.IN_PROGRESS) {
      return session;
    }

    const endDt = new Date();
    const startDt = new Date(session.startedAt || session.startTime);
    const durationSecs = Math.round((endDt.getTime() - startDt.getTime()) / 1000);
    const durationMins = Math.round(durationSecs / 60);

    return this.prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ABORTED,
        endTime: endDt,
        completedAt: endDt,
        duration: durationMins,
        durationSeconds: durationSecs,
      },
    });
  }

  private async updateUserStats(userId: string, sessionScore: number, sessionDuration: number, sessionId?: string, correctAnswers: number = 0) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - tzOffset);
    const todayStr = localNow.toISOString().split('T')[0];

    // XP Calculation: 10 XP per correct answer
    const xpReward = correctAnswers * 10;
    let totalXpGain = 0;

    if (sessionId) {
      const existingXp = await (this.prisma as any).xpTransaction.findUnique({
        where: { sessionId },
      });

      if (!existingXp) {
        await (this.prisma as any).xpTransaction.create({
          data: {
            userId,
            sessionId,
            amount: xpReward,
          },
        });
        totalXpGain = xpReward;
      }
    }

    let lastDateStr: string | null = null;
    if (user.lastActivityDate) {
      const lastActivityLocal = new Date(user.lastActivityDate.getTime() - tzOffset);
      lastDateStr = lastActivityLocal.toISOString().split('T')[0];
    }

    let newStreak = user.currentStreak;
    if (lastDateStr !== todayStr) {
      const yesterday = new Date(localNow);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDateStr === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // Recalculate level
    const newTotalXP = ((user as any).totalXP || 0) + totalXpGain;
    const newLevel = Math.floor(newTotalXP / 500) + 1;

    // 1. Update User Main Record
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        lastActivityDate: now,
        longestStreak: Math.max(newStreak, user.longestStreak),
        totalPoints: { increment: totalXpGain || 10 },
        totalXP: newTotalXP,
        level: newLevel,
      } as any,
    });

        // 2. Update Performance Metrics for TODAY
        const midDay = new Date(`${todayStr}T00:00:00.000Z`);

        const existingMetric = await (this.prisma as any).performanceMetric.findUnique({
            where: { userId_date: { userId, date: midDay } }
        });

        if (existingMetric) {
            const newTestsCompleted = existingMetric.testsCompleted + 1;
            const newTotalScore = existingMetric.totalScore + sessionScore;
            await (this.prisma as any).performanceMetric.update({
                where: { id: existingMetric.id },
                data: {
                    testsCompleted: newTestsCompleted,
                    totalScore: newTotalScore,
                    totalTimeMinute: { increment: sessionDuration },
                    avgAccuracy: newTotalScore / newTestsCompleted
                }
            });
        } else {
            await (this.prisma as any).performanceMetric.create({
                data: {
                    userId,
                    date: midDay,
                    testsCompleted: 1,
                    totalScore: sessionScore,
                    totalTimeMinute: sessionDuration,
                    avgAccuracy: sessionScore
                }
            });
        }
    }


    // --- AGGREGATIONS FOR DASHBOARD / MODULES ---
    async getDashboardStats(userId: string) {
        const sessions = await this.prisma.testSession.findMany({
            where: { userId, status: SessionStatus.COMPLETED },
            orderBy: { startTime: 'desc' }
        });

        const totalTests = sessions.length;
        const avgAccuracy = sessions.reduce((acc, s) => acc + (s.score || 0), 0) / (totalTests || 1);
        
        const recentActivity = sessions.slice(0, 5).map(s => ({
            id: s.id,
            date: s.startTime,
            score: s.score,
            status: s.status
        }));

        return {
            totalTests,
            avgAccuracy,
            recentActivity
        };
    }
}
