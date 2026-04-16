// api/trpc/[...trpc].ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  // ── Manus OAuth (only needed if you keep Manus login for end-users) ──────────
  // VITE_APP_ID is the OAuth application ID issued by the Manus platform.
  // If you are NOT using Manus OAuth (i.e. you only use the /admin panel),
  // you can leave this empty — the admin login uses its own JWT system.
  appId: process.env.VITE_APP_ID ?? "",
  // ── Session / JWT secret ─────────────────────────────────────────────────────
  // JWT_SECRET is used to sign and verify the admin session cookie.
  // REQUIRED. Must be at least 32 random characters.
  // Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  cookieSecret: process.env.JWT_SECRET ?? "",
  // ── Database ─────────────────────────────────────────────────────────────────
  // The app uses Neon Postgres (serverless HTTP driver — works in serverless and Node.js).
  // Priority order: KSETRAVID_DB_URL → NEON_DATABASE_URL → DATABASE_URL
  //
  //   KSETRAVID_DB_URL  — recommended: set this explicitly on your new host
  //   NEON_DATABASE_URL — auto-injected by Neon integrations on Vercel / Railway
  //   DATABASE_URL      — generic fallback (used by many PaaS platforms)
  //
  // Format: postgresql://user:password@host/dbname?sslmode=require
  // Get this from: Neon dashboard → your project → Connection Details → Connection string
  databaseUrl: process.env.KSETRAVID_DB_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "",
  neonDatabaseUrl: process.env.KSETRAVID_DB_URL || process.env.NEON_DATABASE_URL || "",
  // ── Manus OAuth server (only needed for Manus end-user login) ────────────────
  // Points to the Manus OAuth backend. Leave empty if not using Manus login.
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  // ── Owner identification (only needed for Manus end-user login) ──────────────
  // The Manus open ID of the project owner. Used to auto-assign the "admin" role
  // to the owner account in the users table. Not needed for the admin panel.
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  // ── Runtime mode ─────────────────────────────────────────────────────────────
  // Automatically set by Node.js. Do not set this manually.
  isProduction: process.env.NODE_ENV === "production",
  // ── Manus Storage API (file uploads — images, QR codes, member photos) ───────
  // BUILT_IN_FORGE_API_URL — base URL of the Manus storage proxy
  // BUILT_IN_FORGE_API_KEY — bearer token for the storage proxy
  //
  // ⚠️  IMPORTANT FOR MIGRATION:
  // The current server/storage.ts uses the Manus-hosted storage proxy.
  // When moving to a different host you MUST replace it with a direct
  // AWS S3 or Cloudflare R2 implementation. See HOSTING_MIGRATION.md → "File Storage".
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { eq, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";

// drizzle/schema.ts
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  // Manus OAuth unique user ID
  name: text("name"),
  // Display name from OAuth
  email: varchar("email", { length: 320 }),
  // Email from OAuth (may be null)
  loginMethod: varchar("loginMethod", { length: 64 }),
  // e.g. "oauth"
  role: roleEnum("role").default("user").notNull(),
  // "user" or "admin"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  // SHA-256 + salt
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var tourDates = pgTable("tour_dates", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 32 }).notNull(),
  // Display string, e.g. "15 Apr 2026"
  city: varchar("city", { length: 128 }).notNull(),
  venue: varchar("venue", { length: 256 }).notNull(),
  country: varchar("country", { length: 64 }).default("India").notNull(),
  ticketUrl: text("ticketUrl"),
  // Optional link to buy tickets
  isSoldOut: boolean("isSoldOut").default(false).notNull(),
  isPast: boolean("isPast").default(false).notNull(),
  // Past shows are shown differently
  sortOrder: integer("sortOrder").default(0).notNull(),
  // Lower = shown first
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var siteImages = pgTable("site_images", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  // Stable identifier, e.g. "hero_bg"
  label: varchar("label", { length: 256 }).notNull(),
  // Human-readable name for admin UI
  section: varchar("section", { length: 64 }).notNull(),
  // e.g. "Hero", "Gallery", "Members"
  url: text("url").notNull(),
  // Public CDN URL of the image
  altText: varchar("altText", { length: 256 }),
  // SEO alt text
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var merchProducts = pgTable("merch_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  // e.g. "tees", "shorts", "tanks"
  price: integer("price").notNull(),
  // Price in INR (rupees)
  imageUrl: text("imageUrl").notNull(),
  // Public CDN URL of product image
  description: text("description"),
  // Optional product description
  sizes: text("sizes").notNull(),
  // Comma-separated, e.g. "S,M,L,XL,2XL"
  tags: text("tags").notNull(),
  // Comma-separated filter tags
  collectionTag: varchar("collectionTag", { length: 64 }),
  // e.g. "Berserker", "Nomad"
  isActive: boolean("isActive").default(true).notNull(),
  // false = hidden from shop
  sortOrder: integer("sortOrder").default(0).notNull(),
  // Lower = shown first
  shopifyUrl: text("shopifyUrl"),
  // Optional Shopify product link
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var upiSettings = pgTable("upi_settings", {
  id: serial("id").primaryKey(),
  upiId: varchar("upiId", { length: 128 }).notNull(),
  // e.g. "nikhilraj2110@oksbi"
  accountName: varchar("accountName", { length: 128 }).notNull(),
  // Name shown in UPI app
  qrCodeUrl: text("qrCodeUrl"),
  // Optional QR code CDN URL
  whatsappNumber: varchar("whatsappNumber", { length: 32 }),
  // For order confirmation via WhatsApp
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var orderStatusEnum = pgEnum("order_status", ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"]);
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Auto-generated transaction reference shown in UPI remarks (e.g. "KSV-20260415-A3X9")
  txnRef: varchar("txnRef", { length: 32 }).notNull().unique(),
  // Buyer details
  buyerName: varchar("buyerName", { length: 256 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 20 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  // Delivery address
  addressLine1: text("addressLine1").notNull(),
  addressLine2: text("addressLine2"),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 128 }).notNull(),
  pincode: varchar("pincode", { length: 16 }).notNull(),
  // Product info (snapshot at time of order — not a FK to avoid stale data)
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  productCategory: varchar("productCategory", { length: 64 }).notNull(),
  selectedSize: varchar("selectedSize", { length: 32 }),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unitPrice").notNull(),
  // INR
  totalAmount: integer("totalAmount").notNull(),
  // INR = unitPrice × quantity
  // Payment info
  upiId: varchar("upiId", { length: 128 }).notNull(),
  // Snapshot of UPI ID at time of order
  paymentStatus: orderStatusEnum("paymentStatus").default("pending").notNull(),
  paymentNote: text("paymentNote"),
  // Payment method tracking
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("manual"),
  // 'razorpay' | 'manual'
  razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),
  // Razorpay order ID (set before payment)
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }),
  // Razorpay payment ID (set after success)
  utrNumber: varchar("utrNumber", { length: 64 }),
  // Manual UTR fallback (customer-entered)
  // Admin notes
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var bandMembers = pgTable("band_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  // e.g. "Guitars / Vocals"
  photoUrl: text("photoUrl"),
  // CDN URL — null shows a styled initial avatar
  bio: text("bio"),
  // Short bio / fun fact (optional)
  isActive: boolean("isActive").default(true).notNull(),
  // false = former member, hidden from homepage
  sortOrder: integer("sortOrder").default(0).notNull(),
  // Lower = shown first
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var bandAlerts = pgTable("band_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  // Full alert text shown to visitors
  alertType: varchar("alertType", { length: 64 }).default("recruiting"),
  // 'recruiting' | 'hiatus' | 'announcement' | 'departure'
  isActive: boolean("isActive").default(true).notNull(),
  // Toggle visibility on homepage instantly
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});

// server/db.ts
var _db = null;
function getDb() {
  if (_db) return _db;
  const url = process.env.KSETRAVID_DB_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn("[Database] No KSETRAVID_DB_URL or NEON_DATABASE_URL set \u2014 DB unavailable");
    return null;
  }
  if (url.startsWith("mysql://") || url.startsWith("mysql2://")) {
    console.warn("[Database] MySQL URL detected \u2014 Neon HTTP requires a PostgreSQL URL");
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
function hashPassword(password) {
  return createHash("sha256").update(password + "ksetravid_salt_2026").digest("hex");
}
async function getAdminCredentials() {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(adminCredentials).limit(1);
  return result[0] ?? null;
}
async function seedAdminCredentials(username, password) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) return;
  await db.insert(adminCredentials).values({
    username,
    passwordHash: hashPassword(password)
  });
  console.log("[AdminAuth] Initial credentials seeded to DB.");
}
async function verifyAdminCredentials(username, password) {
  const db = getDb();
  if (!db) return false;
  const creds = await getAdminCredentials();
  if (!creds) return false;
  return creds.username === username && creds.passwordHash === hashPassword(password);
}
async function updateAdminCredentials(newUsername, newPassword) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getAdminCredentials();
  if (existing) {
    await db.update(adminCredentials).set({ username: newUsername, passwordHash: hashPassword(newPassword), updatedAt: /* @__PURE__ */ new Date() }).where(eq(adminCredentials.id, existing.id));
  } else {
    await db.insert(adminCredentials).values({
      username: newUsername,
      passwordHash: hashPassword(newPassword)
    });
  }
}
async function getCurrentAdminUsername() {
  const creds = await getAdminCredentials();
  return creds?.username ?? null;
}
async function getTourDates() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(tourDates).orderBy(asc(tourDates.sortOrder), asc(tourDates.date));
}
async function upsertTourDate(data) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(tourDates).set({ ...rest, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tourDates.id, id));
    return id;
  } else {
    const result = await db.insert(tourDates).values(data).returning({ id: tourDates.id });
    return result[0].id;
  }
}
async function deleteTourDate(id) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tourDates).where(eq(tourDates.id, id));
}
async function getSiteImages() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(siteImages).orderBy(asc(siteImages.section), asc(siteImages.key));
}
async function upsertSiteImage(data) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(siteImages).set({ ...rest, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteImages.id, id));
  } else {
    await db.insert(siteImages).values(data).onConflictDoUpdate({
      target: siteImages.key,
      set: { url: data.url, altText: data.altText ?? null, updatedAt: /* @__PURE__ */ new Date() }
    });
  }
}
async function getMerchProducts() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(merchProducts).orderBy(asc(merchProducts.sortOrder), asc(merchProducts.id));
}
async function upsertMerchProduct(data) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(merchProducts).set({ ...rest, updatedAt: /* @__PURE__ */ new Date() }).where(eq(merchProducts.id, id));
    return id;
  } else {
    const result = await db.insert(merchProducts).values(data).returning({ id: merchProducts.id });
    return result[0].id;
  }
}
async function deleteMerchProduct(id) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(merchProducts).where(eq(merchProducts.id, id));
}
async function getUpiSettings() {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(upiSettings).limit(1);
  return result[0] ?? null;
}
async function saveUpiSettings(data) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getUpiSettings();
  if (existing) {
    await db.update(upiSettings).set({
      upiId: data.upiId,
      accountName: data.accountName,
      qrCodeUrl: data.qrCodeUrl ?? null,
      whatsappNumber: data.whatsappNumber ?? null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(upiSettings.id, existing.id));
  } else {
    await db.insert(upiSettings).values(data);
  }
}
function generateTxnRef() {
  const date = /* @__PURE__ */ new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KSV-${dateStr}-${rand}`;
}
async function createOrder(data) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data).returning({ id: orders.id, txnRef: orders.txnRef });
  return result[0];
}
async function getOrders() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
async function getOrderById(id) {
  const db = getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateOrderStatus(id, paymentStatus, adminNotes) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ paymentStatus, adminNotes: adminNotes ?? null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id));
}
async function updateOrderRazorpay(id, razorpayOrderId, razorpayPaymentId) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({
    razorpayOrderId,
    razorpayPaymentId,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(orders.id, id));
}
async function updateOrderUTR(id, utrNumber) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({
    utrNumber,
    paymentMethod: "manual",
    paymentStatus: "pending",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(orders.id, id));
}
async function setOrderRazorpayOrderId(id, razorpayOrderId) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ razorpayOrderId, paymentMethod: "razorpay", updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id));
}
async function getBandMembers() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(bandMembers).orderBy(bandMembers.sortOrder, bandMembers.id);
}
async function upsertBandMember(input) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const { id, ...data } = input;
  if (id) {
    await db.update(bandMembers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bandMembers.id, id));
    return { id };
  } else {
    const [row] = await db.insert(bandMembers).values({ ...data, isActive: data.isActive ?? true, sortOrder: data.sortOrder ?? 0 }).returning({ id: bandMembers.id });
    return row;
  }
}
async function deleteBandMember(id) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(bandMembers).where(eq(bandMembers.id, id));
}
async function getBandAlert() {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(bandAlerts).orderBy(bandAlerts.id).limit(1);
  return rows[0] ?? null;
}
async function saveBandAlert(input) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  const { id, ...data } = input;
  if (id) {
    await db.update(bandAlerts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bandAlerts.id, id));
    return { id };
  } else {
    const [row] = await db.insert(bandAlerts).values({ ...data, alertType: data.alertType ?? "recruiting" }).returning({ id: bandAlerts.id });
    return row;
  }
}
async function toggleBandAlert(id, isActive) {
  const db = getDb();
  if (!db) throw new Error("DB not available");
  await db.update(bandAlerts).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bandAlerts.id, id));
  return { id, isActive };
}

// server/adminAuth.ts
import { SignJWT, jwtVerify } from "jose";
var ADMIN_COOKIE = "ksetravid_admin_session";
function getJwtSecret() {
  const s = ENV.cookieSecret;
  if (!s || s.length < 16) throw new Error("JWT_SECRET env var is too short or missing");
  return new TextEncoder().encode(s);
}
async function signAdminJWT() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(getJwtSecret());
}
async function verifyAdminJWT(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const segmentStart = relKey.lastIndexOf("/");
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1 || lastDot <= segmentStart) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/razorpay.ts
import Razorpay from "razorpay";
import crypto2 from "crypto";
function getRazorpay() {
  const keyId = process.env.KSETRAVID_RAZORPAY_KEY_ID;
  const keySecret = process.env.KSETRAVID_RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
async function createRazorpayOrder(amountInPaise, receipt) {
  const rzp = getRazorpay();
  if (!rzp) throw new Error("Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: true
  });
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.KSETRAVID_RAZORPAY_KEY_ID
  };
}
function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const keySecret = process.env.KSETRAVID_RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto2.createHmac("sha256", keySecret).update(body).digest("hex");
  return expectedSignature === razorpaySignature;
}
function isRazorpayConfigured() {
  return !!(process.env.KSETRAVID_RAZORPAY_KEY_ID && process.env.KSETRAVID_RAZORPAY_KEY_SECRET);
}

// server/routers.ts
import { nanoid } from "nanoid";

// server/seed.ts
var INITIAL_IMAGES = [
  {
    key: "logo",
    label: "Logo",
    section: "Global",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png",
    altText: "Ksetravid logo"
  },
  {
    key: "hero_bg",
    label: "Hero Background",
    section: "Hero",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_hero_bg-PCFrUDfN4sN3ED5yRqYKQC.webp",
    altText: "Cosmic hero background"
  },
  {
    key: "hero_band_photo",
    label: "Hero Band Photo",
    section: "Hero",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png",
    altText: "Ksetravid band photo"
  },
  {
    key: "about_bg",
    label: "About Background",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_about_bg-mps2bmXs33M4MQ8C7eQV9t.webp",
    altText: "About section background"
  },
  {
    key: "about_band_outdoor",
    label: "Band Photo (Outdoor)",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg",
    altText: "Band outdoor photo"
  },
  {
    key: "about_band_bw",
    label: "Band Photo (B&W)",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg",
    altText: "Band black and white photo"
  },
  {
    key: "gallery_1",
    label: "Gallery Photo 1",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png",
    altText: "Gallery photo 1"
  },
  {
    key: "gallery_2",
    label: "Gallery Photo 2",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg",
    altText: "Gallery photo 2"
  },
  {
    key: "gallery_3",
    label: "Gallery Photo 3",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg",
    altText: "Gallery photo 3"
  },
  {
    key: "gallery_4",
    label: "Gallery Photo 4",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_live_d9615956.jpg",
    altText: "Gallery photo 4"
  },
  {
    key: "gallery_5",
    label: "Gallery Photo 5",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_silhouette_03b6ba71.png",
    altText: "Gallery photo 5"
  },
  {
    key: "gallery_6",
    label: "Gallery Photo 6",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_anamnesis_ecc6e99c.jpg",
    altText: "Gallery photo 6"
  },
  {
    key: "tour_bg",
    label: "Tour Background",
    section: "Tour",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_tour_bg-G2r5A4Ci2qCwubZPq5aP54.webp",
    altText: "Tour section background"
  },
  {
    key: "member_pritam",
    label: "Pritam Middey (Guitars)",
    section: "Members",
    url: "",
    altText: "Pritam Middey \u2014 Guitars"
  },
  {
    key: "member_arunav",
    label: "Arunav Bhattacharjee (Bass)",
    section: "Members",
    url: "",
    altText: "Arunav Bhattacharjee \u2014 Bass"
  },
  {
    key: "member_nikhil",
    label: "Nikhil TR (Drums)",
    section: "Members",
    url: "",
    altText: "Nikhil TR \u2014 Drums"
  }
];
var INITIAL_TOUR_DATES = [
  { date: "Jun 15, 2025", city: "Bangalore", venue: "TBA", country: "India", isSoldOut: false, isPast: true, sortOrder: 4 },
  { date: "Jun 8, 2025", city: "Kolkata", venue: "Top Cat", country: "India", isSoldOut: false, isPast: true, sortOrder: 3 },
  { date: "Jun 7, 2025", city: "Delhi", venue: "TBA", country: "India", isSoldOut: false, isPast: true, sortOrder: 2 },
  { date: "Jun 5, 2025", city: "Mumbai", venue: "Antisocial", country: "India", isSoldOut: false, isPast: true, sortOrder: 1 }
];
var INITIAL_MERCH = [
  {
    name: "Anamnesis \u2014 Regular Tee",
    category: "tees",
    price: 1e3,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg",
    sizes: "S,M,L,XL,2XL",
    tags: "Best Seller,graphic,black",
    collectionTag: "Anamnesis",
    description: "Unleash the essence of Ksetravid's Anamnesis with this exclusive graphic T-shirt, crafted by acclaimed artist Dipayan Das. Made for fans who live and breathe heavy music, this tee blends bold artwork with premium comfort \u2014 perfect for gigs, festivals, or everyday streetwear.",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Anamnesis \u2014 Tank Top",
    category: "tanks",
    price: 850,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tank_hd_b3f14fac.jpg",
    sizes: "S,L,XL,2XL,3XL",
    tags: "New,graphic,black",
    collectionTag: "Anamnesis",
    description: "A brutal, premium graphic tank top featuring exclusive Anamnesis artwork by Dipayan Das. Designed for fans who live and breathe heavy music. Lightweight, sleeveless cut \u2014 ideal for the pit.",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Berserker \u2014 Shorts",
    category: "shorts",
    price: 700,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_shorts_correct_cf0c28e8.png",
    sizes: "28,30,32,34,36",
    tags: "Limited,occult,black",
    collectionTag: "Berserker",
    description: "Berserker-series shorts featuring the signature Ksetravid occult artwork. Satin-finish black fabric with drawstring waist. The Berserker design channels ancient fury through modern streetwear.",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Berserker \u2014 Tank Top",
    category: "tanks",
    price: 800,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_tank_hd_afbe5844.png",
    sizes: "S,M,L,XL,2XL,3XL",
    tags: "New,occult,black",
    collectionTag: "Berserker",
    description: "The Berserker tank top brings the raw power of Ksetravid's occult-metal aesthetic to a sleeveless format. Heavyweight cotton blend, oversized fit, printed with the iconic Berserker artwork.",
    isActive: true,
    sortOrder: 4
  },
  {
    name: "Crop Top \u2014 She/Her",
    category: "crop-tops",
    price: 750,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_crop_top_hd_1e662d72.png",
    sizes: "XS,S,M,L,XL",
    tags: "She/Her,occult,fitted",
    collectionTag: "Berserker",
    description: "Ksetravid's first crop top \u2014 designed for she/her fans who want to carry the band's occult energy in a fitted silhouette. Features the Berserker artwork on premium stretch fabric.",
    isActive: true,
    sortOrder: 5
  },
  {
    name: "Nomad \u2014 Shorts",
    category: "shorts",
    price: 700,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_shorts_hd_66199aa0.png",
    sizes: "28,30,32,34,36",
    tags: "Limited,serpent,black",
    collectionTag: "Nomad",
    description: "Nomad-series shorts with the Ksetravid logo and serpentine artwork. Satin-finish black with drawstring waist. The Nomad collection represents the wandering consciousness \u2014 unbound, untethered.",
    isActive: true,
    sortOrder: 6
  },
  {
    name: "Nomad \u2014 Tank Top",
    category: "tanks",
    price: 750,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_tank_hd_78506900.png",
    sizes: "S,M,L,XL,2XL,3XL",
    tags: "New,serpent,black",
    collectionTag: "Nomad",
    description: "The Nomad tank top \u2014 sleeveless, raw, and relentless. Featuring the serpent-and-eye motif from the Nomad collection. Lightweight cotton, perfect for summer shows and festival season.",
    isActive: true,
    sortOrder: 7
  },
  {
    name: "Ouroboros & Meditate \u2014 Tee",
    category: "tees",
    price: 1e3,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_ouroborus_tee_hd_b56f698d.jpg",
    sizes: "S,M,L,XL,3XL",
    tags: "Signature,philosophical,black",
    collectionTag: "Ouroboros",
    description: "The Ouroboros & Meditate tee is the most philosophical piece in the Ksetravid merch line. Two designs in one \u2014 the eternal serpent devouring itself, and a figure in deep meditation within a triangle. Rooted in the Upanishadic concept of the self as infinite.",
    isActive: true,
    sortOrder: 8
  }
];
var INITIAL_UPI = {
  upiId: "nikhilraj2110@oksbi",
  accountName: "T R Nikhil",
  qrCodeUrl: null
};
async function seedDatabase() {
  const db = await getDb();
  if (!db) {
    console.warn("[Seed] Database not available \u2014 skipping seed");
    return;
  }
  try {
    const existingImages = await getSiteImages();
    if (existingImages.length === 0) {
      console.log("[Seed] Seeding site images...");
      await db.insert(siteImages).values(INITIAL_IMAGES);
      console.log(`[Seed] Inserted ${INITIAL_IMAGES.length} site images`);
    }
    const existingTour = await getTourDates();
    if (existingTour.length === 0) {
      console.log("[Seed] Seeding tour dates...");
      await db.insert(tourDates).values(INITIAL_TOUR_DATES);
      console.log(`[Seed] Inserted ${INITIAL_TOUR_DATES.length} tour dates`);
    }
    const existingMerch = await getMerchProducts();
    if (existingMerch.length === 0) {
      console.log("[Seed] Seeding merch products...");
      await db.insert(merchProducts).values(INITIAL_MERCH);
      console.log(`[Seed] Inserted ${INITIAL_MERCH.length} merch products`);
    }
    const existingUpi = await getUpiSettings();
    if (!existingUpi) {
      console.log("[Seed] Seeding UPI settings...");
      await db.insert(upiSettings).values(INITIAL_UPI);
      console.log("[Seed] UPI settings seeded");
    }
    console.log("[Seed] Database seed complete");
  } catch (err) {
    console.error("[Seed] Error during database seed:", err);
  }
}

// server/routers.ts
seedAdminCredentials("ksetravid", "Loudbox2026").catch(
  (err) => console.error("[AdminAuth] Seed failed:", err)
);
seedDatabase().catch((err) => console.error("[Seed] Failed:", err));
var adminProcedure2 = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.[ADMIN_COOKIE];
  if (!token || !await verifyAdminJWT(token)) {
    throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin login required" });
  }
  return next({ ctx });
});
function getSecureCookieOptions(req) {
  const isSecure = req.protocol === "https" || req.headers?.["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/"
  };
}
var appRouter = router({
  system: systemRouter,
  // ── Standard auth (kept for system compatibility) ──────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSecureCookieOptions(ctx.req);
      ctx.res.clearCookie?.(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ── Admin Auth (DB-backed) ─────────────────────────────────────────────────
  admin: router({
    // Check if the current request has a valid admin session
    check: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.[ADMIN_COOKIE];
      if (!token) return { isAdmin: false };
      const valid = await verifyAdminJWT(token);
      return { isAdmin: valid };
    }),
    // Login — checks DB credentials only, no hardcoded fallback
    login: publicProcedure.input(z2.object({
      username: z2.string().min(1),
      password: z2.string().min(1)
    })).mutation(async ({ input, ctx }) => {
      const valid = await verifyAdminCredentials(input.username, input.password);
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }
      const token = await signAdminJWT();
      const opts = getSecureCookieOptions(ctx.req);
      ctx.res.cookie?.(ADMIN_COOKIE, token, {
        ...opts,
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      return { success: true };
    }),
    // Logout — clears the session cookie
    logout: publicProcedure.mutation(({ ctx }) => {
      const opts = getSecureCookieOptions(ctx.req);
      ctx.res.clearCookie?.(ADMIN_COOKIE, { ...opts, maxAge: -1 });
      return { success: true };
    }),
    // Get current username (never the password)
    getUsername: adminProcedure2.query(async () => {
      const username = await getCurrentAdminUsername();
      return { username: username ?? "ksetravid" };
    }),
    /**
     * Permanently replace credentials in the DB.
     * After this call, the old username + password are gone forever.
     * The next login MUST use the new credentials.
     */
    updateCredentials: adminProcedure2.input(z2.object({
      newUsername: z2.string().min(3, "Username must be at least 3 characters"),
      newPassword: z2.string().min(6, "Password must be at least 6 characters")
    })).mutation(async ({ input }) => {
      await updateAdminCredentials(input.newUsername, input.newPassword);
      return { success: true };
    })
  }),
  // ── Tour Dates ──────────────────────────────────────────────────────────────
  tour: router({
    list: publicProcedure.query(() => getTourDates()),
    save: adminProcedure2.input(z2.object({
      id: z2.number().optional(),
      date: z2.string().min(1),
      city: z2.string().min(1),
      venue: z2.string().min(1),
      country: z2.string().default("India"),
      ticketUrl: z2.string().nullable().optional(),
      isSoldOut: z2.boolean().default(false),
      isPast: z2.boolean().default(false),
      sortOrder: z2.number().default(0)
    })).mutation(({ input }) => upsertTourDate(input)),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteTourDate(input.id))
  }),
  // ── Site Images ─────────────────────────────────────────────────────────────
  images: router({
    list: publicProcedure.query(() => getSiteImages()),
    update: adminProcedure2.input(z2.object({
      id: z2.number().optional(),
      key: z2.string().min(1),
      label: z2.string().min(1),
      section: z2.string().min(1),
      url: z2.string().url(),
      altText: z2.string().optional()
    })).mutation(({ input }) => upsertSiteImage(input))
  }),
  // ── Merch Products ──────────────────────────────────────────────────────────
  merch: router({
    list: publicProcedure.query(() => getMerchProducts()),
    save: adminProcedure2.input(z2.object({
      id: z2.number().optional(),
      name: z2.string().min(1),
      category: z2.string().min(1),
      price: z2.number().min(0),
      imageUrl: z2.string().url(),
      description: z2.string().optional().nullable(),
      sizes: z2.string(),
      tags: z2.string(),
      collectionTag: z2.string().optional().nullable(),
      isActive: z2.boolean().default(true),
      sortOrder: z2.number().default(0),
      shopifyUrl: z2.string().optional().nullable()
    })).mutation(({ input }) => upsertMerchProduct(input)),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteMerchProduct(input.id))
  }),
  // ── UPI Settings ────────────────────────────────────────────────────────────
  upi: router({
    get: publicProcedure.query(() => getUpiSettings()),
    save: adminProcedure2.input(z2.object({
      upiId: z2.string().min(1),
      accountName: z2.string().min(1),
      qrCodeUrl: z2.string().url().optional().nullable(),
      whatsappNumber: z2.string().optional().nullable()
    })).mutation(({ input }) => saveUpiSettings(input))
  }),
  // ── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    // Public: create a new order (called from checkout form)
    create: publicProcedure.input(z2.object({
      buyerName: z2.string().min(1),
      buyerPhone: z2.string().min(10),
      buyerEmail: z2.string().email().optional().nullable(),
      addressLine1: z2.string().min(1),
      addressLine2: z2.string().optional().nullable(),
      city: z2.string().min(1),
      state: z2.string().min(1),
      pincode: z2.string().min(4),
      productId: z2.number(),
      productName: z2.string().min(1),
      productCategory: z2.string().min(1),
      selectedSize: z2.string().optional().nullable(),
      quantity: z2.number().min(1).default(1),
      unitPrice: z2.number().min(0),
      totalAmount: z2.number().min(0),
      upiId: z2.string().min(1)
    })).mutation(async ({ input }) => {
      const txnRef = generateTxnRef();
      const order = await createOrder({ ...input, txnRef });
      return { id: order.id, txnRef: order.txnRef };
    }),
    // Public: initiate Razorpay payment — creates Razorpay order and returns details
    initiateRazorpay: publicProcedure.input(z2.object({ orderId: z2.number() })).mutation(async ({ input }) => {
      if (!isRazorpayConfigured()) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Razorpay is not configured yet" });
      }
      const order = await getOrderById(input.orderId);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND", message: "Order not found" });
      const rzpOrder = await createRazorpayOrder(
        order.totalAmount * 100,
        // paise
        order.txnRef
      );
      await setOrderRazorpayOrderId(order.id, rzpOrder.orderId);
      return {
        razorpayOrderId: rzpOrder.orderId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: rzpOrder.keyId,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        buyerEmail: order.buyerEmail ?? "",
        txnRef: order.txnRef
      };
    }),
    // Public: verify Razorpay payment after success callback from frontend
    verifyRazorpay: publicProcedure.input(z2.object({
      orderId: z2.number(),
      razorpayOrderId: z2.string(),
      razorpayPaymentId: z2.string(),
      razorpaySignature: z2.string()
    })).mutation(async ({ input }) => {
      const valid = verifyRazorpaySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      );
      if (!valid) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Payment verification failed \u2014 signature mismatch" });
      }
      await updateOrderRazorpay(input.orderId, input.razorpayOrderId, input.razorpayPaymentId);
      return { success: true, message: "Payment confirmed" };
    }),
    // Public: submit manual UTR number as fallback
    submitUTR: publicProcedure.input(z2.object({
      orderId: z2.number(),
      utrNumber: z2.string().min(6, "Please enter a valid UTR / transaction ID")
    })).mutation(async ({ input }) => {
      await updateOrderUTR(input.orderId, input.utrNumber);
      return { success: true };
    }),
    // Public: check if Razorpay is configured
    isRazorpayEnabled: publicProcedure.query(() => isRazorpayConfigured()),
    // Admin: list all orders
    list: adminProcedure2.query(() => getOrders()),
    // Admin: update order status
    updateStatus: adminProcedure2.input(z2.object({
      id: z2.number(),
      paymentStatus: z2.enum(["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"]),
      adminNotes: z2.string().optional()
    })).mutation(({ input }) => updateOrderStatus(input.id, input.paymentStatus, input.adminNotes))
  }),
  // ── Band Members (public read, admin write) ────────────────────────────────
  band: router({
    // Public: homepage reads members and alert
    getMembers: publicProcedure.query(() => getBandMembers()),
    getAlert: publicProcedure.query(() => getBandAlert()),
    // Admin: upsert a member (add or edit)
    upsertMember: adminProcedure2.input(z2.object({
      id: z2.number().optional(),
      name: z2.string().min(1),
      role: z2.string().min(1),
      photoUrl: z2.string().nullable().optional(),
      bio: z2.string().nullable().optional(),
      isActive: z2.boolean().optional(),
      sortOrder: z2.number().optional()
    })).mutation(({ input }) => upsertBandMember(input)),
    // Admin: delete a member
    deleteMember: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteBandMember(input.id)),
    // Admin: save the band alert
    saveAlert: adminProcedure2.input(z2.object({
      id: z2.number().optional(),
      message: z2.string().min(1),
      alertType: z2.string().optional(),
      isActive: z2.boolean()
    })).mutation(({ input }) => saveBandAlert(input)),
    // Admin: instantly toggle alert on/off without touching message/type
    toggleAlert: adminProcedure2.input(z2.object({ id: z2.number(), isActive: z2.boolean() })).mutation(({ input }) => toggleBandAlert(input.id, input.isActive))
  }),
  // ── File Upload (base64 → S3 CDN) ───────────────────────────────────────────
  upload: router({
    uploadFile: adminProcedure2.input(z2.object({
      base64: z2.string(),
      filename: z2.string(),
      contentType: z2.string(),
      folder: z2.string().default("admin-uploads")
    })).mutation(async ({ input }) => {
      const ext = input.filename.split(".").pop() ?? "bin";
      const key = `${input.folder}/${nanoid(12)}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url, key };
    })
  })
});

// api/trpc/[...trpc].ts
async function handler(req, res) {
  const url = `https://${req.headers.host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }
  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = JSON.stringify(req.body);
  }
  const request = new Request(url, {
    method: req.method,
    headers,
    body
  });
  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: async () => {
        const cookieHeader = req.headers.cookie ?? "";
        const cookies = {};
        cookieHeader.split(";").forEach((part) => {
          const [k, ...v] = part.trim().split("=");
          if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
        });
        return {
          user: null,
          req: {
            ...req,
            cookies,
            protocol: req.headers["x-forwarded-proto"] ?? "https"
          },
          res: {
            cookie: (name, value, options) => {
              const cookieParts = [`${name}=${encodeURIComponent(value)}`];
              if (options?.maxAge) cookieParts.push(`Max-Age=${Math.floor(options.maxAge / 1e3)}`);
              if (options?.httpOnly) cookieParts.push("HttpOnly");
              if (options?.secure) cookieParts.push("Secure");
              if (options?.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);
              if (options?.path) cookieParts.push(`Path=${options.path}`);
              res.setHeader("Set-Cookie", cookieParts.join("; "));
            },
            clearCookie: (name, options) => {
              const cookieParts = [`${name}=`];
              cookieParts.push("Max-Age=0");
              if (options?.httpOnly) cookieParts.push("HttpOnly");
              if (options?.secure) cookieParts.push("Secure");
              if (options?.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);
              if (options?.path) cookieParts.push(`Path=${options.path}`);
              res.setHeader("Set-Cookie", cookieParts.join("; "));
            }
          }
        };
      },
      onError: ({ error }) => {
        if (error.code !== "UNAUTHORIZED" && error.code !== "NOT_FOUND") {
          console.error("[tRPC Error]", error);
        }
      }
    });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });
    const responseBody = await response.text();
    res.send(responseBody);
  } catch (err) {
    console.error("[Vercel] Request handler crashed:", err?.message, err?.stack);
    res.status(500).json({ error: "Request handler crashed", detail: err?.message });
  }
}
export {
  handler as default
};
