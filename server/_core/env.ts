/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KSETRAVID — ENVIRONMENT VARIABLES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the SINGLE SOURCE OF TRUTH for all environment variables used
 * by the server. Every env var the app needs is read here and exported as a
 * typed object. Never read process.env directly in other files — always import
 * from this module so it is easy to see what the app requires at a glance.
 *
 * ── HOW TO SET THESE ON A NEW HOST ──────────────────────────────────────────
 *   Vercel  → Project → Settings → Environment Variables
 *   Railway → Project → Variables
 *   Render  → Service → Environment
 *   VPS     → Create a .env file in the project root (never commit it to git)
 *
 * See HOSTING_MIGRATION.md in the project root for the full migration checklist.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const ENV = {
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
  // BUILT_IN_FORGE_API_URL — base URL of the Manus storage proxy (server-side)
  // BUILT_IN_FORGE_API_KEY — bearer token for the storage proxy (server-side)
  //
  // Multiple fallback names are checked in priority order:
  //   1. KSETRAVID_FORGE_API_URL / KSETRAVID_FORGE_API_KEY  (explicit project-specific override)
  //   2. BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY    (auto-injected by the platform)
  //   3. VITE_FRONTEND_FORGE_API_URL / VITE_FRONTEND_FORGE_API_KEY  (frontend variant, same value)
  //
  // This multi-fallback ensures uploads work even if one env var name changes.
  //
  // ⚠️  IMPORTANT FOR MIGRATION:
  // When moving to a different host you MUST replace server/storage.ts with a direct
  // AWS S3 or Cloudflare R2 implementation. See HOSTING_MIGRATION.md → "File Storage".
  forgeApiUrl:
    process.env.KSETRAVID_FORGE_API_URL ||
    process.env.BUILT_IN_FORGE_API_URL ||
    process.env.VITE_FRONTEND_FORGE_API_URL ||
    "",
  forgeApiKey:
    process.env.KSETRAVID_FORGE_API_KEY ||
    process.env.BUILT_IN_FORGE_API_KEY ||
    process.env.VITE_FRONTEND_FORGE_API_KEY ||
    "",
};
