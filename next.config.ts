import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The order flow moved to /shop (Riley's "Shop" rename). Keep old links alive.
  async redirects() {
    return [
      { source: '/order', destination: '/shop', permanent: false },
      { source: '/order/:path*', destination: '/shop', permanent: false },
    ]
  },
}

export default nextConfig
