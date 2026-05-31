import { NextRequest, NextResponse } from 'next/server';
import { EdgeRedisCache } from './lib/cache/redis';

export const config = {
  matcher: [
    /*
     * Match all paths except internal Next.js assets, static files, and vercel endpoints
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'vortic.website';

  // 1. UNIFIED SINGLE-DOMAIN ARCHITECTURE BYPASS (Vortic.website & Vercel Previews)
  // These are the main platform routes. Requests to these domains bypass the multi-tenant rewrites
  // and serve the main marketing site, builder workspace, and admin dashboard.
  const appDomains = [
    'localhost:3000',
    'vortic.website',
    'www.vortic.website',
    'admin.vortic.website',
  ];

  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Automatically bypass Next.js multi-tenant rewrites for Vercel preview domains (Issue Resolution)
  // E.g. vortic-ten.vercel.app or any git-branched preview domain
  const isVercelDomain = hostname.endsWith('.vercel.app');
  const isAppDomain = appDomains.some((domain) => hostname === domain);

  if (isAppDomain || isVercelDomain) {
    // Let the main SaaS application render natively (Frictionless Onboarding & Builder Canvas)
    return NextResponse.next();
  }

  // 2. DYNAMIC MULTI-TENANT WILDCARD SUBDOMAIN RESOLUTION (*.vortic.website)
  // Extracts the specific client's subdomain (e.g. "clinic" from "clinic.vortic.website")
  let tenantDomain = hostname;
  if (hostname.endsWith('.vortic.website')) {
    tenantDomain = hostname.replace('.vortic.website', '');
  }

  // Fetch the resolved tenant subdomain mapping from the Edge Distributed Redis cache (TTL 120s)
  let resolvedTenant = await EdgeRedisCache.get(`domain:${tenantDomain}`);

  if (!resolvedTenant) {
    try {
      // Fallback: In production, query the database or resolve subdomain matches
      // For fallback/simulation, we assume the subdomain matches the internal tenant folder identifier
      resolvedTenant = tenantDomain; 

      // Save to global distributed edge cache to protect database connection pools
      await EdgeRedisCache.set(`domain:${tenantDomain}`, resolvedTenant, 120);
    } catch (err) {
      console.error('[Edge Router] Critical domain resolver failure:', err);
      resolvedTenant = tenantDomain; // Fallback to prevent outage
    }
  }

  if (!resolvedTenant) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }

  // 3. SECURE INTERNAL PATH REWRITE
  // Redirects visitor internally to /_sites/[tenant]/[path] seamlessly without changing the address bar!
  const rewriteUrl = new URL(`/_sites/${resolvedTenant}${path}`, req.url);
  const response = NextResponse.rewrite(rewriteUrl);
  
  // Inject context header details for downstream API operations
  response.headers.set('x-tenant-domain', resolvedTenant);

  return response;
}
