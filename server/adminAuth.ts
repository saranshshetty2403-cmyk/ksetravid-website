/**
 * KSETRAVID ADMIN AUTH — JWT only
 * ─────────────────────────────────────────────────────────────────────────────
 * This module handles ONLY JWT signing and verification.
 * Credential storage (username/password hash) is handled by server/db.ts
 * using the Neon Postgres database — no filesystem operations.
 *
 * This makes the module compatible with Vercel serverless (read-only filesystem).
 */

import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

export const ADMIN_COOKIE = "ksetravid_admin_session";

// ── JWT ───────────────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const s = ENV.cookieSecret;
  if (!s || s.length < 16) throw new Error("JWT_SECRET env var is too short or missing");
  return new TextEncoder().encode(s);
}

export async function signAdminJWT(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAdminJWT(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
