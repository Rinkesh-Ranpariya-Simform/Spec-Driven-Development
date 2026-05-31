'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectInput,
  PRESET_COLORS,
} from '@/lib/validations/project';
import { useInvalidateProjects } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const invalidateProjects = useInvalidateProjects();
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { color: PRESET_COLORS[0] },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, color: selectedColor }),
    });
    if (res.ok) {
      invalidateProjects();
      reset();
      setSelectedColor(PRESET_COLORS[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#1a1a1a] border-white/10 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>
            Create Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Project Name</Label>
            <Input
              placeholder='e.g. Website Redesign'
              className='bg-[#141414] border-white/10 text-white'
              {...register('name')}
            />
            {errors.name && (
              <p className='text-xs text-red-400'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Description</Label>
            <textarea
              placeholder='What is this project about?'
              className='w-full min-h-[80px] rounded-md bg-[#141414] border border-white/10 text-white text-sm p-3 resize-y placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20'
              {...register('description')}
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>Color</Label>
            <div className='flex gap-2'>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type='button'
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    selectedColor === color &&
                      'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
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
              type='submit'
              disabled={isSubmitting}
              className='bg-white text-black hover:bg-gray-200'
            >
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
