// ---------------------------------------------------------------------------
// MySQL connection pool for TiDB Cloud Serverless (mysql2).
//
// Configured by DATABASE_URL (mysql://user:pass@host:4000/dbname) in
// .env.local — gitignored, mirror into Vercel. When it is absent,
// lib/orders.ts and lib/reviews.ts fall back to their in-memory stubs so a
// fresh clone still works with zero setup.
//
// The pool is cached on globalThis so `next dev`'s per-bundle module copies
// (and serverless warm invocations) share one pool instead of leaking
// connections. TiDB Serverless requires TLS; its certs chain to public CAs,
// so the default system trust store verifies them.
//
// Tables are created by `npm run db:init` (scripts/init-db.mjs).
// ---------------------------------------------------------------------------

import mysql from 'mysql2/promise'

const globalForDb = globalThis as unknown as { __ioconDbPool?: mysql.Pool }

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool(): mysql.Pool {
  if (!globalForDb.__ioconDbPool) {
    const url = new URL(process.env.DATABASE_URL!)
    globalForDb.__ioconDbPool = mysql.createPool({
      host: url.hostname,
      port: url.port ? Number(url.port) : 4000,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      // Serverless functions run one request at a time; keep the pool small so
      // concurrent lambdas don't pile connections onto the shared cluster.
      connectionLimit: 4,
      timezone: 'Z',
    })
  }
  return globalForDb.__ioconDbPool
}
