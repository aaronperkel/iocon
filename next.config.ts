import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Gallery images uploaded from the admin Gallery tab live in Vercel Blob.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // The order flow moved to /shop (Riley's "Shop" rename). Keep old links alive.
  async redirects() {
    return [
      { source: '/order', destination: '/shop', permanent: false },
      { source: '/order/:path*', destination: '/shop', permanent: false },
    ]
  },
}

export default nextConfig
