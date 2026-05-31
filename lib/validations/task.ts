import { z } from 'zod';

const TASK_STATUSES = [
  'backlog',
  'todo',
  'inprogress',
  'inreview',
  'done',
] as const;
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000).optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
