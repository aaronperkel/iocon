// Public site origin, shared by metadataBase (app/layout.tsx), robots.txt,
// and sitemap.xml. Must be the real domain — the per-deployment VERCEL_URL
// sits behind Vercel's deployment protection, so scrapers can't reach it.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iocongraphics.com'
