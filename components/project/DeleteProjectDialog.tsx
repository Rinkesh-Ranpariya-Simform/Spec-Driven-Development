'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInvalidateProjects } from '@/hooks/useProjects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: { _id: string; name: string };
  taskCount?: number;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  open,
  onOpenChange,
  project,
  taskCount = 0,
}) => {
  const router = useRouter();
  const invalidateProjects = useInvalidateProjects();

  const handleDelete = async () => {
    const res = await fetch(`/api/projects/${project._id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      invalidateProjects();
      onOpenChange(false);
      router.push('/projects');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='bg-[#1a1a1a] border-white/10 text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription className='text-gray-400'>
            This will permanently delete &quot;{project.name}&quot; and all{' '}
            {taskCount} tasks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='bg-transparent border-white/10 text-gray-400 hover:text-white'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-red-600 hover:bg-red-700 text-white'
          >
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
