'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectList } from '@/components/project/ProjectList';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: projects } = useProjects();

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Projects</h1>
          <p className='text-sm text-gray-500'>
            {projects?.length ?? 0} project{projects?.length !== 1 ? 's' : ''}{' '}
            in your organization
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className='bg-white text-black hover:bg-gray-200 gap-2 cursor-pointer'
        >
          <Plus className='h-4 w-4' />
          New Project
        </Button>
      </div>

      <ProjectList />
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
