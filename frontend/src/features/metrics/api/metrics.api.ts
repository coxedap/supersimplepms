import { api } from '../../../lib/api';
import { WeeklyMetrics } from '../types';

export const metricsApi = {
  getWeekly: async (userId: string, weekStart: string) => {
    const { data } = await api.get<WeeklyMetrics>(`/metrics/weekly/${userId}`, {
      params: { weekStart }
    });
    return data;
  }
};
