import { NextRequest } from 'next/server';
import { searchUsers } from '@/services/user.service';
import { getUserIdFromRequest } from '@/lib/auth';
import { ok, unauthorized, serverError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const users = await searchUsers(q);
    return ok(users);
  } catch {
    return serverError('Failed to search users');
  }
}
