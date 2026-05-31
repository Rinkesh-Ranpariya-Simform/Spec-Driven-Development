import { NextRequest } from 'next/server';
import { getProjectsByUser, createProject } from '@/services/project.service';
import { createProjectSchema } from '@/lib/validations/project';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  ok,
  created,
  badRequest,
  unauthorized,
  serverError,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const projects = await getProjectsByUser(userId);
    return ok(projects);
  } catch {
    return serverError('Failed to fetch projects');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const project = await createProject(userId, parsed.data);
    return created(project);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return badRequest(err.message || 'Bad request');
    return serverError('Failed to create project');
  }
}
