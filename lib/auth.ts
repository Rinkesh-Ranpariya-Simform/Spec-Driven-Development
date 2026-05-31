import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = /token=([^;]+)/.exec(cookieHeader);
  if (!match) return null;
  const payload = verifyToken(match[1]);
  return payload?.userId ?? null;
}
