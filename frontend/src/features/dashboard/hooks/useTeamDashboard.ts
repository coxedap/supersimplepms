import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Task } from '../../tasks/types';

export type TeamTask = Task & {
  ownerName: string;
  projectName: string;
  risk: { level: string; reason?: string };
};

export interface TeamDashboardData {
  tasksPerStatus: Record<string, number>;
  overdueByOwner: Array<{
    ownerName: string;
    count: number;
    tasks: Array<{ id: string; title: string; deadline: string }>;
  }>;
  overloadedUsers: Array<{
    id: string;
    name: string;
    wipCount: number;
    limit: number;
  }>;
  projectHealth: Array<{
    id: string;
    name: string;
    taskCount: number;
    statusDistribution: Record<string, number>;
    riskScore: number;
  }>;
  allTeamTasks: TeamTask[];
}

export function useTeamDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'team'],
    queryFn: async () => {
      const { data } = await api.get<TeamDashboardData>('/dashboard/team');
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s for the team dashboard
  });
}
