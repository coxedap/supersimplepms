import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useToastStore } from '../../../store/useToastStore';

export interface ProjectRecord {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
}

export const PROJECTS_KEY = ['projects'] as const;

export function useProjects() {
  return useQuery<ProjectRecord[]>({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ProjectRecord[]>('/projects');
      return data;
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      name,
      description,
      managerId,
      creatorId,
    }: {
      name: string;
      description?: string;
      managerId: string;
      creatorId: string;
    }) =>
      api.post('/projects', { name, description, managerId, creatorId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      addToast('Project created successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to create project', 'error');
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
      managerId,
      status,
      requesterId,
    }: {
      id: string;
      name?: string;
      description?: string;
      managerId?: string;
      status?: 'active' | 'archived' | 'completed';
      requesterId: string;
    }) =>
      api
        .put(`/projects/${id}`, { name, description, managerId, status, requesterId })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      addToast('Project updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update project', 'error');
    },
  });
}
