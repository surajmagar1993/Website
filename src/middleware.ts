import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only restrict access to sitemap.xml
  if (pathname === '/sitemap.xml') {
    const userAgent = request.headers.get('user-agent') || '';
    
    // List of common bot identifiers (case-insensitive check)
    const botIdentifiers = [
      'googlebot',
      'bingbot',
      'slurp',
      'duckduckbot',
      'baiduspider',
      'yandexbot',
      'sogou',
      'exabot',
      'facebot',
      'ia_archiver'
    ];

    const isBot = botIdentifiers.some(bot => userAgent.toLowerCase().includes(bot));

    // If it's not a verified bot, block access
    if (!isBot) {
      return new NextResponse('Forbidden: Sitemap is only accessible to search engine crawlers.', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/sitemap.xml',
};
