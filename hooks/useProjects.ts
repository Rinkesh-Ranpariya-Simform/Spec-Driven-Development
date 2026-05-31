'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectWithCounts } from '@/types/project';

export function useProjects() {
  return useQuery<ProjectWithCounts[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
  });
}

export function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['projects'] });
}
