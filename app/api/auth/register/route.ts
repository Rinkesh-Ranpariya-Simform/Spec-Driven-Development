import { NextRequest } from 'next/server';
import { registerUser } from '@/services/auth.service';
import { registerSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth';
import { created, badRequest, serverError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const user = await registerUser(parsed.data);
    const token = signToken({ userId: user._id });

    const response = created(user);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error('Register error:', error);
    const err = error as { status?: number; message?: string };
    if (err.status === 400) return badRequest(err.message || 'Bad request');
    return serverError('Registration failed');
  }
}
