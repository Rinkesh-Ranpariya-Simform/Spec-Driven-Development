import { NextRequest } from 'next/server';
import { getTasksByProject, createTask } from '@/services/task.service';
import { createTaskSchema } from '@/lib/validations/task';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return badRequest('projectId is required');

    const tasks = await getTasksByProject(projectId, userId);
    return ok(tasks);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    return serverError('Failed to fetch tasks');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const task = await createTask(userId, parsed.data);
    return created(task);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    return serverError('Failed to create task');
  }
}
