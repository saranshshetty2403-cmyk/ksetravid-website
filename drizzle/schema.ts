import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ── Users (Manus OAuth — kept for system compatibility) ──────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Admin Credentials (custom username/password auth) ────────────────────────
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type AdminCredentials = typeof adminCredentials.$inferSelect;

// ── Tour Dates ────────────────────────────────────────────────────────────────
export const tourDates = pgTable("tour_dates", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 32 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  venue: varchar("venue", { length: 256 }).notNull(),
  country: varchar("country", { length: 64 }).default("India").notNull(),
  ticketUrl: text("ticketUrl"),
  isSoldOut: boolean("isSoldOut").default(false).notNull(),
  isPast: boolean("isPast").default(false).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type TourDate = typeof tourDates.$inferSelect;
export type InsertTourDate = typeof tourDates.$inferInsert;

// ── Site Images ───────────────────────────────────────────────────────────────
export const siteImages = pgTable("site_images", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 256 }).notNull(),
  section: varchar("section", { length: 64 }).notNull(),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 256 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type SiteImage = typeof siteImages.$inferSelect;
export type InsertSiteImage = typeof siteImages.$inferInsert;

// ── Merch Products ────────────────────────────────────────────────────────────
export const merchProducts = pgTable("merch_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  price: integer("price").notNull(),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
  sizes: text("sizes").notNull(),
  tags: text("tags").notNull(),
  collectionTag: varchar("collectionTag", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  shopifyUrl: text("shopifyUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MerchProduct = typeof merchProducts.$inferSelect;
export type InsertMerchProduct = typeof merchProducts.$inferInsert;

// ── UPI Settings ──────────────────────────────────────────────────────────────
export const upiSettings = pgTable("upi_settings", {
  id: serial("id").primaryKey(),
  upiId: varchar("upiId", { length: 128 }).notNull(),
  accountName: varchar("accountName", { length: 128 }).notNull(),
  qrCodeUrl: text("qrCodeUrl"),
  whatsappNumber: varchar("whatsappNumber", { length: 32 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type UpiSettings = typeof upiSettings.$inferSelect;
export type InsertUpiSettings = typeof upiSettings.$inferInsert;

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Auto-generated transaction reference shown in UPI remarks
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
  // Product info (snapshot at time of order)
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  productCategory: varchar("productCategory", { length: 64 }).notNull(),
  selectedSize: varchar("selectedSize", { length: 32 }),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unitPrice").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  // Payment info
  upiId: varchar("upiId", { length: 128 }).notNull(),
  paymentStatus: orderStatusEnum("paymentStatus").default("pending").notNull(),
  paymentNote: text("paymentNote"),
  // Payment method tracking
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("manual"), // 'razorpay' | 'manual'
  razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),    // Razorpay order ID
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }), // Razorpay payment ID (after success)
  utrNumber: varchar("utrNumber", { length: 64 }),                  // Manual UTR fallback
  // Admin notes
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ── Band Members ──────────────────────────────────────────────────────────────
export const bandMembers = pgTable("band_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),          // e.g. "Guitars / Vocals"
  photoUrl: text("photoUrl"),                                 // CDN URL
  bio: text("bio"),                                           // Short bio / fun fact
  isActive: boolean("isActive").default(true).notNull(),      // false = former member
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type BandMember = typeof bandMembers.$inferSelect;
export type InsertBandMember = typeof bandMembers.$inferInsert;

// ── Band Alerts ("Looking for X" banners) ─────────────────────────────────────
export const bandAlerts = pgTable("band_alerts", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),                         // Full alert text
  alertType: varchar("alertType", { length: 64 }).default("recruiting"), // 'recruiting' | 'vacancy' | 'custom'
  isActive: boolean("isActive").default(true).notNull(),      // Toggle visibility on homepage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type BandAlert = typeof bandAlerts.$inferSelect;
export type InsertBandAlert = typeof bandAlerts.$inferInsert;
