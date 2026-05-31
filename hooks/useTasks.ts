'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskWithAssignee } from '@/types/task';

export function useTasks(projectId: string) {
  return useQuery<TaskWithAssignee[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      ...data
    }: { taskId: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onMutate: async variables => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = queryClient.getQueryData<TaskWithAssignee[]>([
        'tasks',
        projectId,
      ]);
      if (previous) {
        const { taskId, ...rest } = variables;
        queryClient.setQueryData<TaskWithAssignee[]>(
          ['tasks', projectId],
          previous.map(t => (t._id === taskId ? { ...t, ...rest } : t))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks', projectId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
