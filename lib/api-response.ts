import { NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export function ok<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function badRequest(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export function unauthorized(
  message = 'Unauthorized'
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = 'Not found'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(
  message = 'Internal server error'
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
