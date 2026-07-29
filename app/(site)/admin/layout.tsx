import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// The admin pages are client components, so the title lives here.
export const metadata: Metadata = {
  title: 'Admin — Íocón Graphics',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
