import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    // --- BASIC USER CRUD ---
    async create(createUserDto: any) {
        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, username: true, name: true, email: true, currentStreak: true, longestStreak: true, totalPoints: true }
        });
    }

    async findOne(id: string) {
        if (!id) return null;
        return this.prisma.user.findUnique({
            where: { id },
            include: { settings: true, goals: true }
        });
    }

    // --- USER SETTINGS ---
    async getSettings(userId: string) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            update: {},
            create: { userId, theme: 'light', appearanceMode: 'system' }
        });
    }

    async updateSettings(userId: string, data: any) {
        return this.prisma.userSettings.update({
            where: { userId },
            data
        });
    }

    // --- USER GOALS ---
    async getGoals(userId: string) {
        return this.prisma.userGoal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createOrUpdateGoal(userId: string, data: { type: GoalType; targetValue: number }) {
        return this.prisma.userGoal.upsert({
            where: { id: 'temp-id' }, // In real app, we might match by type/userId for unique active goal
            update: { targetValue: data.targetValue },
            create: { userId, type: data.type, targetValue: data.targetValue }
        });
    }

    // --- LEADERBOARD ---
    async getLeaderboard(filter: 'Weekly' | 'Monthly' | 'All Time' = 'All Time', category: string = 'All') {
        const users = await (this.prisma.user as any).findMany({
            select: {
                id: true,
                username: true,
                name: true,
                totalXP: true,
                level: true,
                currentStreak: true,
                avatarUrl: true,
                _count: {
                    select: { sessions: { where: { status: 'COMPLETED' } } }
                },
                sessions: {
                    where: { status: 'COMPLETED' },
                    select: { score: true }
                }
            },
            orderBy: { totalXP: 'desc' },
            take: 20
        });

        // Calculate global stats for the legend
        const allUsers = await this.prisma.user.findMany({ select: { totalXP: true } });
        const totalXP = allUsers.reduce((acc, u) => acc + (u.totalXP || 0), 0);
        const globalAvgXP = allUsers.length > 0 ? Math.round(totalXP / allUsers.length) : 0;
        const activeUsersCount = allUsers.length;

        return {
            users: users.map((u, i) => {
                const totalScore = u.sessions.reduce((acc, s) => acc + (s.score || 0), 0);
                const avgAccuracy = u.sessions.length > 0 ? Math.round(totalScore / u.sessions.length) : 0;
                const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];
                const avatarColor = colors[Math.abs(u.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

                return {
                    rank: i + 1,
                    id: u.id,
                    name: u.username || u.name || 'Anonymous',
                    score: u.totalXP,
                    tests: (u as any)._count.sessions,
                    accuracy: avgAccuracy,
                    streak: u.currentStreak,
                    level: Math.floor((u.totalXP || 0) / 500) + 1,
                    avatarColor: avatarColor,
                    picture: (u as any).avatarUrl && (u as any).avatarUrl.startsWith('/uploads/') 
                        ? `${this.configService.get('BACKEND_URL') || 'http://localhost:3000'}${(u as any).avatarUrl}` 
                        : (u as any).avatarUrl
                };
            }),
            globalAvgXP,
            activeUsersCount
        };
    }

    // --- AUTH UTILS ---
    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findOneByUsername(username: string) {
        return this.prisma.user.findUnique({ where: { username } });
    }

  async updateUser(id: string, updateData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async getXpHistory(userId: string) {
    return (this.prisma as any).xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        session: {
          select: {
            testTitle: true,
            completedAt: true,
          },
        },
      },
    });
  }
}
