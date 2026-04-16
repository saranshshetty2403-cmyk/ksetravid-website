/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KSETRAVID — ADMIN AUTHENTICATION (JWT)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This module handles ONLY JWT signing and verification for the admin panel.
 * It does NOT store usernames or passwords — that is handled by server/db.ts
 * using the Neon Postgres database (no filesystem operations, Vercel-compatible).
 *
 * ── HOW THE ADMIN LOGIN FLOW WORKS ──────────────────────────────────────────
 * 1. Admin visits /admin/login and submits username + password.
 * 2. server/routers.ts → admin.login procedure calls verifyAdminCredentials()
 *    from server/db.ts, which checks the hashed password in the database.
 * 3. If valid, signAdminJWT() creates a signed JWT and sets it as an
 *    httpOnly cookie named "ksetravid_admin_session".
 * 4. Every subsequent request to an adminProcedure reads the cookie and calls
 *    verifyAdminJWT() to confirm the session is still valid.
 * 5. The JWT expires after 7 days. Logging out clears the cookie.
 *
 * ── DEFAULT CREDENTIALS ─────────────────────────────────────────────────────
 * Username: ksetravid
 * Password: Loudbox2026
 * These are seeded into the database on first run (see server/seed.ts).
 * Change them via Admin Dashboard → Credentials after first login.
 *
 * ── REQUIRED ENV VAR ────────────────────────────────────────────────────────
 * JWT_SECRET — at least 32 random characters. Used to sign/verify the JWT.
 * Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * ── COMPATIBILITY ────────────────────────────────────────────────────────────
 * Uses the "jose" library (Web Crypto API) — works in Vercel Edge, Node.js,
 * Cloudflare Workers, and any serverless environment (no native bindings).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

// The name of the cookie that stores the admin session JWT.
// Must match what the login/logout procedures set/clear in server/routers.ts.
export const ADMIN_COOKIE = "ksetravid_admin_session";

// ── JWT helpers ───────────────────────────────────────────────────────────────

/**
 * Reads JWT_SECRET from env and converts it to a Uint8Array for use with jose.
 * Throws a clear error if the secret is missing or too short (< 16 chars).
 */
function getJwtSecret(): Uint8Array {
  const s = ENV.cookieSecret;
  if (!s || s.length < 16) throw new Error("JWT_SECRET env var is too short or missing");
  return new TextEncoder().encode(s);
}

/**
 * Signs a new admin JWT with role="admin" and a 7-day expiry.
 * Called after a successful username/password check in the login procedure.
 * Returns the signed JWT string that gets stored in the session cookie.
 */
export async function signAdminJWT(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

/**
 * Verifies a JWT from the session cookie.
 * Returns true only if the token is valid, not expired, and has role="admin".
 * Returns false for any error (expired, tampered, wrong secret, etc.).
 * Called by the adminProcedure middleware in server/routers.ts on every request.
 */
export async function verifyAdminJWT(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === "admin";
  } catch {
    // Any verification failure (expired, invalid signature, etc.) returns false.
    return false;
  }
}
