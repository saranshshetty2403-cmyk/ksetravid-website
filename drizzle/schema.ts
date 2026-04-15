import { boolean, int, mysqlTable, text, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";

// ── Users (Manus OAuth — kept for system compatibility) ──────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Admin Credentials (custom username/password auth) ────────────────────────
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdminCredentials = typeof adminCredentials.$inferSelect;

// ── Tour Dates ────────────────────────────────────────────────────────────────
export const tourDates = mysqlTable("tour_dates", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 32 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  venue: varchar("venue", { length: 256 }).notNull(),
  country: varchar("country", { length: 64 }).default("India").notNull(),
  ticketUrl: text("ticketUrl"),
  isSoldOut: boolean("isSoldOut").default(false).notNull(),
  isPast: boolean("isPast").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TourDate = typeof tourDates.$inferSelect;
export type InsertTourDate = typeof tourDates.$inferInsert;

// ── Site Images ───────────────────────────────────────────────────────────────
export const siteImages = mysqlTable("site_images", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 256 }).notNull(),
  section: varchar("section", { length: 64 }).notNull(),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 256 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteImage = typeof siteImages.$inferSelect;
export type InsertSiteImage = typeof siteImages.$inferInsert;

// ── Merch Products ────────────────────────────────────────────────────────────
export const merchProducts = mysqlTable("merch_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  price: int("price").notNull(),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
  sizes: text("sizes").notNull(),
  tags: text("tags").notNull(),
  collectionTag: varchar("collectionTag", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  shopifyUrl: text("shopifyUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MerchProduct = typeof merchProducts.$inferSelect;
export type InsertMerchProduct = typeof merchProducts.$inferInsert;

// ── UPI Settings ──────────────────────────────────────────────────────────────
export const upiSettings = mysqlTable("upi_settings", {
  id: int("id").autoincrement().primaryKey(),
  upiId: varchar("upiId", { length: 128 }).notNull(),
  accountName: varchar("accountName", { length: 128 }).notNull(),
  qrCodeUrl: text("qrCodeUrl"),
  whatsappNumber: varchar("whatsappNumber", { length: 32 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UpiSettings = typeof upiSettings.$inferSelect;
export type InsertUpiSettings = typeof upiSettings.$inferInsert;
