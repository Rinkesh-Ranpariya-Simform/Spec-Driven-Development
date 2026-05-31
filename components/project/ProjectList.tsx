'use client';

import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { FolderKanban } from 'lucide-react';

export const ProjectList: React.FC = () => {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-white/10 bg-[#141414] h-[200px] animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <FolderKanban className='h-12 w-12 text-gray-600 mb-4' />
        <h3 className='text-lg font-medium text-white mb-1'>No projects yet</h3>
        <p className='text-sm text-gray-500'>
          Create your first project to get started
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {projects.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};
