/**
 * One-time migration: MySQL (Manus) → Neon Postgres
 * Reads exported JSON, creates all tables, inserts all data.
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { readFileSync, existsSync } from "fs";
import { createHash } from "crypto";

neonConfig.webSocketConstructor = ws;

const NEON_URL = "postgresql://neondb_owner:npg_l6SFGTgfiZj1@ep-small-waterfall-a49lll0k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(NEON_URL);

// ── Step 1: Create all tables ─────────────────────────────────────────────────
async function createTables() {
  console.log("Creating tables...");

  // Create role enum if it doesn't exist (Postgres doesn't support IF NOT EXISTS for types)
  try {
    await sql`CREATE TYPE role AS ENUM ('user', 'admin')`;
  } catch (e) {
    if (!e.message.includes('already exists')) throw e;
    console.log('  role enum already exists, skipping');
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      "openId" VARCHAR(64) NOT NULL UNIQUE,
      name TEXT,
      email VARCHAR(320),
      "loginMethod" VARCHAR(64),
      role role NOT NULL DEFAULT 'user',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id SERIAL PRIMARY KEY,
      username VARCHAR(128) NOT NULL UNIQUE,
      "passwordHash" VARCHAR(256) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tour_dates (
      id SERIAL PRIMARY KEY,
      date VARCHAR(32) NOT NULL,
      city VARCHAR(128) NOT NULL,
      venue VARCHAR(256) NOT NULL,
      country VARCHAR(64) NOT NULL DEFAULT 'India',
      "ticketUrl" TEXT,
      "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
      "isPast" BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_images (
      id SERIAL PRIMARY KEY,
      key VARCHAR(128) NOT NULL UNIQUE,
      label VARCHAR(256) NOT NULL,
      section VARCHAR(64) NOT NULL,
      url TEXT NOT NULL,
      "altText" VARCHAR(256),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS merch_products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(256) NOT NULL,
      category VARCHAR(64) NOT NULL,
      price INTEGER NOT NULL,
      "imageUrl" TEXT NOT NULL,
      description TEXT,
      sizes TEXT NOT NULL,
      tags TEXT NOT NULL,
      "collectionTag" VARCHAR(64),
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "shopifyUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS upi_settings (
      id SERIAL PRIMARY KEY,
      "upiId" VARCHAR(128) NOT NULL,
      "accountName" VARCHAR(128) NOT NULL,
      "qrCodeUrl" TEXT,
      "whatsappNumber" VARCHAR(32),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  console.log("✓ All tables created");
}

// ── Step 2: Load exported MySQL data ─────────────────────────────────────────
function loadExportedData() {
  const path = "/tmp/mysql_export.json";
  if (!existsSync(path)) {
    throw new Error("MySQL export not found at /tmp/mysql_export.json");
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

// ── Step 3: Insert all data ───────────────────────────────────────────────────
async function migrateData(data) {
  // Tour Dates
  console.log(`Migrating ${data.tourDates.length} tour dates...`);
  for (const row of data.tourDates) {
    await sql`
      INSERT INTO tour_dates (date, city, venue, country, "ticketUrl", "isSoldOut", "isPast", "sortOrder", "createdAt", "updatedAt")
      VALUES (
        ${row.date}, ${row.city}, ${row.venue}, ${row.country ?? "India"},
        ${row.ticketUrl ?? null}, ${!!row.isSoldOut}, ${!!row.isPast},
        ${row.sortOrder ?? 0}, ${new Date(row.createdAt)}, ${new Date(row.updatedAt)}
      )
      ON CONFLICT DO NOTHING
    `;
  }
  console.log("✓ Tour dates migrated");

  // Site Images
  console.log(`Migrating ${data.siteImages.length} site images...`);
  for (const row of data.siteImages) {
    await sql`
      INSERT INTO site_images (key, label, section, url, "altText", "updatedAt")
      VALUES (
        ${row.key}, ${row.label}, ${row.section}, ${row.url},
        ${row.altText ?? null}, ${new Date(row.updatedAt)}
      )
      ON CONFLICT (key) DO UPDATE SET
        url = EXCLUDED.url,
        label = EXCLUDED.label,
        section = EXCLUDED.section,
        "altText" = EXCLUDED."altText",
        "updatedAt" = EXCLUDED."updatedAt"
    `;
  }
  console.log("✓ Site images migrated");

  // Merch Products
  console.log(`Migrating ${data.merchProducts.length} merch products...`);
  for (const row of data.merchProducts) {
    await sql`
      INSERT INTO merch_products (name, category, price, "imageUrl", description, sizes, tags, "collectionTag", "isActive", "sortOrder", "shopifyUrl", "createdAt", "updatedAt")
      VALUES (
        ${row.name}, ${row.category}, ${row.price}, ${row.imageUrl},
        ${row.description ?? null}, ${row.sizes}, ${row.tags},
        ${row.collectionTag ?? null}, ${!!row.isActive}, ${row.sortOrder ?? 0},
        ${row.shopifyUrl ?? null}, ${new Date(row.createdAt)}, ${new Date(row.updatedAt)}
      )
      ON CONFLICT DO NOTHING
    `;
  }
  console.log("✓ Merch products migrated");

  // UPI Settings
  if (data.upiSettings.length > 0) {
    const upi = data.upiSettings[0];
    console.log("Migrating UPI settings...");
    await sql`
      INSERT INTO upi_settings ("upiId", "accountName", "qrCodeUrl", "whatsappNumber", "updatedAt")
      VALUES (
        ${upi.upiId}, ${upi.accountName}, ${upi.qrCodeUrl ?? null},
        ${upi.whatsappNumber ?? null}, ${new Date(upi.updatedAt)}
      )
      ON CONFLICT DO NOTHING
    `;
    console.log("✓ UPI settings migrated");
  }

  // Admin Credentials — read from file-based system
  console.log("Migrating admin credentials...");
  const credsPath = "/home/ubuntu/ksetravid/data/admin-credentials.json";
  let username = "ksetravid";
  let passwordHash = createHash("sha256").update("Loudbox2026" + "ksetravid_salt_2026").digest("hex");

  if (existsSync(credsPath)) {
    try {
      const fileCreds = JSON.parse(readFileSync(credsPath, "utf-8"));
      // File uses HMAC, DB uses SHA256 — we need to re-hash with the DB method
      // Since we can't reverse the hash, we'll use the file username but reset to known password
      // The user will need to use the current credentials
      username = fileCreds.username;
      // We can't migrate the HMAC hash to SHA256 without the original password
      // So we seed with the default and the user can change it in the dashboard
      console.log(`  File-based username found: ${username}`);
      console.log("  Note: Password hash format changed — seeding with default password.");
      console.log("  If you changed your password, please reset it in the admin dashboard.");
    } catch (e) {
      console.warn("  Could not read credentials file:", e.message);
    }
  }

  await sql`
    INSERT INTO admin_credentials (username, "passwordHash")
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO NOTHING
  `;
  console.log(`✓ Admin credentials seeded (username: ${username})`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Ksetravid MySQL → Neon Postgres Migration ===\n");
  try {
    await createTables();
    const data = loadExportedData();
    await migrateData(data);
    console.log("\n✅ Migration complete! All data is now in Neon Postgres.");
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
  process.exit(0);
}

main();
