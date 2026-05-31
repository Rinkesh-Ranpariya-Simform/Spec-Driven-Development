'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { TaskWithAssignee } from '@/types/task';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '@/components/task/TaskCard';
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog';
import { EditTaskDialog } from '@/components/task/EditTaskDialog';

const COLUMNS = [
  { status: 'backlog', label: 'Backlog', color: '#6b7280' },
  { status: 'todo', label: 'To Do', color: '#3b82f6' },
  { status: 'inprogress', label: 'In Progress', color: '#f59e0b' },
  { status: 'inreview', label: 'In Review', color: '#8b5cf6' },
  { status: 'done', label: 'Done', color: '#10b981' },
];

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { data: tasks = [] } = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] =
    useState<string>('todo');
  const [editTask, setEditTask] = useState<TaskWithAssignee | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const groupedTasks = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = tasks.filter(t => t.status === col.status);
      return acc;
    },
    {} as Record<string, TaskWithAssignee[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Only update if dropped on a valid column
    if (COLUMNS.some(c => c.status === newStatus)) {
      updateTask.mutate({ taskId, status: newStatus });
    }
  };

  return (
    <div className='h-full flex flex-col'>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide flex-1 min-h-0'>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              tasks={groupedTasks[col.status] || []}
              projectId={projectId}
              onAddTask={status => {
                setCreateDefaultStatus(status);
                setCreateOpen(true);
              }}
              onEditTask={setEditTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        defaultStatus={createDefaultStatus}
      />
      {editTask && (
        <EditTaskDialog
          open={!!editTask}
          onOpenChange={open => {
            if (!open) setEditTask(null);
          }}
          task={editTask}
          projectId={projectId}
        />
      )}
    </div>
  );
};
