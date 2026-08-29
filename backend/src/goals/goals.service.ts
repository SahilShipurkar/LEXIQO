import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalType, GoalStatus, SessionStatus } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async getGoals(userId: string) {
    const goals = await this.prisma.userGoal.findMany({
      where: { userId },
    });

    const types = [GoalType.DAILY, GoalType.WEEKLY, GoalType.MONTHLY];
    const finalGoals: any[] = [];

    for (const type of types) {
      let goal = goals.find((g) => g.type === type);
      if (!goal) {
        // Create default goal
        goal = await this.prisma.userGoal.create({
          data: {
            userId,
            type,
            targetValue: this.getDefaultTarget(type),
            status: GoalStatus.ON_TRACK,
          },
        });
      }

      // Calculate real progress from TestSession
      const currentValue = await this.calculateProgress(userId, type);
      
      // Update status locally based on progress
      const progressPercent = (currentValue / goal.targetValue) * 100;
      let status: GoalStatus = GoalStatus.BEHIND;
      if (progressPercent >= 100) status = GoalStatus.COMPLETED;
      else if (progressPercent >= 75) status = GoalStatus.ON_TRACK;

      finalGoals.push({
        ...goal,
        currentValue,
        status,
      });
    }

    return finalGoals;
  }

  async updateGoal(userId: string, type: GoalType, targetValue: number) {
    const existing = await this.prisma.userGoal.findFirst({
      where: { userId, type },
    });

    if (existing) {
      return this.prisma.userGoal.update({
        where: { id: existing.id },
        data: { targetValue },
      });
    }

    return this.prisma.userGoal.create({
      data: {
        userId,
        type,
        targetValue,
        status: GoalStatus.ON_TRACK,
      },
    });
  }

  private getDefaultTarget(type: GoalType): number {
    switch (type) {
      case GoalType.DAILY: return 5;
      case GoalType.WEEKLY: return 21;
      case GoalType.MONTHLY: return 100;
      default: return 5;
    }
  }

  private async calculateProgress(userId: string, type: GoalType): Promise<number> {
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case GoalType.DAILY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case GoalType.WEEKLY:
        const weekDate = new Date(now);
        const day = weekDate.getDay();
        const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(weekDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case GoalType.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const count = await this.prisma.testSession.count({
      where: {
        userId,
        status: SessionStatus.COMPLETED,
        completedAt: {
          gte: startDate,
        },
      },
    });

    return count;
  }
}
