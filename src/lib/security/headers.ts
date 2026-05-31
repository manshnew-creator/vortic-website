import { NextResponse } from 'next/server';

/**
 * Builds Content Security Policy (CSP) and security headers for high performance websites
 */
export const appendSecurityHeaders = (response: NextResponse): NextResponse => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Core Security Headers Configuration
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS configuration - Restrict to trusted origins only (FIXED)
  const allowedOrigin = process.env.NEXT_PUBLIC_ROOT_DOMAIN 
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` 
    : 'https://vortic.website';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // CSP configurations: Strict script, style, image sources
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: https://images.unsplash.com https://*.supabase.co https://*.supabase.in;
    media-src 'self' https://*.youtube.com https://*.vimeo.com;
    frame-src 'self' https://*.youtube.com https://*.vimeo.com;
    connect-src 'self' https://*.supabase.co https://*.supabase.in https://vitals.vercel-insights.com;
  `.replace(/\s+/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
};
