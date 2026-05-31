import { NextRequest } from 'next/server';
import { loginUser } from '@/services/auth.service';
import { loginSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth';
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const user = await loginUser(parsed.data);
    const token = signToken({ userId: user._id });

    const response = ok(user);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 401)
      return unauthorized(err.message || 'Invalid credentials');
    return serverError('Login failed');
  }
}
