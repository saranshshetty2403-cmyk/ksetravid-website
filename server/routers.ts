import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getTourDates, upsertTourDate, deleteTourDate,
  getSiteImages, upsertSiteImage,
  getMerchProducts, upsertMerchProduct, deleteMerchProduct,
  getUpiSettings, saveUpiSettings,
  seedAdminCredentials, verifyAdminCredentials,
  updateAdminCredentials, getCurrentAdminUsername,
  createOrder, getOrders, updateOrderStatus, generateTxnRef,
} from "./db";
import { ADMIN_COOKIE, signAdminJWT, verifyAdminJWT } from "./adminAuth";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { seedDatabase } from "./seed";

// Seed default credentials on startup (no-op if already seeded in DB)
seedAdminCredentials("ksetravid", "Loudbox2026").catch(err =>
  console.error("[AdminAuth] Seed failed:", err)
);

// Seed all initial hardcoded data into DB on first run (idempotent)
seedDatabase().catch(err => console.error("[Seed] Failed:", err));

// ── Admin guard middleware ─────────────────────────────────────────────────────
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.[ADMIN_COOKIE];
  if (!token || !(await verifyAdminJWT(token))) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin login required" });
  }
  return next({ ctx });
});

function getSecureCookieOptions(req: any) {
  const isSecure =
    req.protocol === "https" ||
    req.headers?.["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
}

export const appRouter = router({
  system: systemRouter,

  // ── Standard auth (kept for system compatibility) ──────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSecureCookieOptions(ctx.req);
      ctx.res.clearCookie?.(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
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
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const valid = await verifyAdminCredentials(input.username, input.password);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }
        const token = await signAdminJWT();
        const opts = getSecureCookieOptions(ctx.req);
        ctx.res.cookie?.(ADMIN_COOKIE, token, {
          ...opts,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    getUsername: adminProcedure.query(async () => {
      const username = await getCurrentAdminUsername();
      return { username: username ?? "ksetravid" };
    }),

    /**
     * Permanently replace credentials in the DB.
     * After this call, the old username + password are gone forever.
     * The next login MUST use the new credentials.
     */
    updateCredentials: adminProcedure
      .input(z.object({
        newUsername: z.string().min(3, "Username must be at least 3 characters"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      }))
      .mutation(async ({ input }) => {
        await updateAdminCredentials(input.newUsername, input.newPassword);
        return { success: true };
      }),
  }),

  // ── Tour Dates ──────────────────────────────────────────────────────────────
  tour: router({
    list: publicProcedure.query(() => getTourDates()),

    save: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        date: z.string().min(1),
        city: z.string().min(1),
        venue: z.string().min(1),
        country: z.string().default("India"),
        ticketUrl: z.string().nullable().optional(),
        isSoldOut: z.boolean().default(false),
        isPast: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }))
      .mutation(({ input }) => upsertTourDate(input)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTourDate(input.id)),
  }),

  // ── Site Images ─────────────────────────────────────────────────────────────
  images: router({
    list: publicProcedure.query(() => getSiteImages()),

    update: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        key: z.string().min(1),
        label: z.string().min(1),
        section: z.string().min(1),
        url: z.string().url(),
        altText: z.string().optional(),
      }))
      .mutation(({ input }) => upsertSiteImage(input)),
  }),

  // ── Merch Products ──────────────────────────────────────────────────────────
  merch: router({
    list: publicProcedure.query(() => getMerchProducts()),

    save: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        category: z.string().min(1),
        price: z.number().min(0),
        imageUrl: z.string().url(),
        description: z.string().optional().nullable(),
        sizes: z.string(),
        tags: z.string(),
        collectionTag: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
        shopifyUrl: z.string().optional().nullable(),
      }))
      .mutation(({ input }) => upsertMerchProduct(input)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteMerchProduct(input.id)),
  }),

  // ── UPI Settings ────────────────────────────────────────────────────────────
  upi: router({
    get: publicProcedure.query(() => getUpiSettings()),

    save: adminProcedure
      .input(z.object({
        upiId: z.string().min(1),
        accountName: z.string().min(1),
        qrCodeUrl: z.string().url().optional().nullable(),
        whatsappNumber: z.string().optional().nullable(),
      }))
      .mutation(({ input }) => saveUpiSettings(input)),
  }),

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    // Public: create a new order (called from checkout form)
    create: publicProcedure
      .input(z.object({
        buyerName: z.string().min(1),
        buyerPhone: z.string().min(10),
        buyerEmail: z.string().email().optional().nullable(),
        addressLine1: z.string().min(1),
        addressLine2: z.string().optional().nullable(),
        city: z.string().min(1),
        state: z.string().min(1),
        pincode: z.string().min(4),
        productId: z.number(),
        productName: z.string().min(1),
        productCategory: z.string().min(1),
        selectedSize: z.string().optional().nullable(),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0),
        totalAmount: z.number().min(0),
        upiId: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const txnRef = generateTxnRef();
        const order = await createOrder({ ...input, txnRef });
        return { id: order.id, txnRef: order.txnRef };
      }),

    // Admin: list all orders
    list: adminProcedure.query(() => getOrders()),

    // Admin: update order status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        paymentStatus: z.enum(["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(({ input }) => updateOrderStatus(input.id, input.paymentStatus, input.adminNotes)),
  }),

  // ── File Upload (base64 → S3 CDN) ───────────────────────────────────────────
  upload: router({
    uploadFile: adminProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().default("admin-uploads"),
      }))
      .mutation(async ({ input }) => {
        const ext = input.filename.split(".").pop() ?? "bin";
        const key = `${input.folder}/${nanoid(12)}.${ext}`;
        const buffer = Buffer.from(input.base64, "base64");
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url, key };
      }),
  }),
});

export type AppRouter = typeof appRouter;
