'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberWithRole } from '@/types/user';

export function useMembers(projectId: string) {
  return useQuery<MemberWithRole[]>({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/members`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!projectId,
  });
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
  });
}
