export interface WeeklyMetrics {
  userId: string;
  weekStart: string;
  tasksAssigned: number;
  tasksCompleted: number;
  onTimeRate: number;
  avgCycleTime: number;
  blockedTimeRatio: number;
}
