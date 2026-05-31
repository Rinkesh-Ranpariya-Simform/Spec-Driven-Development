import { NextRequest } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '@/services/project.service';
import { updateProjectSchema } from '@/lib/validations/project';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { projectId } = await params;
    const project = await getProjectById(projectId, userId);
    return ok(project);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to fetch project');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { projectId } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const project = await updateProject(projectId, userId, parsed.data);
    return ok(project);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to update project');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { projectId } = await params;
    await deleteProject(projectId, userId);
    return ok({ message: 'Project deleted' });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to delete project');
  }
}
