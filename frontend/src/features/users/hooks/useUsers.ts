import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useToastStore } from '../../../store/useToastStore';

export interface UserRecord {
  id: string;
  name: string;
  role: 'CONTRIBUTOR' | 'TEAM_LEAD' | 'MANAGER' | 'ADMIN';
  status: 'active' | 'inactive';
  teamId: string | null;
  team?: string;
  wipLimit: number;
  p1Limit: number;
  wipLimitOverride?: number | null;
  p1LimitOverride?: number | null;
}

const USERS_KEY = ['users'] as const;

export function useUsers() {
  return useQuery<UserRecord[]>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data } = await api.get<UserRecord[]>('/users');
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      userId,
      requesterId,
      newRole,
    }: {
      userId: string;
      requesterId: string;
      newRole: string;
    }) =>
      api.patch(`/users/${userId}/role`, { requesterId, newRole }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      addToast('Role updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update role', 'error');
    },
  });
}

export function useUpdateUserTeam() {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      userId,
      requesterId,
      teamId,
    }: {
      userId: string;
      requesterId: string;
      teamId: string | null;
    }) =>
      api.patch(`/users/${userId}/team`, { requesterId, teamId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      addToast('Team updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update team', 'error');
    },
  });
}

export function useUpdateUserLimits() {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      userId,
      requesterId,
      wipLimitOverride,
      p1LimitOverride,
    }: {
      userId: string;
      requesterId: string;
      wipLimitOverride?: number | null;
      p1LimitOverride?: number | null;
    }) =>
      api
        .patch(`/users/${userId}/limits`, { requesterId, wipLimitOverride, p1LimitOverride })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      addToast('Limits updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update limits', 'error');
    },
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      email,
      role,
    }: {
      email: string;
      role: string;
    }) => api.post('/users/invite', { email, role }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      addToast('Member invited successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to invite member', 'error');
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({
      userId,
      requesterId,
      status,
    }: {
      userId: string;
      requesterId: string;
      status: 'active' | 'inactive';
    }) =>
      api
        .patch(`/users/${userId}/status`, { requesterId, status })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      addToast('Status updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? 'Failed to update status', 'error');
    },
  });
}
