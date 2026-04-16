import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load env from .env.local
config({ path: ".env.local" });

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error("NEON_DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log("Creating band_members table...");
  await sql`CREATE TABLE IF NOT EXISTS band_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    "photoUrl" TEXT,
    bio TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
  )`;

  console.log("Creating band_alerts table...");
  await sql`CREATE TABLE IF NOT EXISTS band_alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    "alertType" VARCHAR(64) DEFAULT 'recruiting',
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
  )`;

  // Seed existing band members if table is empty
  const existing = await sql`SELECT COUNT(*) as cnt FROM band_members`;
  if (parseInt(existing[0].cnt) === 0) {
    console.log("Seeding initial band members...");
    await sql`INSERT INTO band_members (name, role, bio, "isActive", "sortOrder") VALUES
      ('Pritam', 'Guitars / Vocals', 'Founding member and primary songwriter. Rooted in Upanishadic philosophy.', true, 1),
      ('Arunav', 'Bass / Backing Vocals', 'Holds down the low end with precision and groove.', true, 2),
      ('Saurav', 'Drums', 'The rhythmic backbone of Ksetravid. Technical yet explosive.', true, 3)
    `;
  }

  // Seed default alert if table is empty
  const existingAlerts = await sql`SELECT COUNT(*) as cnt FROM band_alerts`;
  if (parseInt(existingAlerts[0].cnt) === 0) {
    console.log("Seeding default band alert...");
    await sql`INSERT INTO band_alerts (message, "alertType", "isActive") VALUES
      ('We are currently looking for a lead guitarist to complete our lineup. If you shred and share our vision, reach out.', 'recruiting', true)
    `;
  }

  console.log("Migration complete.");
}

run().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
