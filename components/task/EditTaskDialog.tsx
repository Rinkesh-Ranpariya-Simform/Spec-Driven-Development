'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateTask } from '@/hooks/useTasks';
import { useMembers } from '@/hooks/useMembers';
import { TaskWithAssignee } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/lib/constants';
import { AssigneePicker } from '@/components/task/AssigneePicker';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
  projectId: string;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  projectId,
}) => {
  const updateTask = useUpdateTask(projectId);
  const { data: members } = useMembers(projectId);
  const [status, setStatus] = useState<string | null>(task.status);
  const [priority, setPriority] = useState<string | null>(
    task.priority || 'none'
  );
  const [assignee, setAssignee] = useState<string | null>(
    task.assignedTo?._id || 'unassigned'
  );

  const { register, getValues } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  const handleSave = async () => {
    const data = getValues();
    if (!data.title) return;
    try {
      await updateTask.mutateAsync({
        taskId: task._id,
        title: data.title,
        description: data.description || '',
        status: status || task.status,
        priority: !priority || priority === 'none' ? null : priority,
        assignedTo: !assignee || assignee === 'unassigned' ? null : assignee,
        dueDate: data.dueDate || null,
      });
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#1a1a1a] border-white/10 text-white max-w-lg'>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Title *</Label>
            <Input
              placeholder='What needs to be done?'
              className='bg-[#141414] border-white/10 text-white'
              {...register('title')}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Description</Label>
            <textarea
              placeholder='Add more context...'
              className='w-full min-h-[60px] rounded-md bg-[#141414] border border-white/10 text-white text-sm p-3 resize-y placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20'
              {...register('description')}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-semibold'>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className='bg-[#141414] border-white/10 text-white'>
                  <span className='text-sm'>
                    {STATUS_LABELS[status || 'todo']}
                  </span>
                </SelectTrigger>
                <SelectContent className='bg-[#1a1a1a] border-white/10'>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-semibold'>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className='bg-[#141414] border-white/10 text-white'>
                  <span className='text-sm'>
                    {PRIORITY_LABELS[priority || 'none']}
                  </span>
                </SelectTrigger>
                <SelectContent className='bg-[#1a1a1a] border-white/10'>
                  {PRIORITY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-semibold'>Assignee</Label>
              <AssigneePicker
                value={assignee}
                onChange={setAssignee}
                members={members}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-semibold'>Due Date</Label>
              <Input
                type='date'
                className='bg-[#141414] border-white/10 text-white'
                {...register('dueDate')}
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='text-gray-400'
            >
              Cancel
            </Button>
            <Button
              type='button'
              disabled={updateTask.isPending}
              onClick={handleSave}
              className='bg-white text-black hover:bg-gray-200'
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
