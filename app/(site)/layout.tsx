import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// The real site's chrome — every public page and the admin portal render
// inside it. It lives on this route group rather than the root layout so
// /coming-soon (the pre-launch landing, outside the group) stays plain:
// no nav, no footer, no site links (Riley's Aug 1 gate). The root layout
// keeps <html>/<body>, fonts, metadata, and analytics.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
