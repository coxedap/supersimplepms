export type TaskStatus = 'TODO' | 'DOING' | 'DONE' | 'BLOCKED' | 'OVERDUE';
export type Priority = 'P1' | 'P2' | 'P3';

export interface Task {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  projectId?: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  estimatedEffort: number;
  actualEffort?: number;
  blockerReason?: string;
  blockedAt?: string;
  startedAt?: string;
  createdAt: string;
  completedAt?: string;
}
