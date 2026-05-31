import { NextRequest } from 'next/server';
import { updateTask, deleteTask } from '@/services/task.service';
import { updateTaskSchema } from '@/lib/validations/task';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { taskId } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const task = await updateTask(taskId, userId, parsed.data);
    return ok(task);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to update task');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { taskId } = await params;
    await deleteTask(taskId, userId);
    return ok({ message: 'Task deleted' });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to delete task');
  }
}
