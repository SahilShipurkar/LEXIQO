import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus, SubmissionVerdict } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) { }

  async getLeaderboard(timeFilter: string, categoryFilter: string = 'All') {
    if (categoryFilter === 'Coding') {
      return this.getCodingLeaderboard(timeFilter);
    }

    const now = new Date();
    let startDate: Date | null = null;
    if (timeFilter === 'Weekly') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeFilter === 'Monthly') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const whereClause: any = { status: SessionStatus.COMPLETED };
    if (startDate) whereClause.completedAt = { gte: startDate };

    if (categoryFilter !== 'All') {
      const categoryMap: Record<string, string> = {
        'Math': 'Quantitative',
        'Logic': 'Logical Reasoning',
        'English': 'Verbal Ability',
        'DI': 'Data Interpretation'
      };
      const dbCategoryName = categoryMap[categoryFilter] || categoryFilter;
      whereClause.category = { equals: dbCategoryName, mode: 'insensitive' };
    }

    const aggregatedData = await this.prisma.testSession.groupBy({
      by: ['userId'],
      where: whereClause,
      _sum: { score: true },
      _count: { id: true },
      _avg: { score: true },
    });

    const userIds = aggregatedData.map(d => d.userId);
    const users = await (this.prisma.user as any).findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, name: true, currentStreak: true, totalXP: true, level: true, avatarUrl: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));
    const leaderboard: any[] = [];

    for (const stat of aggregatedData) {
      const user = userMap.get(stat.userId) as any;
      if (!user) continue;
      const testCount = stat._count.id;
      const avgAccuracy = stat._avg.score || 0;
      const protocolScore = Math.floor((testCount * 10) + (avgAccuracy * 5));

      leaderboard.push({
        rank: 0,
        id: user.id,
        name: user.name || user.username || 'Anonymous',
        score: protocolScore,
        tests: testCount,
        accuracy: Math.round(avgAccuracy),
        streak: user.currentStreak,
        level: user.level || 1,
        avatarColor: this.getRandomColor(user.id),
        picture: user.avatarUrl && user.avatarUrl.startsWith('/uploads/')
          ? `${this.configService.get('BACKEND_URL') || 'http://localhost:3000'}${user.avatarUrl}`
          : user.avatarUrl
      });
    }

    return this.formatResponse(leaderboard);
  }

  async getCodingLeaderboard(timeFilter: string) {
    const now = new Date();
    let startDate: Date | null = null;
    if (timeFilter === 'Weekly') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeFilter === 'Monthly') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const whereClause: any = { verdict: SubmissionVerdict.ACCEPTED };
    if (startDate) whereClause.createdAt = { gte: startDate };

    const aggregatedData = await this.prisma.codingSubmission.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: { id: true },
    });

    const userIds = aggregatedData.map(d => d.userId);
    const users = await (this.prisma.user as any).findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, name: true, currentStreak: true, totalXP: true, level: true, avatarUrl: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));
    const leaderboard: any[] = [];

    for (const stat of aggregatedData) {
      const user = userMap.get(stat.userId) as any;
      if (!user) continue;

      const solvedCount = stat._count.id;
      // Points calculation for coding: 50 per solved
      const score = solvedCount * 50;

      leaderboard.push({
        rank: 0,
        id: user.id,
        name: user.name || user.username || 'Anonymous',
        score: score,
        tests: solvedCount, // for coding, 'tests' represents solved problems
        accuracy: 100, // By definition for Accepted
        streak: user.currentStreak,
        level: user.level || 1,
        avatarColor: this.getRandomColor(user.id),
        picture: user.avatarUrl && user.avatarUrl.startsWith('/uploads/')
          ? `${this.configService.get('BACKEND_URL') || 'http://localhost:3000'}${user.avatarUrl}`
          : user.avatarUrl
      });
    }

    return this.formatResponse(leaderboard);
  }

  private async formatResponse(leaderboard: any[]) {
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    const allUsers = await this.prisma.user.findMany({ select: { totalXP: true } });
    const totalGlobalXP = allUsers.reduce((acc, u) => acc + (u.totalXP || 0), 0);
    const globalAvgXP = allUsers.length > 0 ? Math.round(totalGlobalXP / allUsers.length) : 0;
    const activeUsersCount = allUsers.length;

    return {
      users: sortedLeaderboard.slice(0, 50),
      globalAvgXP,
      activeUsersCount
    };
  }

  private getRandomColor(seed: string) {
    const colors = ['#6366F1', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
