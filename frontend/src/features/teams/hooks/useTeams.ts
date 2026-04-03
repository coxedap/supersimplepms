import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useToastStore } from '../../../store/useToastStore';

export interface TeamRecord {
  id: string;
  name: string;
  leaderId?: string;
  createdAt: string;
}

const TEAMS_KEY = ['teams'] as const;

export function useTeams() {
  return useQuery<TeamRecord[]>({
    queryKey: TEAMS_KEY,
    queryFn: async () => {
      const { data } = await api.get<TeamRecord[]>('/teams');
      return data;
    },
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      name,
      leaderId,
      creatorId,
    }: {
      name: string;
      leaderId?: string;
      creatorId: string;
    }) => api.post('/teams', { name, leaderId, creatorId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEAMS_KEY });
      addToast('Team created successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to create team', 'error');
    },
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      id,
      name,
      leaderId,
      requesterId,
    }: {
      id: string;
      name?: string;
      leaderId?: string | null;
      requesterId: string;
    }) =>
      api.patch(`/teams/${id}`, { name, leaderId, requesterId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEAMS_KEY });
      addToast('Team updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update team', 'error');
    },
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      userId,
      teamId,
      requesterId,
    }: {
      userId: string;
      teamId: string;
      requesterId: string;
    }) => api.post('/teams/members', { userId, teamId, requesterId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEAMS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
      addToast('Member added successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to add member', 'error');
    },
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      requesterId,
    }: {
      teamId: string;
      userId: string;
      requesterId: string;
    }) =>
      api
        .delete(`/teams/${teamId}/members/${userId}`, { data: { requesterId } })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEAMS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
      addToast('Member removed successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to remove member', 'error');
    },
  });
}
