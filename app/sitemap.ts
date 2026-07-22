import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Public, indexable pages only. /admin and /api are crawler-blocked in
// robots.ts; /waitlist stays crawlable but is left out here — it's a live
// order-status view with nothing worth surfacing in search results.
const ROUTES = [
  '',
  '/gallery',
  '/shop',
  '/shop/solo-icon',
  '/shop/solo-icon/new-costume',
  '/shop/solo-icon/existing-costume',
  '/shop/group-icons',
  '/shop/through-the-years',
  '/shop/walking-duo',
  '/review',
  '/terms',
  '/privacy',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
