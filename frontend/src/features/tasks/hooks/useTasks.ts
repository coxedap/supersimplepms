import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Task, TaskStatus, Priority } from '../types';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (ownerId: string) => [...taskKeys.lists(), ownerId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  dashboards: ['dashboard'] as const,
};

export function useTasks(ownerId: string) {
  return useQuery({
    queryKey: taskKeys.list(ownerId),
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/tasks/owner/${ownerId}`);
      return data;
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: TaskStatus; reason?: string }) => {
      const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status, reason });
      return data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.all,
          previousTasks.map((t) => (t.id === id ? { ...t, status } : t))
        );
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboards });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: updatedTask } = await api.put<Task>(`/tasks/${id}`, data);
      return updatedTask;
    },
    onSuccess: (updatedTask) => {
      // Optimistic update if we have the list
      queryClient.setQueriesData<Task[]>(
        { queryKey: taskKeys.all },
        (old) => old?.map(t => t.id === updatedTask.id ? updatedTask : t)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboards });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, requesterId }: { id: string; requesterId: string }) => {
      await api.delete(`/tasks/${id}`, { data: { requesterId } });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboards });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: {
      title: string;
      description?: string;
      creatorId: string;
      ownerId: string;
      projectId?: string;
      priority: Priority;
      deadline: string;
      estimatedEffort: number;
    }) => {
      const { data } = await api.post<Task>('/tasks', newTask);
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboards });
    },
  });
}
