import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vortic.website';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/editor', '/templates', '/pricing', '/contact', '/dashboard', '/dashboard/analytics', '/onboarding', '/login', '/signup', '/status', '/changelog', '/privacy', '/terms', '/refund'];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.includes('editor') ? 0.9 : 0.7,
  }));
}
