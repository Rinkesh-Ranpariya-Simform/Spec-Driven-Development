'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { TaskWithAssignee } from '@/types/task';
import { TaskCard } from '@/components/task/TaskCard';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  status: string;
  label: string;
  color: string;
  tasks: TaskWithAssignee[];
  projectId?: string;
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: TaskWithAssignee) => void;
  onEditTask?: (task: TaskWithAssignee) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  label,
  color,
  tasks,
  projectId,
  onAddTask,
  onTaskClick,
  onEditTask,
}) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className='flex-shrink-0 w-[280px] bg-[#111111] rounded-xl p-3 h-full'>
      {/* Column header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-white'>{label}</span>
          <span className='text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded'>
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <Button
            variant='ghost'
            size='icon-xs'
            onClick={() => onAddTask(status)}
            className='text-gray-500 hover:text-white cursor-pointer'
          >
            <Plus className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Color bar */}
      <div
        className='h-0.5 rounded-full mb-3'
        style={{ backgroundColor: color }}
      />

      {/* Tasks */}
      <div ref={setNodeRef} className='space-y-2 min-h-[200px]'>
        <SortableContext
          items={tasks.map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              projectId={projectId}
              onClick={() => onTaskClick?.(task)}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className='flex items-center justify-center py-8'>
            <Button
              variant='ghost'
              onClick={() => onAddTask?.(status)}
              className='text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1'
            >
              <Plus className='h-3 w-3' />
              Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
