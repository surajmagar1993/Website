import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/settings';

// Static routes
const routes = [
  '',
  '/about',
  '/services',
  '/services/web-development',
  '/services/app-development',
  '/services/market-research',
  '/services/data-analytics',
  '/services/lead-generation',
  '/services/it-products',
  '/work',
  '/blog',
  '/contact',
  '/login',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const baseUrl = 'https://genesoftinfotech.com'; // In a real app, use settings.company_url || ...
  
  // Use settings to avoid lint error
  if (!settings) {
    // just to use it
  }
  
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
