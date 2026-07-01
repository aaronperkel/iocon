# Deploying Íocón to Vercel

A step-by-step guide for getting this site live on [Vercel](https://vercel.com).
Vercel is built by the makers of Next.js, so a Next.js app deploys with almost
no configuration. The free **Hobby** plan is plenty for this site.

> ⚠️ **Read the [Important caveat](#important-caveat-orders-dont-persist-yet)
> at the bottom before relying on the order/waitlist feature in production.**
> The order system currently stores data in memory and will not work reliably
> on Vercel until a database is wired up.

---

## What you need first

1. A free **GitHub** account — <https://github.com>
2. A free **Vercel** account — <https://vercel.com/signup> (sign up with GitHub; it's the smoothest path)
3. Git installed locally (`git --version` to check)

---

## Step 1 — Put the code on GitHub

This project isn't a git repository yet. From the project folder
(`iocon/`), run:

```bash
git init
git add .
git commit -m "Initial commit"
```

Then create an **empty** repo on GitHub (no README/license — you already have
files) at <https://github.com/new>. Name it e.g. `iocon`. GitHub will show you
the "push an existing repository" commands — they look like this:

```bash
git remote add origin https://github.com/<your-username>/iocon.git
git branch -M main
git push -u origin main
```

A `.gitignore` is already included, so `node_modules/`, `.next/`, and any
`.env` files stay out of the repo.

---

## Step 2 — Import the project into Vercel

1. Go to <https://vercel.com/new>.
2. Under **Import Git Repository**, find your `iocon` repo and click **Import**.
   (First time only: authorize Vercel to access your GitHub repos.)
3. On the configure screen, Vercel auto-detects the settings — you should **not
   need to change anything**:

   | Setting | Value (auto-detected) |
   |---|---|
   | Framework Preset | **Next.js** |
   | Build Command | `next build` |
   | Output Directory | (leave default — Next.js handles it) |
   | Install Command | `npm install` |
   | Root Directory | `./` |

4. Skip **Environment Variables** for now (none are required yet — see Step 4).
5. Click **Deploy**.

Vercel installs dependencies, runs the build, and gives you a live URL like
`https://iocon.vercel.app` in a minute or two.

---

## Step 3 — Automatic deploys (nothing to configure)

Once connected, Vercel redeploys automatically:

- **Push to `main`** → updates your production site.
- **Open a pull request / push any other branch** → Vercel builds a unique
  **Preview** URL so you can review changes before they go live.

So your normal workflow is just `git push`.

---

## Step 4 — Environment variables (only when you wire up integrations)

**None are required to deploy today** — every external integration is currently
stubbed out. Add these later, when you connect the real services. In Vercel:
**Project → Settings → Environment Variables**, add the key/value, choose the
environments (Production / Preview / Development), then **redeploy** for them to
take effect.

| When you add… | Variable(s) | Used by |
|---|---|---|
| Contact-form email (Resend) | `RESEND_API_KEY`, `CONTACT_EMAIL_TO` | `app/api/contact/route.ts` |
| …or SendGrid | `SENDGRID_API_KEY`, `CONTACT_EMAIL_TO` | same |
| …or SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL_TO` | same |
| Order database | `DATABASE_URL` | `lib/orders.ts` |
| Image uploads | provider keys (S3 / Cloudflare R2 / Vercel Blob) | `components/ImageUpload.tsx` |

Tip: keep a local `.env.local` for development (it's git-ignored). It is **not**
uploaded to Vercel — you set production values in the dashboard.

---

## Step 5 — (Optional) Custom domain

1. **Project → Settings → Domains**.
2. Enter your domain (e.g. `iocon.com` or `www.iocon.com`) and click **Add**.
3. Vercel shows the DNS records to set at your registrar:
   - An **A record** to Vercel's IP for an apex domain (`iocon.com`), or
   - A **CNAME** to `cname.vercel-dns.com` for a subdomain (`www.iocon.com`).
4. DNS can take anywhere from a few minutes to a few hours to propagate. Vercel
   provisions HTTPS automatically once it verifies the records.

---

## Node version (usually no action needed)

Vercel defaults to a current Node.js LTS, which satisfies this project (Node 18+).
If you ever need to pin it, set **Project → Settings → Node.js Version**, or add
to `package.json`:

```json
"engines": { "node": ">=18" }
```

---

## Alternative: deploy from the terminal (Vercel CLI)

If you'd rather not use the dashboard:

```bash
npm i -g vercel     # install the CLI once
vercel              # first run links/creates the project + a preview deploy
vercel --prod       # promote to production
```

---

## Important caveat: orders don't persist yet

The order/waitlist system (`lib/orders.ts`) keeps orders in a **module-level
in-memory array**. That works locally, but on Vercel's serverless platform it
will **not** behave correctly:

- Each API request can run on a **different, cold serverless instance**, so an
  order submitted by one request may be invisible to the waitlist read by the
  next request.
- Memory is **wiped between invocations**, so orders disappear — nothing is
  durable.

**Before you rely on orders in production, swap the in-memory store for a real
database.** The code is structured to make this a localized change:

1. Pick a database — e.g. **Vercel Postgres**, Supabase, PlanetScale, or
   Neon (all have free tiers and pair well with Vercel).
2. Add `DATABASE_URL` (and any provider vars) in Vercel env settings.
3. Replace `getOrders()` / `addOrder()` / `updateOrderStatus()` /
   `getOpenOrderCount()` in `lib/orders.ts` with real queries, and delete the
   seed array.
4. The API routes (`app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`)
   and the pages call those functions, so they need no further changes.

Two related things to handle before launch (already flagged with TODOs in the
code):

- **`/admin` is unprotected** — anyone with the URL can view/update orders. Add
  auth (NextAuth, Clerk, a middleware password, or Vercel's password protection)
  before sharing the site.
- **The contact form** logs to the console instead of sending email — wire up a
  provider (Step 4) so submissions actually reach you.

Until then, the site looks and navigates perfectly — just treat the order flow
as a demo.
