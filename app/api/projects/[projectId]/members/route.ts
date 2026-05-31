import { NextRequest } from 'next/server';
import {
  getMembersWithOwner,
  addMember,
  removeMember,
} from '@/services/project.service';
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
    const members = await getMembersWithOwner(projectId, userId);
    return ok(members);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to fetch members');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { projectId } = await params;
    const body = await request.json();
    if (!body.userId) return badRequest('userId is required');

    const members = await addMember(projectId, userId, body.userId);
    return ok(members);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 400) return badRequest(err.message || 'Bad request');
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to add member');
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
    const body = await request.json();
    if (!body.userId) return badRequest('userId is required');

    const members = await removeMember(projectId, userId, body.userId);
    return ok(members);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 400) return badRequest(err.message || 'Bad request');
    if (err.status === 403) return forbidden(err.message);
    if (err.status === 404) return notFound(err.message);
    return serverError('Failed to remove member');
  }
}
