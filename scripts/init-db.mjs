// ---------------------------------------------------------------------------
// One-time (idempotent) TiDB setup: creates the database named in
// DATABASE_URL plus the orders and reviews tables. Safe to re-run.
//
//   npm run db:init      (reads DATABASE_URL from .env.local)
//
// Local dev and prod share the cluster; point DATABASE_URL at a different
// database name (e.g. iocon_dev) and re-run to get an isolated copy.
// ---------------------------------------------------------------------------

import mysql from 'mysql2/promise'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error(
    'DATABASE_URL is not set. Add it to .env.local, e.g.\n' +
      '  DATABASE_URL=mysql://USER:PASSWORD@HOST:4000/iocon'
  )
  process.exit(1)
}

const url = new URL(databaseUrl)
const database = url.pathname.replace(/^\//, '')
if (!database) {
  console.error('DATABASE_URL must include a database name (…:4000/iocon).')
  process.exit(1)
}

// Connect without selecting a database so we can create it first.
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port ? Number(url.port) : 4000,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
})

await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``)
await connection.query(`USE \`${database}\``)

await connection.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    initials VARCHAR(16) NOT NULL,
    name VARCHAR(191) NOT NULL,
    contact_method VARCHAR(16) NOT NULL,
    contact_value VARCHAR(191) NOT NULL,
    order_type VARCHAR(32) NOT NULL,
    product VARCHAR(32) NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    details MEDIUMTEXT NULL,
    sharing_platforms JSON NULL,
    tag_username VARCHAR(191) NULL,
    created_at DATETIME(3) NOT NULL,
    KEY idx_orders_status_created (status, created_at)
  )
`)

await connection.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    rating TINYINT NOT NULL,
    \`text\` TEXT NOT NULL,
    created_at DATETIME(3) NOT NULL,
    KEY idx_reviews_created (created_at)
  )
`)

const [tables] = await connection.query('SHOW TABLES')
console.log(`Database \`${database}\` ready. Tables:`)
for (const row of tables) console.log(`  - ${Object.values(row)[0]}`)

await connection.end()
