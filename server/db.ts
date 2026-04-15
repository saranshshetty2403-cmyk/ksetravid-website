import { eq, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash } from "crypto";
import {
  InsertUser, users,
  adminCredentials,
  tourDates, InsertTourDate,
  siteImages, InsertSiteImage,
  merchProducts, InsertMerchProduct,
  upiSettings, InsertUpiSettings,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Simple SHA-256 hash (no bcrypt dependency needed)
function hashPassword(password: string): string {
  return createHash("sha256").update(password + "ksetravid_salt_2026").digest("hex");
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Admin Credentials ─────────────────────────────────────────────────────────

export async function getAdminCredentials() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminCredentials).limit(1);
  return result[0] ?? null;
}

export async function seedAdminCredentials(username: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) return; // Already seeded
  await db.insert(adminCredentials).values({
    username,
    passwordHash: hashPassword(password),
  });
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const creds = await getAdminCredentials();
  if (!creds) return false;
  return creds.username === username && creds.passwordHash === hashPassword(password);
}

export async function updateAdminCredentials(newUsername: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) {
    await db.update(adminCredentials)
      .set({ username: newUsername, passwordHash: hashPassword(newPassword) })
      .where(eq(adminCredentials.id, existing.id));
  } else {
    await db.insert(adminCredentials).values({
      username: newUsername,
      passwordHash: hashPassword(newPassword),
    });
  }
}

// ── Tour Dates ────────────────────────────────────────────────────────────────

export async function getTourDates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tourDates).orderBy(asc(tourDates.sortOrder), asc(tourDates.date));
}

export async function upsertTourDate(data: InsertTourDate & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(tourDates).set(rest).where(eq(tourDates.id, id));
    return id;
  } else {
    const [result] = await db.insert(tourDates).values(data);
    return (result as any).insertId as number;
  }
}

export async function deleteTourDate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tourDates).where(eq(tourDates.id, id));
}

// ── Site Images ───────────────────────────────────────────────────────────────

export async function getSiteImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteImages).orderBy(asc(siteImages.section), asc(siteImages.key));
}

export async function upsertSiteImage(data: InsertSiteImage & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(siteImages).set(rest).where(eq(siteImages.id, id));
  } else {
    await db.insert(siteImages).values(data).onDuplicateKeyUpdate({
      set: { url: data.url, altText: data.altText ?? null },
    });
  }
}

// ── Merch Products ────────────────────────────────────────────────────────────

export async function getMerchProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(merchProducts).orderBy(asc(merchProducts.sortOrder), asc(merchProducts.id));
}

export async function upsertMerchProduct(data: InsertMerchProduct & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(merchProducts).set(rest).where(eq(merchProducts.id, id));
    return id;
  } else {
    const [result] = await db.insert(merchProducts).values(data);
    return (result as any).insertId as number;
  }
}

export async function deleteMerchProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(merchProducts).where(eq(merchProducts.id, id));
}

// ── UPI Settings ──────────────────────────────────────────────────────────────

export async function getUpiSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(upiSettings).limit(1);
  return result[0] ?? null;
}

export async function saveUpiSettings(data: InsertUpiSettings) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getUpiSettings();
  if (existing) {
    await db.update(upiSettings)
      .set({ upiId: data.upiId, accountName: data.accountName, qrCodeUrl: data.qrCodeUrl ?? null })
      .where(eq(upiSettings.id, existing.id));
  } else {
    await db.insert(upiSettings).values(data);
  }
}
