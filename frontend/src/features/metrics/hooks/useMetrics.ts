import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics.api';

export const metricsKeys = {
  all: ['metrics'] as const,
  weekly: (userId: string, weekStart: string) => [...metricsKeys.all, 'weekly', userId, weekStart] as const,
};

export function useWeeklyMetrics(userId: string, weekStart: Date) {
  const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
  
  return useQuery({
    queryKey: metricsKeys.weekly(userId, weekStartStr),
    queryFn: () => metricsApi.getWeekly(userId, weekStartStr),
    placeholderData: (previousData) => previousData,
  });
}
