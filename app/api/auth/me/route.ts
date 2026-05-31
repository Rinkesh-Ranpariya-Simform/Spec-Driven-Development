import { NextRequest } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorized();
  return ok({ userId });
}
