/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KSETRAVID — DATABASE SCHEMA (Drizzle ORM + Neon Postgres)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file defines every table in the Postgres database using Drizzle ORM.
 * It is the authoritative source of truth for the database structure.
 *
 * ── HOW TO APPLY SCHEMA CHANGES ─────────────────────────────────────────────
 * After editing this file, run:
 *   pnpm db:push
 *
 * That command runs "drizzle-kit generate" (creates a SQL migration file in
 * drizzle/migrations/) and then "drizzle-kit migrate" (applies it to Neon).
 * You MUST have KSETRAVID_DB_URL or NEON_DATABASE_URL set in your .env file.
 *
 * ── DATABASE PROVIDER ───────────────────────────────────────────────────────
 * Neon Postgres (serverless HTTP driver). Works in Vercel, Railway, and any
 * Node.js environment. Connection string format:
 *   postgresql://user:password@host/dbname?sslmode=require
 *
 * ── TABLE OVERVIEW ──────────────────────────────────────────────────────────
 *   users              — Manus OAuth end-users (not used for admin panel)
 *   admin_credentials  — Admin username + hashed password (custom auth)
 *   tour_dates         — Live / upcoming / past show dates
 *   site_images        — All replaceable images on the public website
 *   merch_products     — Merchandise catalog (t-shirts, shorts, etc.)
 *   upi_settings       — UPI payment details (ID, QR code, WhatsApp)
 *   orders             — Customer purchase orders (Razorpay + manual UPI)
 *   band_members       — Current and former band members
 *   band_alerts        — Homepage alert banners (e.g. "We're recruiting!")
 *
 * ── MIGRATION NOTES ─────────────────────────────────────────────────────────
 * When moving to a new host, you do NOT need to recreate the schema manually.
 * Just point KSETRAVID_DB_URL to a fresh Neon database and run "pnpm db:push".
 * Drizzle will create all tables automatically from this file.
 * See HOSTING_MIGRATION.md for the full migration checklist.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ── Users (Manus OAuth — kept for system compatibility) ──────────────────────
// This table stores end-users who log in via Manus OAuth.
// It is NOT used for the admin panel — admin auth uses admin_credentials below.
// If you remove Manus OAuth entirely, this table can be left empty.
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(), // Manus OAuth unique user ID
  name: text("name"),                                            // Display name from OAuth
  email: varchar("email", { length: 320 }),                     // Email from OAuth (may be null)
  loginMethod: varchar("loginMethod", { length: 64 }),           // e.g. "oauth"
  role: roleEnum("role").default("user").notNull(),              // "user" or "admin"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Admin Credentials (custom username/password auth) ────────────────────────
// Stores the admin panel credentials (username + SHA-256 hashed password).
// Only ONE row should exist at a time (the active admin account).
// Default credentials seeded on first run: ksetravid / Loudbox2026
// Change via Admin Dashboard → Credentials after first login.
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(), // SHA-256 + salt
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type AdminCredentials = typeof adminCredentials.$inferSelect;

// ── Tour Dates ────────────────────────────────────────────────────────────────
// Each row is one show/gig. Managed via Admin Dashboard → Tour Dates.
// The public website reads this and displays upcoming shows.
export const tourDates = pgTable("tour_dates", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 32 }).notNull(),       // Display string, e.g. "15 Apr 2026"
  city: varchar("city", { length: 128 }).notNull(),
  venue: varchar("venue", { length: 256 }).notNull(),
  country: varchar("country", { length: 64 }).default("India").notNull(),
  ticketUrl: text("ticketUrl"),                           // Optional link to buy tickets
  isSoldOut: boolean("isSoldOut").default(false).notNull(),
  isPast: boolean("isPast").default(false).notNull(),     // Past shows are shown differently
  sortOrder: integer("sortOrder").default(0).notNull(),   // Lower = shown first
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type TourDate = typeof tourDates.$inferSelect;
export type InsertTourDate = typeof tourDates.$inferInsert;

// ── Site Images ───────────────────────────────────────────────────────────────
// Stores CDN URLs for every replaceable image on the public website.
// The "key" field is a stable identifier (e.g. "hero_bg", "gallery_1").
// Admin Dashboard → Image Manager lets the admin replace any image.
// On first run, seed.ts inserts the initial CDN URLs for all 16 image slots.
export const siteImages = pgTable("site_images", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(), // Stable identifier, e.g. "hero_bg"
  label: varchar("label", { length: 256 }).notNull(),      // Human-readable name for admin UI
  section: varchar("section", { length: 64 }).notNull(),   // e.g. "Hero", "Gallery", "Members"
  url: text("url").notNull(),                              // Public CDN URL of the image
  altText: varchar("altText", { length: 256 }),            // SEO alt text
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type SiteImage = typeof siteImages.$inferSelect;
export type InsertSiteImage = typeof siteImages.$inferInsert;

// ── Merch Products ────────────────────────────────────────────────────────────
// The full merchandise catalog. Managed via Admin Dashboard → Merch Editor.
// The public website reads this and renders the shop section with filters.
export const merchProducts = pgTable("merch_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),      // e.g. "tees", "shorts", "tanks"
  price: integer("price").notNull(),                             // Price in INR (rupees)
  imageUrl: text("imageUrl").notNull(),                          // Public CDN URL of product image
  description: text("description"),                              // Optional product description
  sizes: text("sizes").notNull(),                                // Comma-separated, e.g. "S,M,L,XL,2XL"
  tags: text("tags").notNull(),                                  // Comma-separated filter tags
  collectionTag: varchar("collectionTag", { length: 64 }),       // e.g. "Berserker", "Nomad"
  isActive: boolean("isActive").default(true).notNull(),         // false = hidden from shop
  sortOrder: integer("sortOrder").default(0).notNull(),          // Lower = shown first
  shopifyUrl: text("shopifyUrl"),                                // Optional Shopify product link
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MerchProduct = typeof merchProducts.$inferSelect;
export type InsertMerchProduct = typeof merchProducts.$inferInsert;

// ── UPI Settings ──────────────────────────────────────────────────────────────
// Stores the UPI payment details shown in the checkout modal.
// Only ONE row should exist (the active payment config).
// Managed via Admin Dashboard → UPI Settings.
export const upiSettings = pgTable("upi_settings", {
  id: serial("id").primaryKey(),
  upiId: varchar("upiId", { length: 128 }).notNull(),          // e.g. "nikhilraj2110@oksbi"
  accountName: varchar("accountName", { length: 128 }).notNull(), // Name shown in UPI app
  qrCodeUrl: text("qrCodeUrl"),                                  // Optional QR code CDN URL
  whatsappNumber: varchar("whatsappNumber", { length: 32 }),     // For order confirmation via WhatsApp
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type UpiSettings = typeof upiSettings.$inferSelect;
export type InsertUpiSettings = typeof upiSettings.$inferInsert;

// ── Orders ────────────────────────────────────────────────────────────────────
// Every purchase order placed through the website checkout.
// Supports two payment methods:
//   1. Razorpay (automatic confirmation via webhook/signature)
//   2. Manual UPI (customer enters UTR number, admin verifies manually)
// Managed via Admin Dashboard → Orders.
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"]);

export const orders = pgTable("orders", {
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
  unitPrice: integer("unitPrice").notNull(),   // INR
  totalAmount: integer("totalAmount").notNull(), // INR = unitPrice × quantity
  // Payment info
  upiId: varchar("upiId", { length: 128 }).notNull(),  // Snapshot of UPI ID at time of order
  paymentStatus: orderStatusEnum("paymentStatus").default("pending").notNull(),
  paymentNote: text("paymentNote"),
  // Payment method tracking
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("manual"), // 'razorpay' | 'manual'
  razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),     // Razorpay order ID (set before payment)
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }),  // Razorpay payment ID (set after success)
  utrNumber: varchar("utrNumber", { length: 64 }),                   // Manual UTR fallback (customer-entered)
  // Admin notes
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ── Band Members ──────────────────────────────────────────────────────────────
// Current and former band members displayed in the About section.
// Managed via Admin Dashboard → Band Members.
// isActive=false means the member is no longer in the band (not shown on homepage).
export const bandMembers = pgTable("band_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),          // e.g. "Guitars / Vocals"
  photoUrl: text("photoUrl"),                                 // CDN URL — null shows a styled initial avatar
  bio: text("bio"),                                           // Short bio / fun fact (optional)
  isActive: boolean("isActive").default(true).notNull(),      // false = former member, hidden from homepage
  sortOrder: integer("sortOrder").default(0).notNull(),       // Lower = shown first
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type BandMember = typeof bandMembers.$inferSelect;
export type InsertBandMember = typeof bandMembers.$inferInsert;

// ── Band Alerts ("Looking for X" banners) ─────────────────────────────────────
// A single alert banner shown at the top of the About section on the homepage.
// Used to announce open positions, hiatuses, or general news.
// Managed via Admin Dashboard → Band Members → "Homepage Alert Banner".
// The admin can toggle isActive on/off instantly without editing the message.
export const bandAlerts = pgTable("band_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),                         // Full alert text shown to visitors
  alertType: varchar("alertType", { length: 64 }).default("recruiting"), // 'recruiting' | 'hiatus' | 'announcement' | 'departure'
  isActive: boolean("isActive").default(true).notNull(),      // Toggle visibility on homepage instantly
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type BandAlert = typeof bandAlerts.$inferSelect;
export type InsertBandAlert = typeof bandAlerts.$inferInsert;
