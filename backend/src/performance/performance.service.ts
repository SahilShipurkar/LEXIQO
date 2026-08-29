import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodingDifficulty, SubmissionVerdict } from '@prisma/client';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(private prisma: PrismaService) { }

  async getUserPerformance(userId: string, filter: string = 'Weekly', type: string = 'Aptitude') {
    try {
      if (type === 'Coding') {
        return this.getCodingPerformance(userId, filter);
      }

      // --- Aptitude logic ---
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true, totalXP: true, level: true }
      });

      const now = new Date();
      const startDate = this.getStartDate(now, filter);
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Fetch ALL COMPLETED sessions for summary stats & all-time category mastery
      const allSessions = await this.prisma.testSession.findMany({
        where: {
          userId,
          status: 'COMPLETED'
        },
        include: { test: { include: { category: true } } },
        orderBy: { startTime: 'desc' }
      });

      // Filter sessions for the current range (chart/summary in current range)
      const rangeSessions = allSessions.filter(s => {
        const sDate = new Date(s.startTime);
        return sDate >= startDate && sDate <= endDate;
      });

      const totalTestsInRange = rangeSessions.length;
      let avgAccuracyInRange = 0;
      if (totalTestsInRange > 0) {
        avgAccuracyInRange = rangeSessions.reduce((acc, s) => acc + (s.accuracyPercentage || s.score || 0), 0) / totalTestsInRange;
      }
      const totalTimeSecondsInRange = rangeSessions.reduce((acc, s) => acc + (s.durationSeconds || (s.duration || 0) * 60), 0);

      // Metrics for charts (all time metrics, filtered by timeframe later)
      const allMetrics = await this.prisma.performanceMetric.findMany({
        where: { userId },
        orderBy: { date: 'asc' }
      });

      // All-time category breakdown (Concentration)
      const categoryCounts: Record<string, number> = {};
      allSessions.forEach(s => {
        const catName = s.test?.category?.name || s.category || 'Uncategorized';
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      });

      const focusVectors = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / (allSessions.length || 1)) * 100),
        color: this.getColorForCategory(name)
      })).sort((a, b) => b.value - a.value);

      return {
        stats: [
          { label: 'Current Level', value: `LVL ${user?.level || 1}`, sub: `${user?.totalXP || 0} Total XP`, icon: 'Target', color: '#6366F1', tendency: 'up' },
          { label: 'Avg. Accuracy', value: totalTestsInRange > 0 ? `${avgAccuracyInRange.toFixed(1)}%` : '0%', sub: `In current ${filter.toLowerCase()}`, icon: 'Activity', color: '#EC4899', tendency: 'up' },
          { label: 'Total Time', value: this.formatSecondsToText(totalTimeSecondsInRange), sub: `In current ${filter.toLowerCase()}`, icon: 'Clock', color: '#06B6D4', tendency: 'up' },
          { label: 'Current Streak', value: String(user?.currentStreak || 0), sub: `Personal best: ${user?.longestStreak || 0}`, icon: 'Flame', color: '#F59E0B', tendency: 'up' },
        ],
        focusVectors,
        heatmap: this.generateHeatmap(allMetrics),
        chartData: this.generateChartData(allMetrics, filter),
        recentActivity: allSessions.slice(0, 5).map(s => ({
          id: s.id,
          title: s.test?.title || s.testTitle || 'Aptitude Test',
          category: s.test?.category?.name || s.category || 'Logic',
          accuracy: Math.round(s.accuracyPercentage || s.score || 0),
          date: new Date(s.startTime).toLocaleDateString()
        }))
      };
    } catch (error) {
      this.logger.error(`Error in getUserPerformance: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCodingPerformance(userId: string, filter: string) {
    try {
      const now = new Date();
      const startDate = this.getStartDate(now, filter);
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      const solved = await this.prisma.userSolvedProblem.findMany({
        where: { userId },
        include: { problem: { include: { tags: true } } },
        orderBy: { firstSolvedAt: 'desc' }
      });

      const sessions = await this.prisma.codingSubmission.findMany({
        where: { userId },
        include: { problem: true },
        orderBy: { createdAt: 'desc' }
      });

      // Filter for current range
      const rangeSubmissions = sessions.filter(s => {
        const d = new Date(s.createdAt);
        return d >= startDate && d <= endDate;
      });

      const rangeSolved = solved.filter(s => {
        const d = new Date(s.firstSolvedAt);
        return d >= startDate && d <= endDate;
      });

      const topicCounts: Record<string, number> = {};
      solved.forEach(s => {
        s.problem.tags.forEach(t => {
          topicCounts[t.name] = (topicCounts[t.name] || 0) + 1;
        });
      });

      const focusVectors = Object.entries(topicCounts).map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / (solved.length || 1)) * 100),
        color: this.getColorForCategory(name)
      })).sort((a, b) => b.value - a.value);

      const totalAcceptedInRange = rangeSubmissions.filter(s => s.verdict === SubmissionVerdict.ACCEPTED).length;
      const accuracyInRange = rangeSubmissions.length > 0
        ? (totalAcceptedInRange / rangeSubmissions.length) * 100
        : 0;

      const totalTimeSecondsInRange = rangeSubmissions.reduce((acc, s) => {
        // Estimate 5 minutes (300 seconds) of focus time per submission
        return acc + 300;
      }, 0);

      // Map sessions and solves into metrics for charts
      const metrics = this.aggregateCodingMetrics(sessions, solved);

      return {
        stats: [
          { label: 'Solved Problems', value: String(rangeSolved.length), sub: `In current ${filter.toLowerCase()}`, icon: 'Target', color: '#10B981', tendency: 'up' },
          { label: 'Success Rate', value: `${accuracyInRange.toFixed(1)}%`, sub: `In current ${filter.toLowerCase()}`, icon: 'Activity', color: '#6366F1', tendency: 'up' },
          { label: 'Total Time', value: this.formatSecondsToText(totalTimeSecondsInRange), sub: `In current ${filter.toLowerCase()}`, icon: 'Clock', color: '#06B6D4', tendency: 'up' },
          { label: 'Coding Points', value: String(rangeSolved.length * 50), sub: `Earned in ${filter.toLowerCase()}`, icon: 'Flame', color: '#F59E0B', tendency: 'up' },
        ],
        focusVectors,
        heatmap: this.generateHeatmap(metrics),
        chartData: this.generateChartData(metrics, filter),
        recentActivity: sessions.slice(0, 5).map(s => ({
          id: s.id,
          title: s.problem?.title || 'Problem Solution',
          verdict: s.verdict,
          date: new Date(s.createdAt).toLocaleDateString()
        }))
      };
    } catch (error) {
      this.logger.error(`Error in getCodingPerformance: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getStartDate(now: Date, filter: string): Date {
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    if (filter === 'Weekly') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    } else if (filter === 'Monthly') {
      startDate.setDate(1);
    } else if (filter === 'Yearly') {
      startDate.setMonth(0, 1);
    }
    return startDate;
  }

  private aggregateCodingMetrics(submissions: any[], solved: any[]) {
    const dateMap: Record<string, any> = {};

    submissions.forEach(s => {
      const dStr = s.createdAt.toISOString().split('T')[0];
      if (!dateMap[dStr]) dateMap[dStr] = { date: s.createdAt, testsCompleted: 0, totalScore: 0, totalTimeMinute: 0, accuracyList: [] };
      dateMap[dStr].testsCompleted += 1;
      dateMap[dStr].totalTimeMinute += 5; // Approximate 5 mins per submission
      if (s.verdict === SubmissionVerdict.ACCEPTED) {
        dateMap[dStr].accuracyList.push(100);
      } else {
        dateMap[dStr].accuracyList.push(0);
      }
    });

    Object.keys(dateMap).forEach(d => {
      const accs = dateMap[d].accuracyList;
      dateMap[d].avgAccuracy = accs.length > 0 ? accs.reduce((a, b) => a + b, 0) / accs.length : 0;
    });

    return Object.values(dateMap);
  }

  private formatSecondsToText(seconds: number): string {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private getColorForCategory(name: string): string {
    const colors: Record<string, string> = {
      'Quantitative': '#EC4899',
      'Logical Reasoning': '#6366F1',
      'Verbal Ability': '#F59E0B',
      'Data Interpretation': '#10B981',
      'Data Structures & Algorithms': '#06B6D4',
      'Arrays': '#6366F1',
      'String': '#EC4899',
      'Stack': '#F59E0B',
      'Dynamic Programming': '#10B981',
      'Hash Table': '#06B6D4',
      'Linked List': '#8b5cf6',
      'Tree': '#f43f5e',
      'Math': '#8b5cf6',
      'Recursion': '#3b82f6'
    };
    return colors[name] || '#6366F1';
  }

  private generateHeatmap(metrics: any[]) {
    const dateMap: Record<string, number> = {};
    metrics.forEach(m => {
      const dStr = new Date(m.date).toISOString().split('T')[0];
      dateMap[dStr] = (dateMap[dStr] || 0) + (m.testsCompleted || 0);
    });
    const weeks = 24;
    const heatmap: number[][] = [];
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
    const todayLocal = new Date(`${todayStr}T00:00:00.000Z`);
    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(todayLocal);
        date.setUTCDate(todayLocal.getUTCDate() - ((weeks - w - 1) * 7 + (6 - d)));
        const dStr = date.toISOString().split('T')[0];
        week.push(dateMap[dStr] || 0);
      }
      heatmap.push(week);
    }
    return heatmap;
  }

  private generateChartData(metrics: any[], filter: string) {
    if (filter === 'Monthly') return this.getMonthlyData(metrics);
    if (filter === 'Yearly') return this.getYearlyData(metrics);
    return this.getWeeklyData(metrics);
  }

  private getWeeklyData(metrics: any[]) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const weekData: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const targetStr = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
      const m = metrics.find(met => new Date(met.date).toISOString().split('T')[0] === targetStr);
      weekData.push({
        name: days[i],
        tests: m?.testsCompleted || 0,
        accuracy: m?.avgAccuracy || 0,
        time: m?.totalTimeMinute || 0
      });
    }
    return weekData;
  }

  private getMonthlyData(metrics: any[]) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthData: any[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const targetDate = new Date(year, month, i);
      const tzOffset = targetDate.getTimezoneOffset() * 60000;
      const targetStr = new Date(targetDate.getTime() - tzOffset).toISOString().split('T')[0];
      const m = metrics.find(met => new Date(met.date).toISOString().split('T')[0] === targetStr);
      monthData.push({
        name: String(i),
        tests: m?.testsCompleted || 0,
        accuracy: m?.avgAccuracy || 0,
        time: m?.totalTimeMinute || 0
      });
    }
    return monthData;
  }

  private getYearlyData(metrics: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: any[] = [];
    const now = new Date();
    const year = now.getFullYear();
    for (let i = 0; i < 12; i++) {
      const monthStr = String(i + 1).padStart(2, '0');
      const targetPrefix = `${year}-${monthStr}`;
      const monthMetrics = metrics.filter(m => new Date(m.date).toISOString().startsWith(targetPrefix));
      data.push({
        name: months[i],
        tests: monthMetrics.reduce((acc, m) => acc + m.testsCompleted, 0),
        accuracy: monthMetrics.length > 0 ? monthMetrics.reduce((acc, m) => acc + m.avgAccuracy, 0) / monthMetrics.length : 0,
        time: monthMetrics.reduce((acc, m) => acc + m.totalTimeMinute, 0)
      });
    }
    return data;
  }
}
