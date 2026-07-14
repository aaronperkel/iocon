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

Fonts: **Uncial Antiqua** (`font-display`) for the **Íocón brand wordmark only** (the hero title and the nav brand — the only two places it appears); **Alegreya Sans** (`font-heading`) for all page/section headings — a humanist sans with calligraphic roots, picked July 2026 when Riley asked for a less generic heading face ("a nice sans serif") that pairs with the uncial; it replaced Cormorant Garamond (`font-serif`, now removed). Alegreya Sans ships no 600 weight, so headings pair `font-heading` with `font-bold`, never `font-semibold`. **Inter** (`font-sans`) is for UI copy. The Uncial face reads as cartoonish at heading sizes, so do NOT apply `font-display` to page titles, card titles, form labels, or body text — use `font-heading` instead.

### Routing
All routes live under `app/`. There are no `pages/` directory routes. `/order` and `/order/*` are redirected to `/shop` in `next.config.ts` (the nav item was renamed "Shop" per Riley).

```
/                                  app/page.tsx                     ← hero, about, contact, review sections
/gallery                           app/gallery/page.tsx             ← filterable by product/subject via query params
/shop                              app/shop/page.tsx                ← how-it-works steps (crown numerals) + 7 flip tiles
/shop/solo-icon                    app/shop/solo-icon/page.tsx      ← fork: new design vs. existing costume
/shop/solo-icon/new-costume        …/new-costume/page.tsx           ← 'use client', Flow A
/shop/solo-icon/existing-costume   …/existing-costume/page.tsx      ← Flow B wrapper (1 dancer, fixed)
/shop/group-icons                  app/shop/group-icons/page.tsx    ← Flow B wrapper (2+ dancers)
/shop/through-the-years            app/shop/through-the-years/…     ← Flow B wrapper (2+ age sections)
/shop/walking-duo                  app/shop/walking-duo/page.tsx    ← Flow B wrapper (exactly 2 dancers)
/waitlist                          app/waitlist/page.tsx            ← force-dynamic
/admin                             app/admin/page.tsx               ← 'use client', unprotected stub
POST   /api/contact                app/api/contact/route.ts
GET|POST /api/orders               app/api/orders/route.ts
PATCH  /api/orders/[id]            app/api/orders/[id]/route.ts     ← status updates
GET|POST /api/reviews              app/api/reviews/route.ts
```

### Shop ordering scheme (Riley's)
```
/shop
  ├── Solo Icon         → /shop/solo-icon
  │     ├── Design a New Costume from Scratch → /shop/solo-icon/new-costume      (Flow A)
  │     └── Draw My Existing Costume          → /shop/solo-icon/existing-costume (Flow B ×1)
  ├── Group Icons       → /shop/group-icons        (Flow B, one section per dancer, addable)
  ├── Through the Years → /shop/through-the-years  (Flow B, one section per age, addable)
  ├── Walking Duo       → /shop/walking-duo        (Flow B, exactly two dancer sections)
  ├── Bulk Drawings     → /#contact   (>5 drawings — no order form, starts with a conversation)
  ├── Logo              → /#contact
  └── Graphic           → /#contact   (tile renamed from "Custom Graphic" per Riley; id stays custom-graphic)
```
Each subject is a **flip tile** (`components/SubjectCard.tsx`, Riley July 2026): front = artwork + title + "Learn more"; back = starting price + Riley's blurb + a carousel of gallery entries tagged with the matching subject. Starting prices are the `PRICE_TBD` placeholder (`Starting from $–`) until Riley supplies numbers.
**Flow A** (`new-costume`): inspiration images → description → product selection → contact.
**Flow B** (`components/CostumeOrderForm.tsx`, shared by four wrappers): repeating dancer/age sections — each with dancer details (first name *or* age, hard/soft shoe, tan, who designed the costume), costume+headpiece photos (wig-visibility note), extras (background color, logo, text, sash, prizes), and comments — then once per order: product selection and contact info.

**No sharing/permission questions in order forms** (Aaron, July 2026): the "where can this be shared" / "tag you" / "tag your dance school" questions were removed from the forms as too confusing mid-order — Riley handles sharing permissions with the client directly. Don't reintroduce them into the forms; the whole block lives on in the unused `SharingPreferencesBlock` if a post-order permissions step ever comes back.

The `/#contact` anchor works because `app/page.tsx` wraps the contact section in `<section id="contact" className="scroll-mt-20">`. The shop's "Digital Download" product button deep-links to `/gallery?product=digital-download`.

### Shared data layers (`lib/`)
- `lib/orders.ts` — order forms POST to `/api/orders` → `addOrder()`. The waitlist page calls `getOrders()` directly as a server component; the admin page fetches via the API and PATCHes `/api/orders/[id]`. Module-level **in-memory array** — resets on restart, intentional stub. Swap point marked: replace `getOrders()`/`addOrder()`/`updateOrderStatus()` with DB queries and set `DATABASE_URL`.
- `lib/products.ts` — `ProductFormat` taxonomy (`digital-download|print|sticker`) + labels shared by order forms and gallery filters. `AVAILABLE_PRODUCTS` gates what's actually for sale (currently digital download only); adding a format there lights it up in the product-selection step and API validation automatically.
- `lib/reviews.ts` — same in-memory stub pattern for the home-page review section. TODO: verify reviewer made a purchase once auth/order lookup exists.
- `lib/gallery.ts` — gallery entries, each tagged with a `product` (ProductFormat) and a `subject` (GallerySubject). To add real artwork: drop the file in `public/gallery/` and set `src`; tiles without `src` render placeholders.

### Order data shape (`Order` interface)
Key fields: `id`, `initials`, `name`, `contactMethod` (`text|email|whatsapp|instagram`), `contactValue`, `orderType`, `product`, `status`, `details`, `sharingPlatforms`, `tagUsername`, `createdAt`. `orderType` is one of `solo-icon | solo-icon-new | group-icons | through-the-years | walking-duo` — logo/custom-graphic requests deliberately have **no** order type; they arrive through the contact form. Per-dancer data (Flow B) is serialized into the `details` string, one `--- Dancer/Age ---` block per section. `sharingPlatforms`/`tagUsername` are legacy-optional — no form sends them anymore, but the admin page still displays them when present.

### Shared form components
Reusable components used by the order forms live in `components/`:
- `FormField.tsx` — `<Field>` wrapper with label, required indicator, and error message
- `ImageUpload.tsx` — controlled multi-image upload with drag-and-drop and preview grid; images are client-side object URLs only (TODO: wire to storage)
- `ContactInfoBlock.tsx` — first/last name + contact method selector + contact value field
- `SharingPreferencesBlock.tsx` — platform multi-select + dancer-tag + dance-school-tag questions (grouped together). **Currently unused** — removed from the order forms July 2026 (see above); kept for a possible post-order permissions step.
- `ProductSelectionBlock.tsx` — once-per-order product format picker driven by `AVAILABLE_PRODUCTS`
- `CostumeOrderForm.tsx` — the whole Flow B form, parameterized by `orderType`, `sectionNoun` (`dancer|age`), `minSections`/`maxSections`/`fixedCount`
- `ColorPicker.tsx` — in-page color picker (preset swatches + inline `react-colorful` saturation/hue picker + hex input). Used by the per-dancer background-color field. Deliberately avoids the native `<input type="color">` OS popup.
- `ReviewForm.tsx` — crown rating (1–5 `CrownMark`s) + text review, POSTs to `/api/reviews`
- `GalleryGrid.tsx` — filter chips + tile grid; filters live in the URL query string (`?product=…&subject=…`) so views are shareable/deep-linkable
- `SubjectCard.tsx` — 'use client' flip tile for the shop subjects: 3D rotateY flip (hidden face is `inert`, focus is handed to the revealed face, `motion-reduce` disables the animation), example carousel fed by gallery entries, `imageFit: 'contain'` for drawings that must never crop (mats them on literal white, even in dark mode)
- `FormStep.tsx` — wrapper for progressive (one-question-at-a-time) forms; renders a step as `active`, `preview` (blurred/greyed + `inert`), or `hidden`. **Currently unused** — the progressive-form prototype lived in the old `/order/logo` page, which was retired when logo orders moved to the contact form. Kept in case the pattern returns.
- `icons.tsx` — line-icon set + `<Icon name="…" />` dispatcher. The shop subject cards use these as placeholders; when Riley supplies real artwork, drop files in `public/shop/` and set `image` on the `SUBJECTS` entries in `app/shop/page.tsx`.

### Client vs. server components
- Form pages/components (`/shop/solo-icon/new-costume`, `CostumeOrderForm`, `ContactForm`, `ReviewForm`, `GalleryGrid`) are `'use client'` — they own their form/filter state and call API routes via `fetch`. The four Flow B pages are thin server wrappers around `CostumeOrderForm`.
- All other pages are server components.
- `components/Nav.tsx` is `'use client'` for the hamburger toggle and `usePathname` active-link highlighting.
- `GalleryGrid` uses `useSearchParams`, so `app/gallery/page.tsx` wraps it in `<Suspense>`.

### Branding constraint
The brand name **Íocón** must always be a literal string. Never apply a Tailwind `uppercase`, `capitalize`, or `lowercase` class — or any CSS `text-transform` — to any element that contains it, as these mangle the accented Í.

### Brand assets & palette
Riley's master mockup sheets live in `design/` (not served). Individual lockups were traced to SVG in `public/brand/`: `wordmark-crowned`, `logo-horizontal`, `logo-stacked`, `crown`, `monogram` — each in color and `-black` variants. The favicon set (`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`) is generated from the crown; Next.js serves these by file convention. `components/CrownMark.tsx` is the crown as an inline SVG (`fill="currentColor"`, size via width class) — use it instead of embedding crown paths.

Colors are custom Tailwind scales in `tailwind.config.ts`: **gold** (`#FFB101` at `gold`/`gold-500`) and **olive** (`#ACAB00` at `olive`/`olive-500`) — Riley's exact picks sit at 500; other shades are derived. Every scale (plus `white`, `cream`, `stone`, and the form-error reds) resolves to a CSS variable defined in `app/globals.css`, where a `prefers-color-scheme: dark` block remaps them — that one block **is** the dark theme (experiment, 2026-07, pending Riley's verdict; delete it to turn dark mode off). No `dark:` classes anywhere; new UI gets dark mode for free by using the existing scales. The gold CTA colors (`gold`/`gold-400`/`gold-950`) and mid olives are deliberately not remapped. Rules:
- **Page surfaces are light olive** (Riley, 2026-07): the hero banner is `bg-olive-100`; the page body is `olive-25` (`#FCFCF4`, set in `globals.css`). The hero is no longer a dark surface.
- **Riley does not love dark green** — never use `olive-700`+ for headings, buttons, or surfaces. Dark UI roles use the warm dark end of the gold scale instead: headings/labels `text-gold-900` (bronze), selected chips `bg-gold-900`.
- Olive is a mid/light accent only: nav + hero wordmark `text-olive-600`, light washes/badges `olive-25/50/100/800`. Gold crown + olive wordmark together = Riley's lockup. (`text-olive`/500 fails contrast on the light hero — 600 is the floor for olive text on light surfaces.)
- Primary buttons/CTAs are `bg-gold hover:bg-gold-400 text-gold-950` — never white text on gold (fails contrast).
- Do not reintroduce Tailwind `amber-*`/`emerald-*` — they were globally replaced by these scales.
- The wordmark font in Riley's mockups **is** Uncial Antiqua (she traced the rendered text on her iPad) — live text in nav/hero is canonical; the SVG lockups match it.

### Adding a new shop subject or product format
- **Subject** (what the art depicts): add an entry to the `SUBJECTS` array in `app/shop/page.tsx` — title, `blurb` (+ `price` if it has an order form), `icon`/`image`, and a `gallerySubject` tag that feeds the tile's example carousel (plus a form page if it needs one). Extend `GallerySubject` in `lib/gallery.ts` (every tile needs one so the carousel can filter) and, if it takes orders, `OrderType` in `lib/orders.ts` (+ API `VALID_TYPES`).
- **Product format** (what the art ships as): add to `ProductFormat`/labels and `AVAILABLE_PRODUCTS` in `lib/products.ts` — the product-selection step, API validation, and gallery filters pick it up from there.

### Stubbed integrations
- **Contact email** — `app/api/contact/route.ts` logs to console. Wire `RESEND_API_KEY` / `SENDGRID_API_KEY` / SMTP env vars when ready.
- **Order persistence** — `lib/orders.ts`. Seed rows are at the top of that file; delete them when connecting a real DB.
- **Review persistence / purchase check** — `lib/reviews.ts`. In-memory; nothing verifies the reviewer actually bought something yet.
- **File uploads** — `ImageUpload` component renders client-side previews via object URLs. Actual upload is stubbed with a TODO comment; wire to S3/Cloudflare R2/Vercel Blob and store the returned URL when ready.
- **Gallery content** — `lib/gallery.ts` holds placeholder entries. Real images go in `public/gallery/` with `src` set per entry.
- **Shop subject images** — Riley has supplied Through the Years (`public/shop/through-the-years.png`, `imageFit: 'contain'`) and Bulk Drawings (`public/shop/bulk-drawings.jpeg`); the other five tiles still show line icons until her artwork arrives. See the comment on `SUBJECTS` in `app/shop/page.tsx`.
