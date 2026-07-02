# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # first-time setup
npm run dev        # dev server → http://localhost:3000
npm run build      # production build (also type-checks)
npm start          # serve production build
```

There is no test suite or linter configured yet. TypeScript type errors surface via `npm run build`.

## Architecture

### Stack
Next.js 14 App Router · TypeScript · Tailwind CSS 3 · `next/font/google` (no external font CDN) · `react-colorful` (in-page color picker)

Fonts: **Uncial Antiqua** (`font-display`) for the **Íocón brand wordmark only** (the hero title and the nav brand — the only two places it appears); **Cormorant Garamond** (`font-serif`) for all page/section headings and body serif text; **Inter** (`font-sans`) for UI copy. The Uncial face reads as cartoonish at heading sizes, so do NOT apply `font-display` to page titles, card titles, form labels, or body text — use `font-serif` for headings instead.

### Routing
All routes live under `app/`. There are no `pages/` directory routes.

```
/                         app/page.tsx
/gallery                  app/gallery/page.tsx              ← stub only
/order                    app/order/page.tsx                ← category landing
/order/digital-image      app/order/digital-image/page.tsx ← sub-options: Costume, Logo, Other
/order/costume            app/order/costume/page.tsx
/order/logo               app/order/logo/page.tsx           ← 'use client'
/order/drawing            app/order/drawing/page.tsx        ← 'use client'
/order/design             app/order/design/page.tsx         ← 'use client'
/waitlist                 app/waitlist/page.tsx             ← force-dynamic
/admin                    app/admin/page.tsx                ← 'use client', unprotected stub
POST   /api/contact       app/api/contact/route.ts
GET|POST /api/orders      app/api/orders/route.ts
PATCH  /api/orders/[id]   app/api/orders/[id]/route.ts     ← status updates
```

### Shared data layer (`lib/orders.ts`)
All three order forms POST to `/api/orders`, which calls `addOrder()`. The waitlist page calls `getOrders()` directly as a server component. The admin page fetches via the API and PATCHes `/api/orders/[id]` to update status. All functions operate on a **module-level in-memory array** — state resets on server restart. This is intentional for the current stub. The swap point is clearly marked: replace `getOrders()` / `addOrder()` / `updateOrderStatus()` with DB queries and set `DATABASE_URL`.

### Order data shape (`Order` interface)
Key fields: `id`, `initials`, `name`, `contactMethod` (`text|email|whatsapp|instagram`), `contactValue`, `orderType`, `status`, `details`, `sharingPlatforms`, `tagUsername`, `createdAt`. The old `email` field is gone — contact info is now captured via `contactMethod` + `contactValue` in all three forms.

### Shared form components
Reusable components used by the order forms live in `components/`:
- `FormField.tsx` — `<Field>` wrapper with label, required indicator, and error message
- `ImageUpload.tsx` — controlled multi-image upload with drag-and-drop and preview grid; images are client-side object URLs only (TODO: wire to storage)
- `ContactInfoBlock.tsx` — first/last name + contact method selector + contact value field
- `SharingPreferencesBlock.tsx` — platform multi-select + conditional tag/mention input
- `ColorPicker.tsx` — in-page color picker (preset swatches + inline `react-colorful` saturation/hue picker + hex input). Used by the drawing form's background-color field. Deliberately avoids the native `<input type="color">` OS popup.
- `FormStep.tsx` — wrapper for progressive (one-question-at-a-time) forms; renders a step as `active`, `preview` (blurred/greyed + `inert`), or `hidden`.
- `icons.tsx` — line-icon set + `<Icon name="…" />` dispatcher. Replaced the emoji that used to sit on the order cards. Swap these for Riley's artwork when it arrives.

### Progressive form prototype (logo)
`/order/logo` is an experiment in revealing one question at a time. It tracks an `activeStep` index, renders each question via `FormStep` (active / blurred-preview / hidden), and smooth-scrolls to the next. Advance is **hybrid**: the atomic "what is the logo for?" choice auto-advances on select; free-text / optional / multi-field steps use a `Continue` button. The drawing/design forms are still single-page. If the pattern proves out, lift it into them.

### Client vs. server components
- Order form pages (`/order/logo`, `/order/drawing`, `/order/design`) are `'use client'` — they own their own form state and call the API route via `fetch`.
- All other pages are server components.
- `components/Nav.tsx` is `'use client'` for the hamburger toggle and `usePathname` active-link highlighting.
- `components/ContactForm.tsx` is `'use client'` for the same reasons as order forms.

### Branding constraint
The brand name **Íocón** must always be a literal string. Never apply a Tailwind `uppercase`, `capitalize`, or `lowercase` class — or any CSS `text-transform` — to any element that contains it, as these mangle the accented Í.

### Brand assets & palette
Riley's master mockup sheets live in `design/` (not served). Individual lockups were traced to SVG in `public/brand/`: `wordmark-crowned`, `logo-horizontal`, `logo-stacked`, `crown`, `monogram` — each in color and `-black` variants. The favicon set (`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`) is generated from the crown; Next.js serves these by file convention. `components/CrownMark.tsx` is the crown as an inline SVG (`fill="currentColor"`, size via width class) — use it instead of embedding crown paths.

Colors are custom Tailwind scales in `tailwind.config.ts`: **gold** (`#FFB101` at `gold`/`gold-500`) and **olive** (`#ACAB00` at `olive`/`olive-500`) — Riley's exact picks sit at 500; other shades are derived. Rules:
- **Riley does not love dark green** — never use `olive-700`+ for headings, buttons, or surfaces. Dark UI roles use the warm dark end of the gold scale instead: headings/labels `text-gold-900` (bronze), selected chips `bg-gold-900`, dark surfaces (hero) `bg-gold-950` (espresso).
- Olive is a mid/light accent only: nav wordmark `text-olive-600`, hero wordmark `text-olive`, light washes/badges `olive-50/100/800`. Gold crown + olive wordmark together = Riley's lockup.
- Primary buttons/CTAs are `bg-gold hover:bg-gold-400 text-gold-950` — never white text on gold (fails contrast).
- Do not reintroduce Tailwind `amber-*`/`emerald-*` — they were globally replaced by these scales.
- The wordmark font in Riley's mockups **is** Uncial Antiqua (she traced the rendered text on her iPad) — live text in nav/hero is canonical; the SVG lockups match it.

### Order flow
```
/order → Digital Image
  ├── Other   → /#contact   (Home page, hash scroll to Contact section)
  ├── Logo    → /order/logo
  └── Costume → /order/costume
                  ├── Existing Costume Drawing → /order/drawing
                  └── New Costume Design       → /order/design
```
The `/#contact` anchor works because `app/page.tsx` wraps the contact section in `<section id="contact" className="scroll-mt-20">`.

### Adding a new product category
Edit the `CATEGORIES` array in `app/order/page.tsx`. Each entry has `title`, `subtitle`, and `options[]` (label, description, href). No other file needs to change.

### Stubbed integrations
- **Contact email** — `app/api/contact/route.ts` logs to console. Wire `RESEND_API_KEY` / `SENDGRID_API_KEY` / SMTP env vars when ready.
- **Order persistence** — `lib/orders.ts`. Seed rows are at the top of that file; delete them when connecting a real DB.
- **File uploads** — `ImageUpload` component renders client-side previews via object URLs. Actual upload is stubbed with a TODO comment; wire to S3/Cloudflare R2/Vercel Blob and store the returned URL when ready.
- **Gallery content** — `components/ImageGrid.tsx` uses a hardcoded `sampleImages` array. Replace with real data source (Instagram API, CMS, static imports).
