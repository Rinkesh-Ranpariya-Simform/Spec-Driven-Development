import { z } from 'zod';

const PRESET_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#06b6d4',
] as const;

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color')
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export { PRESET_COLORS };
