'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { TaskWithAssignee, TaskStatus } from '@/types/task';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: TaskWithAssignee;
  projectId?: string;
  onClick?: () => void;
  onEdit?: (task: TaskWithAssignee) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
  critical: 'bg-red-800',
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { value: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { value: 'inprogress', label: 'In Progress', color: 'bg-orange-500' },
  { value: 'inreview', label: 'In Review', color: 'bg-purple-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
];

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projectId,
  onClick,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const updateTask = useUpdateTask(projectId || task.projectId);
  const deleteTask = useDeleteTask(projectId || task.projectId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ taskId: task._id, status });
  };

  const handleDelete = () => {
    deleteTask.mutate(task._id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className='group p-3 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-white/10 cursor-grab active:cursor-grabbing space-y-2 relative'
    >
      {/* 3-dot menu */}
      {projectId && (
        <div
          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger className='p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white'>
              <MoreHorizontal className='h-4 w-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='bg-[#1a1a1a] border-white/10 text-white min-w-[160px]'
              align='end'
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className='text-sm'>
                  Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className='bg-[#1a1a1a] border-white/10 text-white'>
                  {STATUS_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className='text-sm gap-2'
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${opt.color}`}
                      />
                      {opt.label}
                      {task.status === opt.value && (
                        <span className='ml-auto text-xs text-gray-400'>✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator className='bg-white/10' />
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(task)}
                  className='text-sm gap-2'
                >
                  <Pencil className='h-3.5 w-3.5' />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-sm gap-2 text-red-400 focus:text-red-400'
              >
                <Trash2 className='h-3.5 w-3.5' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className='flex items-center gap-2'>
        {task.priority && (
          <div
            className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-500'}`}
          />
        )}
        {!task.priority && <div className='w-3 h-3 rounded-full bg-gray-600' />}
        <p className='text-sm font-medium text-white leading-tight pr-6'>
          {task.title}
        </p>
      </div>

      {task.assignedTo &&
        typeof task.assignedTo === 'object' &&
        task.assignedTo.firstName && (
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[9px] font-medium text-white'>
              {task.assignedTo.firstName[0]}
              {task.assignedTo.lastName?.[0] || ''}
            </div>
            <span className='text-xs text-gray-400'>
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </span>
          </div>
        )}
    </div>
  );
};
