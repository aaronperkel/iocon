# Íocón

Custom Irish dance costume illustrations — digital images, logos, and costume designs.

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

Requires Node.js 18+.

---

## Route map

| Route | Description |
|---|---|
| `/` | Home — About Me + Contact form |
| `/gallery` | Gallery (stub — see below) |
| `/order` | Order entry — product categories |
| `/order/costume` | Costume sub-menu |
| `/order/logo` | Logo order form |
| `/order/drawing` | Existing costume drawing form |
| `/order/design` | New costume design form |
| `/waitlist` | Live waitlist fed by order submissions |

### Order flow

```
/order  (Digital Image)
  ├── Other    → /#contact  (Home page, scrolls to Contact Me)
  ├── Logo     → /order/logo
  └── Costume  → /order/costume
                   ├── Existing Costume Drawing → /order/drawing
                   └── New Costume Design        → /order/design
```

---

## Stubbed integration points

### Contact form email  (`app/api/contact/route.ts`)
Submissions are currently logged to the console.  
To wire up a real provider, add the relevant env var and replace the `console.log`:

| Provider | Env var |
|---|---|
| Resend | `RESEND_API_KEY` |
| SendGrid | `SENDGRID_API_KEY` |
| Nodemailer / SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Recipient inbox | `CONTACT_EMAIL_TO` |

### Order persistence (`lib/orders.ts` + `app/api/orders/route.ts`)
Orders are stored in a module-level in-memory array.  
State resets on server restart and does not sync across serverless instances.

To add real persistence:
1. Pick a database (PostgreSQL/Prisma, Supabase, PlanetScale, SQLite/Turso, …).
2. Set `DATABASE_URL` (reserved env var).
3. Replace `getOrders()` and `addOrder()` in `lib/orders.ts` with DB queries.
4. Update the route handlers in `app/api/orders/route.ts` accordingly.

Seed data (3 sample rows) lives at the top of `lib/orders.ts` — delete it when you connect a real DB.

### File uploads (drawing/design forms)
Both forms include a note that reference photos can be sent after confirmation.  
To add actual upload fields:
- Add a `<input type="file">` to the form.
- Wire to a storage provider (S3, Cloudflare R2, Vercel Blob, Uploadthing…).
- Set `STORAGE_BUCKET` / provider-specific env vars.

---

## Intentional placeholders

| What | Where | Status |
|---|---|---|
| Gallery images | `components/ImageGrid.tsx` | Scaffold only — replace `sampleImages` with real data |
| Gallery data source | `app/gallery/page.tsx` | TODO comment at top of file |
| About Me copy | `app/page.tsx` | Lorem ipsum — replace with real bio |
| Hero tagline | `app/page.tsx` | Placeholder — update to match brand voice |
| Favicon / OG image | `/public/` | Not included — add `favicon.ico` and `opengraph-image.png` |

---

## Adding a new product category

1. Open `app/order/page.tsx`.
2. Append an entry to the `CATEGORIES` array — each entry has a `title`, `subtitle`, and `options[]`.
3. Create the corresponding routes under `app/order/`.

No other files need to change.

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS 3**
- **react-colorful** — in-page color picker for the drawing form
- Fonts (via `next/font/google`): Uncial Antiqua (Íocón brand wordmark only), Cormorant Garamond (headings + serif body), Inter (UI copy)
