/**
 * One-time migration: insert member photo placeholder rows into site_images.
 * Safe to run multiple times — uses INSERT IGNORE.
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

const memberRows = [
  { key: "member_pritam", label: "Pritam Middey (Guitars)", section: "Members", url: "", altText: "Pritam Middey — Guitars" },
  { key: "member_arunav", label: "Arunav Bhattacharjee (Bass)", section: "Members", url: "", altText: "Arunav Bhattacharjee — Bass" },
  { key: "member_nikhil", label: "Nikhil TR (Drums)", section: "Members", url: "", altText: "Nikhil TR — Drums" },
];

for (const row of memberRows) {
  try {
    await conn.execute(
      "INSERT IGNORE INTO site_images (`key`, `label`, `section`, `url`, `altText`) VALUES (?, ?, ?, ?, ?)",
      [row.key, row.label, row.section, row.url, row.altText]
    );
    console.log(`[Migration] Inserted or skipped: ${row.key}`);
  } catch (err) {
    console.error(`[Migration] Error for ${row.key}:`, err.message);
  }
}

await conn.end();
console.log("[Migration] Done.");
