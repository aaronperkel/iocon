# Íocón Graphics

Custom Irish dance artwork — costume drawings, icons, logos, and graphics, hand made by Riley. Next.js 15 (App Router) + TypeScript + Tailwind CSS 3, deployed on Vercel at [iocongraphics.com](https://iocongraphics.com).

For architecture detail (data layers, auth, email, branding rules), see `CLAUDE.md`.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build (also type-checks)
npm run db:init    # one-time/idempotent: create the DB tables (needs DATABASE_URL)
```

Requires Node.js 18+. A fresh clone works with **zero configuration**: without env vars, orders/reviews/gallery use in-memory stores (reset on restart), email helpers log to the console instead of sending, and uploads write to `public/` locally.

## Environment variables

All live in `.env.local` (gitignored) — **mirror every one into Vercel** for production.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | TiDB Cloud Serverless, `mysql://user:pass@host:4000/dbname`. Local dev uses the `iocon_dev` database, prod uses `iocon` (same cluster). Absent → in-memory fallback. |
| `AUTH_SECRET` | HMAC key for admin sessions. Rotating it signs everyone out. Absent → insecure dev fallback. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | iCloud Mail SMTP. `SMTP_USER` must be the account's primary `@icloud.com` address; `SMTP_PASS` is an app-specific password. Absent → emails are logged, not sent. |
| `CONTACT_EMAIL_TO` | Riley's inbox for contact-form + new-order mail. Defaults to riley@iocongraphics.com — override to test without emailing her. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for gallery + order-form image uploads. Absent → local files in dev, 503 in prod. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` | Reserved for the payment integration — **not used by any code yet**. |

## Route map

| Route | Description |
|---|---|
| `/` | Home — hero, About, approved reviews, contact form |
| `/gallery` | Filterable gallery (admin-managed, Vercel Blob) |
| `/shop` | Subject tiles + how-it-works; `/order*` redirects here |
| `/shop/solo-icon` (+ `existing-costume`, `new-costume`) | Solo Icon fork + order forms |
| `/shop/group-icons`, `/shop/through-the-years`, `/shop/walking-duo` | Multi-section order forms |
| `/waitlist` | Public live order queue (initials only) |
| `/review` | Review form; `?rating=N` preselects crowns (linked from emails) |
| `/terms`, `/privacy` | Commission terms & privacy policy |
| `/admin` | Order/email/review/gallery/admin management — gated by email + one-time code |

## Deploying

Push to `main` → Vercel deploys production; any other branch gets a preview URL. After adding a table or column locally, re-run `npm run db:init` against the **prod** `DATABASE_URL` too.

⚠️ Never run `npm run build` while `next dev` is running — both write `.next` and the output corrupts.
