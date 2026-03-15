import { PrismaClient } from "@prisma/client";

export interface CalculateMetricsDTO {
  userId: string;
  weekStart: Date;
}

export class MetricsService {
  constructor(private readonly prisma: PrismaClient) {}

  public async calculateWeeklyMetrics(userId: string, weekStart: Date) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get tasks completed this week
    const completedTasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        status: 'DONE',
        completedAt: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    });

    const tasksAssigned = await this.prisma.task.count({
      where: {
        ownerId: userId,
        createdAt: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    });

    const tasksCompleted = completedTasks.length;
    
    // On-Time Rate: completedAt <= deadline
    const onTimeCount = completedTasks.filter(t => t.completedAt! <= t.deadline).length;
    const onTimeRate = tasksCompleted > 0 ? (onTimeCount / tasksCompleted) * 100 : 0;

    // Avg Cycle Time: time from startedAt to completedAt (in hours)
    let totalCycleTimeMs = 0;
    let cycleTimeCount = 0;
    
    completedTasks.forEach(t => {
      if (t.startedAt && t.completedAt) {
        totalCycleTimeMs += t.completedAt.getTime() - t.startedAt.getTime();
        cycleTimeCount++;
      }
    });
    
    const avgCycleTimeHours = cycleTimeCount > 0 
      ? (totalCycleTimeMs / cycleTimeCount) / (1000 * 60 * 60) 
      : 0;

    // Blocked Time Ratio: This requires more granular tracking of all status transitions
    // For now, we'll return 0 or calculate based on the current implementation
    const blockedTimeRatio = 0; 

    // Verify user exists before upserting
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      throw new Error('UNAUTHENTICATED'); // Will be caught by middleware to redirect to login
    }

    // Save/Upsert metrics
    await this.prisma.weeklyMetrics.upsert({
      where: {
        userId_weekStart: {
          userId,
          weekStart
        }
      },
      update: {
        tasksAssigned,
        tasksCompleted,
        onTimeRate,
        avgCycleTime: avgCycleTimeHours,
        blockedTimeRatio
      },
      create: {
        userId,
        weekStart,
        tasksAssigned,
        tasksCompleted,
        onTimeRate,
        avgCycleTime: avgCycleTimeHours,
        blockedTimeRatio
      }
    });

    return {
      userId,
      weekStart,
      tasksAssigned,
      tasksCompleted,
      onTimeRate,
      avgCycleTime: avgCycleTimeHours,
      blockedTimeRatio
    };
  }
}
