'use client';

import React from 'react';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { ProjectWithCounts } from '@/types/project';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: ProjectWithCounts;
}

function getProjectStatus(taskCount: number, completedCount: number) {
  if (taskCount === 0) return 'Planning';
  if (completedCount === taskCount) return 'Completed';
  return 'In Progress';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const status = getProjectStatus(
    project.taskCount,
    project.completedTaskCount
  );

  return (
    <Link
      href={`/projects/${project._id}`}
      className='block rounded-xl border border-white/10 bg-[#141414] overflow-hidden hover:border-white/20 transition-colors'
    >
      {/* Color bar */}
      <div className='h-1' style={{ backgroundColor: project.color }} />

      <div className='p-4 space-y-3'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className='w-8 h-8 rounded flex items-center justify-center'
              style={{ backgroundColor: `${project.color}20` }}
            >
              <FolderKanban
                className='h-4 w-4'
                style={{ color: project.color }}
              />
            </div>
            <div>
              <h3 className='text-sm font-medium text-white'>{project.name}</h3>
              <Badge
                variant='secondary'
                className='mt-0.5 text-[10px] bg-white/5 text-gray-400 border-0'
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className='text-xs text-gray-500 line-clamp-2'>
            {project.description}
          </p>
        )}

        {/* Task count */}
        <p className='text-xs text-gray-500'>{project.taskCount} tasks</p>

        {/* Footer */}
        <div className='flex items-center justify-between pt-2 border-t border-white/5'>
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-medium text-gray-400'>
              {project.owner?.firstName?.[0] || ''}
              {project.owner?.lastName?.[0] || ''}
            </div>
            <span className='text-xs text-gray-500'>
              {project.owner?.firstName} {project.owner?.lastName}
            </span>
          </div>
          <span className='text-xs text-gray-500'>
            {new Date(project.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
};
