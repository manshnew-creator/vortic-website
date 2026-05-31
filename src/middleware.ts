import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { appendSecurityHeaders } from './lib/security/headers';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  return appendSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
