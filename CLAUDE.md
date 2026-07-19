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

Fonts: **Uncial Antiqua** (`font-display`) for the **Íocón brand wordmark only** (the hero title and the nav brand — the only two places it appears); **Times New Roman** (`font-heading`) for all page/section headings — a trial Riley requested mid-July 2026 ("how would times new roman look?"), pending her verdict. It is a system font, so the stack is hardcoded in `tailwind.config.ts` and there is no `next/font` import for it. It replaced Alegreya Sans (July 2026), which had replaced Cormorant Garamond — heading faces are Riley's most-revised decision; expect further changes. Headings pair `font-heading` with `font-bold`. **Inter** (`font-sans`) is for UI copy. The Uncial face reads as cartoonish at heading sizes, so do NOT apply `font-display` to page titles, card titles, form labels, or body text — use `font-heading` instead.

### Routing
All routes live under `app/`. There are no `pages/` directory routes. `/order` and `/order/*` are redirected to `/shop` in `next.config.ts` (the nav item was renamed "Shop" per Riley).

```
/                                  app/page.tsx                     ← hero, about, contact, review sections
/gallery                           app/gallery/page.tsx             ← filterable by product/subject via query params
/shop                              app/shop/page.tsx                ← how-it-works steps (crown numerals) + 7 flip tiles
/shop/solo-icon                    app/shop/solo-icon/page.tsx      ← fork: existing costume (listed first) vs. new design
/shop/solo-icon/new-costume        …/new-costume/page.tsx           ← 'use client', Flow A
/shop/solo-icon/existing-costume   …/existing-costume/page.tsx      ← Flow B wrapper (1 dancer, fixed)
/shop/group-icons                  app/shop/group-icons/page.tsx    ← Flow B wrapper (2+ dancers)
/shop/through-the-years            app/shop/through-the-years/…     ← Flow B wrapper (2+ age sections)
/shop/walking-duo                  app/shop/walking-duo/page.tsx    ← Flow B wrapper (exactly 2 dancers)
/waitlist                          app/waitlist/page.tsx            ← force-dynamic
/admin                             app/admin/page.tsx               ← 'use client', gated; tabs: Orders / Email Customers / Reviews
/admin/login                       app/admin/login/page.tsx         ← 'use client', email + 6-digit code
POST   /api/contact                app/api/contact/route.ts
GET|POST /api/orders               app/api/orders/route.ts
PATCH  /api/orders/[id]            app/api/orders/[id]/route.ts     ← status updates
GET|POST /api/reviews              app/api/reviews/route.ts
DELETE /api/reviews/[id]           app/api/reviews/[id]/route.ts    ← admin-only moderation
POST   /api/admin/email            app/api/admin/email/route.ts     ← admin-only custom email send
POST   /api/auth/request-code      app/api/auth/request-code/route.ts ← email a sign-in code
POST   /api/auth/verify            app/api/auth/verify/route.ts     ← code → session cookie
POST   /api/auth/logout            app/api/auth/logout/route.ts
```

### Admin auth (`middleware.ts`, `lib/auth.ts`, `lib/auth-email.ts`)
Email + 6-digit one-time code. `middleware.ts` (matcher `/admin/:path*`, `/api/orders/:path*`, `/api/reviews/:path*`, `/api/admin/:path*`) gates access: no valid session → `/admin` redirects to `/admin/login`; `GET /api/orders`, `PATCH /api/orders/[id]`, `DELETE /api/reviews/[id]`, and everything under `/api/admin` return 401. **`POST /api/orders` and `GET|POST /api/reviews` are deliberately public** — the order forms and the home-page review section use them from public pages. `ADMIN_EMAILS` in `lib/auth.ts` is the allowlist (currently riley@iocongraphics.com + me@aaronperkel.com).

The admin page has three tabs: **Orders** (filterable list, expandable cards, status buttons, an "Email this customer" shortcut on email-contact orders), **Email Customers** (`components/AdminEmailPortal.tsx` → `POST /api/admin/email`: recipient checklist built from email-contact orders with All / Open orders / None quick-picks, subject + message, two-step inline confirm — no native dialogs), and **Reviews** (`components/AdminReviewsPanel.tsx`, list + two-step delete; currently the **only** place submitted reviews are visible, since the home page has just the form). The email API only accepts recipients matching an existing order's contact email (no arbitrary addresses) and sends one email per recipient, sequentially. Status badges use brand scales only (pending=stone, in-progress=gold, completed=olive — same map as `/waitlist`); don't reintroduce the old `blue-*` badges, they don't retheme in dark mode. `app/admin/layout.tsx` carries the metadata (title + noindex) since both admin pages are client components.

**Stateless, no DB** (survives serverless + `next dev`'s per-bundle module copies): request-code mints an HMAC-signed *challenge* cookie holding a hash of (email, code, expiry) — the code itself is never stored — and verify recomputes the hash, then sets an HMAC-signed *session* cookie (30-day, httpOnly). All HMAC is Web Crypto (`crypto.subtle`) so it runs in the edge middleware too. Signing key is **`AUTH_SECRET`** (`.env.local`, gitignored — **mirror into Vercel**; a dev fallback keeps local login working but is insecure; rotating it signs everyone out). Codes expire in 10 min; `verifySessionToken` re-checks the allowlist so removing an email revokes its live sessions. Unknown emails get an identical `{ok:true}` with no cookie (no account enumeration). Rate limiting is in-memory/best-effort (per-lambda only in prod); the 10-min code expiry is the real guard. The sign-in code email lives in `lib/auth-email.ts`, which mirrors `lib/email.ts`'s SMTP transport (keep the two in sync) and no-ops with a console log when SMTP env is absent.

### Shop ordering scheme (Riley's)
```
/shop
  ├── Solo Icon         → /shop/solo-icon   (no intro blurb; option order + blurbs are Riley's, July 2026)
  │     ├── Draw My Existing Costume          → /shop/solo-icon/existing-costume (Flow B ×1, listed first)
  │     └── Design a New Costume from Scratch → /shop/solo-icon/new-costume      (Flow A)
  ├── Group Icons       → /shop/group-icons        (Flow B, one section per dancer, addable)
  ├── Through the Years → /shop/through-the-years  (Flow B, one section per age, addable)
  ├── Walking Duo       → /shop/walking-duo        (Flow B, exactly two dancer sections)
  ├── Bulk Drawings     → /#contact   (>5 drawings — no order form, starts with a conversation)
  ├── Logo              → /#contact
  └── Graphic           → /#contact   (tile renamed from "Custom Graphic" per Riley; id stays custom-graphic)
```
Each subject is a **flip tile** (`components/SubjectCard.tsx`, Riley July 2026): front = artwork + title + "Learn more"; back = starting price + Riley's blurb + a carousel of gallery entries tagged with the matching subject. Starting prices are the `PRICE_TBD` placeholder (`Starting from $–`) until Riley supplies numbers.
**Flow A** (`new-costume`): inspiration images → description → product selection → contact.
**Flow B** (`components/CostumeOrderForm.tsx`, shared by four wrappers) is structured into Riley's four clear sections (July 2026), and the **Dancer** section is the only one that repeats: each dancer/age section = first name *or* age, hard/soft shoe, leg shade (light / medium tan / dark tan / black tights / black pants), Costume Designer (optional), Dance School (optional), extras chips (Sash / Belt / Prize held in hand), dancer images (Riley's "clear, front facing images…" helper copy), and dancer comments. Then once per order: **Layout** (add text? → the exact text to show on the product; background as four fixed choices — white / light coordinating / dark coordinating / other — which replaced the ColorPicker; add logo? → note to attach it under layout images and describe size/positioning in the layout comments; layout images; layout comments), **Product Selection**, and **Contact Information**. Order-form inputs carry **no placeholder/example text** (Riley: keep the forms very simple) — don't add placeholders back.

**No sharing/permission questions in order forms** (Aaron, July 2026): the "where can this be shared" / "tag you" / "tag your dance school" questions were removed from the forms as too confusing mid-order — Riley handles sharing permissions with the client directly. Don't reintroduce them into the forms; the whole block lives on in the unused `SharingPreferencesBlock` if a post-order permissions step ever comes back.

The `/#contact` anchor works because `app/page.tsx` wraps the contact section in `<section id="contact" className="scroll-mt-20">`. The shop's "Digital Download" product button deep-links to `/gallery?product=digital-download`.

### Shared data layers (`lib/`)
- `lib/db.ts` — mysql2 pool for **TiDB Cloud Serverless**, configured by `DATABASE_URL` (`mysql://user:pass@host:4000/dbname`, in `.env.local` — mirror into Vercel). Pool is cached on `globalThis` (shared across `next dev` route bundles and warm lambdas), TLS always on. `npm run db:init` (idempotent, `scripts/init-db.mjs`) creates the database + `orders`/`reviews` tables. **When `DATABASE_URL` is absent, orders/reviews fall back to in-memory arrays** (also `globalThis`-cached) so a fresh clone works — same graceful-degrade pattern as `lib/email.ts`, but state resets on restart.
- `lib/orders.ts` — order forms POST to `/api/orders` → `addOrder()`. The waitlist page awaits `getOrders()` directly as a server component; the admin page fetches via the API and PATCHes `/api/orders/[id]`. All helpers are **async** (DB queries via `lib/db.ts`, snake_case columns mapped to the camelCase `Order` interface; `sharingPlatforms` is a JSON column).
- `lib/order-types.ts` — the `Order` types + label maps, split out so client components can use them. **Client components must never value-import `lib/orders`/`lib/reviews`/`lib/db`/`lib/email`** — that drags mysql2/nodemailer into the browser bundle and breaks `next build` (webpack can't compile their `node:` imports; `tsc`/`next dev` won't catch it if the page is never loaded). Those four modules `import 'server-only'` so the mistake now fails the build with a clear error; server code imports from `lib/orders.ts`, which re-exports the shared types.
- `lib/products.ts` — `ProductFormat` taxonomy (`digital-download|print|sticker`) + labels shared by order forms and gallery filters. `AVAILABLE_PRODUCTS` gates what's actually for sale (currently digital download only); adding a format there lights it up in the product-selection step and API validation automatically.
- `lib/reviews.ts` — same async DB pattern for the home-page review section. TODO: verify reviewer made a purchase once auth/order lookup exists.
- `lib/gallery.ts` — gallery entries, each tagged with a `product` (ProductFormat) and a `subject` (GallerySubject). To add real artwork: drop the file in `public/gallery/` and set `src`; tiles without `src` render placeholders.
- `lib/email.ts` — all outbound email, via Riley's iCloud+ custom-domain SMTP (nodemailer). Env in `.env.local` (gitignored; mirror into Vercel): `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`, optional `CONTACT_EMAIL_TO` (Riley's inbox, defaults to riley@iocongraphics.com — override to test without emailing her). **The SMTP username must be the account's primary `@icloud.com` address** — the Apple ID (a gmail) gets `550 mailbox does not exist`, the custom-domain addresses get `535`. Three mail kinds: automated customer alerts from `orders@iocongraphics.com` (Reply-To Riley) — order placed (with queue position), moved up in queue (sent to open orders behind a newly completed one), being drawn (`in-progress`), finished (`completed`) — sent **only when `contactMethod === 'email'`**, silent no-op otherwise; custom mail Riley composes in the admin Email tab (`sendCustomEmail`, same branded shell, greeting "Hi <first name>," and "— Riley" sign-off); and mail to Riley (contact form + new-order notifications) with Reply-To the customer. Status-change alerts fire only on real transitions (PATCH compares previous status). Missing SMTP env → helpers log and return instead of throwing, so a fresh clone still works. Email failures never fail the API request (`Promise.allSettled` + log), except the contact form, which returns 502 so the visitor knows to retry.

### Order data shape (`Order` interface)
Key fields: `id`, `initials`, `name`, `contactMethod` (`text|email|whatsapp|instagram`), `contactValue`, `orderType`, `product`, `status`, `details`, `sharingPlatforms`, `tagUsername`, `createdAt`. `orderType` is one of `solo-icon | solo-icon-new | group-icons | through-the-years | walking-duo` — logo/custom-graphic requests deliberately have **no** order type; they arrive through the contact form. Per-dancer data (Flow B) is serialized into the `details` string, one `--- Dancer/Age ---` block per section plus a single `--- Layout ---` block. `sharingPlatforms`/`tagUsername` are legacy-optional — no form sends them anymore, but the admin page still displays them when present.

### Shared form components
Reusable components used by the order forms live in `components/`:
- `FormField.tsx` — `<Field>` wrapper with label, required indicator, and error message
- `ImageUpload.tsx` — controlled multi-image upload with drag-and-drop and preview grid; images are client-side object URLs only (TODO: wire to storage)
- `ContactInfoBlock.tsx` — first/last name + contact method selector + contact value field
- `SharingPreferencesBlock.tsx` — platform multi-select + dancer-tag + dance-school-tag questions (grouped together). **Currently unused** — removed from the order forms July 2026 (see above); kept for a possible post-order permissions step.
- `ProductSelectionBlock.tsx` — once-per-order product format picker driven by `AVAILABLE_PRODUCTS`
- `CostumeOrderForm.tsx` — the whole Flow B form, parameterized by `orderType`, `sectionNoun` (`dancer|age`), `minSections`/`maxSections`/`fixedCount`
- `ColorPicker.tsx` — in-page color picker (preset swatches + inline `react-colorful` saturation/hue picker + hex input; deliberately avoids the native `<input type="color">` OS popup). **Currently unused** — the per-dancer background-color field was replaced July 2026 by the Layout section's four fixed background choices (Riley). Kept, with `react-colorful` still in dependencies, in case a custom-color option returns.
- `ReviewForm.tsx` — crown rating (1–5 `CrownMark`s) + text review, POSTs to `/api/reviews`
- `AdminEmailPortal.tsx` — admin Email tab: recipient checklist + compose + two-step confirm, POSTs to `/api/admin/email`
- `AdminReviewsPanel.tsx` — admin Reviews tab: fetches `/api/reviews`, deletes via `DELETE /api/reviews/[id]`
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

**Search/SEO name is "Íocón Graphics"** (2026-07: Google only matched the site for "iocon", not "iocon graphics", because the word Graphics appeared nowhere on-page). It leads the root `<title>`/description, OG `siteName`, every per-page `title` suffix (`… — Íocón Graphics`), the footer © line, and the home page's WebSite+Organization JSON-LD (`STRUCTURED_DATA` in `app/page.tsx` — Google's site-name feature reads the WebSite object from the home page only; `alternateName` carries the unaccented spellings). The **visible** wordmark (nav, hero, lockups) stays plain **Íocón** — don't append "Graphics" to it.

### Brand assets & palette
Riley's master mockup sheets live in `design/` (not served). Individual lockups were traced to SVG in `public/brand/`: `wordmark-crowned`, `logo-horizontal`, `logo-stacked`, `crown`, `monogram` — each in color and `-black` variants. The favicon set (`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`) is generated from the crown; Next.js serves these by file convention. `components/CrownMark.tsx` is the crown as an inline SVG (`fill="currentColor"`, size via width class) — use it instead of embedding crown paths.

Colors are custom Tailwind scales in `tailwind.config.ts`: **gold** (`#FFB101` at `gold`/`gold-500`) and **olive** (`#ACAB00` at `olive`/`olive-500`) — Riley's exact picks sit at 500; other shades are derived. Every scale (plus `white`, `cream`, `stone`, and the form-error reds) resolves to a CSS variable defined in `app/globals.css`, where a `prefers-color-scheme: dark` block remaps them — that one block **is** the dark theme (experiment, 2026-07, pending Riley's verdict; delete it to turn dark mode off). No `dark:` classes anywhere; new UI gets dark mode for free by using the existing scales. The gold CTA colors (`gold`/`gold-400`/`gold-950`) and mid olives are deliberately not remapped. Rules:
- **Page surfaces are light olive** (Riley, 2026-07): the hero banner is `bg-olive-100`; the page body is `olive-25` (`#FCFCF4`, set in `globals.css`). The hero is no longer a dark surface.
- **Dark UI roles are dark olive** (Riley's second July 2026 pass: "the brown is nice but maybe a dark version of the green shade would be better" — this reversed her earlier no-dark-green stance): headings/labels and the hero tagline are `text-olive-800`, selected chips `bg-olive-800 text-white`. Bronze `text-gold-900` survives **only** as warning text on `gold-50` washes (the no-images-uploaded boxes); don't use it for headings anymore.
- Form section-heading rules are `border-b border-gold-200` — a deliberate gold accent per Riley's "tie in the logo colors wherever it's appropriate".
- Olive elsewhere: nav + hero wordmark `text-olive-600`, light washes/badges `olive-25/50/100`. Gold crown + olive wordmark together = Riley's lockup. (`text-olive`/500 fails contrast on the light hero — 600 is the floor for olive text on light surfaces; `olive-800` passes AA for small text on white/`olive-25`.)
- Primary buttons/CTAs are `bg-gold hover:bg-gold-400 text-gold-950` — never white text on gold (fails contrast).
- Do not reintroduce Tailwind `amber-*`/`emerald-*` — they were globally replaced by these scales.
- The wordmark font in Riley's mockups **is** Uncial Antiqua (she traced the rendered text on her iPad) — live text in nav/hero is canonical; the SVG lockups match it.

### Adding a new shop subject or product format
- **Subject** (what the art depicts): add an entry to the `SUBJECTS` array in `app/shop/page.tsx` — title, `blurb` (+ `price` if it has an order form), `icon`/`image`, and a `gallerySubject` tag that feeds the tile's example carousel (plus a form page if it needs one). Extend `GallerySubject` in `lib/gallery.ts` (every tile needs one so the carousel can filter) and, if it takes orders, `OrderType` in `lib/orders.ts` (+ API `VALID_TYPES`).
- **Product format** (what the art ships as): add to `ProductFormat`/labels and `AVAILABLE_PRODUCTS` in `lib/products.ts` — the product-selection step, API validation, and gallery filters pick it up from there.

### Stubbed integrations
- **Review purchase check** — nothing verifies a reviewer actually bought something yet (needs order lookup against the DB).
- Never run `npm run build` while `next dev` is running — both write `.next` and the prod output comes out corrupted (routes 500).
- **File uploads** — `ImageUpload` component renders client-side previews via object URLs. Actual upload is stubbed with a TODO comment; wire to S3/Cloudflare R2/Vercel Blob and store the returned URL when ready.
- **Gallery content** — `lib/gallery.ts` holds placeholder entries. Real images go in `public/gallery/` with `src` set per entry.
- **Shop subject images** — Riley has supplied Through the Years (`public/shop/through-the-years.png`, `imageFit: 'contain'`) and Bulk Drawings (`public/shop/bulk-drawings.jpeg`); the other five tiles still show line icons until her artwork arrives. See the comment on `SUBJECTS` in `app/shop/page.tsx`.
