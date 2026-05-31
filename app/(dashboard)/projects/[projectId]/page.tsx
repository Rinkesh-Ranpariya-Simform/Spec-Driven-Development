'use client';

import { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog';
import { AddMemberDialog } from '@/components/members/AddMemberDialog';
import { EditProjectDialog } from '@/components/project/EditProjectDialog';
import { DeleteProjectDialog } from '@/components/project/DeleteProjectDialog';
import { MemberList } from '@/components/members/MemberList';

type Tab = 'board' | 'members';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('board');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
  });

  return (
    <div className='flex flex-col flex-1 min-h-0'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
            <Link href='/projects' className='hover:text-white'>
              Projects
            </Link>
            <span>&gt;</span>
            <span className='text-white font-medium'>
              {project?.name || 'Loading...'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            onClick={() => setCreateTaskOpen(true)}
            className='bg-white text-black hover:bg-gray-200 gap-2 cursor-pointer'
          >
            <Plus className='h-4 w-4' />
            Add Task
          </Button>
          <Button
            onClick={() => setAddMemberOpen(true)}
            variant='outline'
            className='border-white/10 text-white hover:bg-white/5 gap-2'
          >
            <Users className='h-4 w-4' />
            Add Member
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className='inline-flex items-center justify-center h-9 w-9 rounded-md border border-white/10 text-white hover:bg-white/5'>
              <MoreHorizontal className='h-4 w-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-[#1a1a1a] border-white/10'
            >
              <DropdownMenuItem
                onClick={() => setEditProjectOpen(true)}
                className='text-gray-300 hover:text-white cursor-pointer'
              >
                <Pencil className='h-4 w-4 mr-2' />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteProjectOpen(true)}
                className='text-red-400 hover:text-red-300 cursor-pointer'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab navigation */}
      <div className='flex items-center gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit'>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
            activeTab === 'board'
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutGrid className='h-4 w-4' />
          Board
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
            activeTab === 'members'
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className='h-4 w-4' />
          Members
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'board' && (
        <div className='flex-1 min-h-0'>
          <KanbanBoard projectId={projectId} />
        </div>
      )}
      {activeTab === 'members' && (
        <div className='rounded-xl border border-white/10 bg-[#141414] p-6'>
          <h3 className='text-lg font-semibold text-white mb-1'>
            Project Members
          </h3>
          <p className='text-sm text-gray-400 mb-6'>
            Team members with access to this project
          </p>
          <MemberList projectId={projectId} isOwner={true} />
        </div>
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={projectId}
      />
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        projectId={projectId}
      />
      {project && (
        <>
          <EditProjectDialog
            open={editProjectOpen}
            onOpenChange={setEditProjectOpen}
            project={project}
          />
          <DeleteProjectDialog
            open={deleteProjectOpen}
            onOpenChange={setDeleteProjectOpen}
            project={project}
            taskCount={project.taskCount}
          />
        </>
      )}
    </div>
  );
}
