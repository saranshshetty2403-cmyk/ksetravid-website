import { eq, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";
import {
  InsertUser, users,
  adminCredentials,
  tourDates, InsertTourDate,
  siteImages, InsertSiteImage,
  merchProducts, InsertMerchProduct,
  upiSettings, InsertUpiSettings,
  orders, InsertOrder,
  bandMembers, bandAlerts,
} from "../drizzle/schema";
import { ENV } from './_core/env';

// ── DB singleton (Neon HTTP — works in both serverless and Node.js) ───────────
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  // Only use Postgres/Neon URLs — skip MySQL/TiDB (incompatible with neon-http)
  const url = process.env.KSETRAVID_DB_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn("[Database] No KSETRAVID_DB_URL or NEON_DATABASE_URL set — DB unavailable");
    return null;
  }
  if (url.startsWith("mysql://") || url.startsWith("mysql2://")) {
    console.warn("[Database] MySQL URL detected — Neon HTTP requires a PostgreSQL URL");
    return null;
  }
  try {
    const sql = neon(url);
    _db = drizzle(sql);
    return _db;
  } catch (err) {
    console.warn("[Database] Failed to connect:", err);
    return null;
  }
}

// Simple SHA-256 hash
function hashPassword(password: string): string {
  return createHash("sha256").update(password + "ksetravid_salt_2026").digest("hex");
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot upsert user"); return; }

  const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
  const now = new Date();

  if (existing.length > 0) {
    await db.update(users)
      .set({
        name: user.name ?? existing[0].name,
        email: user.email ?? existing[0].email,
        loginMethod: user.loginMethod ?? existing[0].loginMethod,
        lastSignedIn: now,
        updatedAt: now,
      })
      .where(eq(users.openId, user.openId));
  } else {
    const lastSignedIn = user.lastSignedIn instanceof Date
      ? user.lastSignedIn
      : user.lastSignedIn ? new Date(user.lastSignedIn) : now;
    await db.insert(users).values({
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role: user.openId === ENV.ownerOpenId ? "admin" : "user",
      lastSignedIn,
    });
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Admin Credentials ─────────────────────────────────────────────────────────

export async function getAdminCredentials() {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(adminCredentials).limit(1);
  return result[0] ?? null;
}

export async function seedAdminCredentials(username: string, password: string) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) return; // Already seeded — never overwrite
  await db.insert(adminCredentials).values({
    username,
    passwordHash: hashPassword(password),
  });
  console.log("[AdminAuth] Initial credentials seeded to DB.");
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const creds = await getAdminCredentials();
  if (!creds) return false;
  return creds.username === username && creds.passwordHash === hashPassword(password);
}

export async function updateAdminCredentials(newUsername: string, newPassword: string) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) {
    await db.update(adminCredentials)
      .set({ username: newUsername, passwordHash: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(adminCredentials.id, existing.id));
  } else {
    await db.insert(adminCredentials).values({
      username: newUsername,
      passwordHash: hashPassword(newPassword),
    });
  }
}

export async function getCurrentAdminUsername(): Promise<string | null> {
  const creds = await getAdminCredentials();
  return creds?.username ?? null;
}

// ── Tour Dates ────────────────────────────────────────────────────────────────

export async function getTourDates() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(tourDates).orderBy(asc(tourDates.sortOrder), asc(tourDates.date));
}

export async function upsertTourDate(data: InsertTourDate & { id?: number }) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(tourDates).set({ ...rest, updatedAt: new Date() }).where(eq(tourDates.id, id));
    return id;
  } else {
    const result = await db.insert(tourDates).values(data).returning({ id: tourDates.id });
    return result[0].id;
  }
}

export async function deleteTourDate(id: number) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tourDates).where(eq(tourDates.id, id));
}

// ── Site Images ───────────────────────────────────────────────────────────────

export async function getSiteImages() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(siteImages).orderBy(asc(siteImages.section), asc(siteImages.key));
}

export async function upsertSiteImage(data: InsertSiteImage & { id?: number }) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(siteImages).set({ ...rest, updatedAt: new Date() }).where(eq(siteImages.id, id));
  } else {
    // Upsert by key using Postgres ON CONFLICT
    await db.insert(siteImages).values(data)
      .onConflictDoUpdate({
        target: siteImages.key,
        set: { url: data.url, altText: data.altText ?? null, updatedAt: new Date() },
      });
  }
}

// ── Merch Products ────────────────────────────────────────────────────────────

export async function getMerchProducts() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(merchProducts).orderBy(asc(merchProducts.sortOrder), asc(merchProducts.id));
}

export async function upsertMerchProduct(data: InsertMerchProduct & { id?: number }) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(merchProducts).set({ ...rest, updatedAt: new Date() }).where(eq(merchProducts.id, id));
    return id;
  } else {
    const result = await db.insert(merchProducts).values(data).returning({ id: merchProducts.id });
    return result[0].id;
  }
}

export async function deleteMerchProduct(id: number) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(merchProducts).where(eq(merchProducts.id, id));
}

// ── UPI Settings ──────────────────────────────────────────────────────────────

export async function getUpiSettings() {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(upiSettings).limit(1);
  return result[0] ?? null;
}

export async function saveUpiSettings(data: InsertUpiSettings) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getUpiSettings();
  if (existing) {
    await db.update(upiSettings)
      .set({
        upiId: data.upiId,
        accountName: data.accountName,
        qrCodeUrl: data.qrCodeUrl ?? null,
        whatsappNumber: data.whatsappNumber ?? null,
        updatedAt: new Date(),
      })
      .where(eq(upiSettings.id, existing.id));
  } else {
    await db.insert(upiSettings).values(data);
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** Generate a unique transaction reference like KSV-20260415-A3X9 */
export function generateTxnRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KSV-${dateStr}-${rand}`;
}

export async function createOrder(data: InsertOrder) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data).returning({ id: orders.id, txnRef: orders.txnRef });
  return result[0];
}

export async function getOrders() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateOrderStatus(id: number, paymentStatus: "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled", adminNotes?: string) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders)
    .set({ paymentStatus, adminNotes: adminNotes ?? null, updatedAt: new Date() })
    .where(eq(orders.id, id));
}

/** Update order with Razorpay payment details after successful payment */
export async function updateOrderRazorpay(
  id: number,
  razorpayOrderId: string,
  razorpayPaymentId: string,
) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders)
    .set({
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));
}

/** Update order with manual UTR number */
export async function updateOrderUTR(id: number, utrNumber: string) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders)
    .set({
      utrNumber,
      paymentMethod: "manual",
      paymentStatus: "pending",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));
}

/** Update order with Razorpay order ID before payment */
export async function setOrderRazorpayOrderId(id: number, razorpayOrderId: string) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders)
    .set({ razorpayOrderId, paymentMethod: "razorpay", updatedAt: new Date() })
    .where(eq(orders.id, id));
}

// ── Band Members ──────────────────────────────────────────────────────────────

export async function getBandMembers() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(bandMembers).orderBy(bandMembers.sortOrder, bandMembers.id);
}

export async function upsertBandMember(input: {
  id?: number;
  name: string;
  role: string;
  photoUrl?: string | null;
  bio?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const { id, ...data } = input;
  if (id) {
    await db.update(bandMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bandMembers.id, id));
    return { id };
  } else {
    const [row] = await db.insert(bandMembers)
      .values({ ...data, isActive: data.isActive ?? true, sortOrder: data.sortOrder ?? 0 })
      .returning({ id: bandMembers.id });
    return row;
  }
}

export async function deleteBandMember(id: number) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(bandMembers).where(eq(bandMembers.id, id));
}

// ── Band Alerts ───────────────────────────────────────────────────────────────

export async function getBandAlert() {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(bandAlerts).orderBy(bandAlerts.id).limit(1);
  return rows[0] ?? null;
}

export async function saveBandAlert(input: {
  id?: number;
  message: string;
  alertType?: string;
  isActive: boolean;
}) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const { id, ...data } = input;
  if (id) {
    await db.update(bandAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bandAlerts.id, id));
    return { id };
  } else {
    const [row] = await db.insert(bandAlerts)
      .values({ ...data, alertType: data.alertType ?? "recruiting" })
      .returning({ id: bandAlerts.id });
    return row;
  }
}

/** Instantly toggle alert on/off without changing message or type */
export async function toggleBandAlert(id: number, isActive: boolean) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(bandAlerts)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(bandAlerts.id, id));
  return { id, isActive };
}
