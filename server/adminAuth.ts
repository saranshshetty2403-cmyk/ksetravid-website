/**
 * KSETRAVID ADMIN AUTH
 * ─────────────────────────────────────────────────────────────────────────────
 * Credentials are stored in a JSON file on the server filesystem.
 * This makes the system completely portable — it works on any host,
 * with or without a database, with or without Manus.
 *
 * File location: <project_root>/data/admin-credentials.json
 *
 * Security guarantees:
 *  1. Passwords are stored as HMAC-SHA256 hashes — never plaintext.
 *  2. seedInitialCredentials() is a no-op if the file already exists.
 *  3. replaceCredentials() ALWAYS overwrites the file completely.
 *     Old username + password stop working the instant this is called.
 *  4. verifyLogin() reads ONLY from the file — no hardcoded fallback.
 *  5. JWT tokens are signed with JWT_SECRET env var.
 *  6. Tokens expire in 7 days; logout clears the cookie.
 */

import { createHmac } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ENV } from "./_core/env";

// ── File path ─────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const CREDS_FILE = join(DATA_DIR, "admin-credentials.json");

export const ADMIN_COOKIE = "ksetravid_admin_session";
const HMAC_KEY = "ksetravid_hmac_key_v1_immutable";

// ── Password Hashing ──────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return createHmac("sha256", HMAC_KEY).update(password).digest("hex");
}

// ── File I/O ──────────────────────────────────────────────────────────────────

interface CredentialsFile {
  username: string;
  passwordHash: string;
  updatedAt: string;
}

function readCredsFile(): CredentialsFile | null {
  try {
    if (!existsSync(CREDS_FILE)) return null;
    const raw = readFileSync(CREDS_FILE, "utf-8");
    return JSON.parse(raw) as CredentialsFile;
  } catch (err) {
    console.error("[AdminAuth] Failed to read credentials file:", err);
    return null;
  }
}

function writeCredsFile(username: string, passwordHash: string): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const payload: CredentialsFile = {
    username,
    passwordHash,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[AdminAuth] Credentials file written. Username: ${username}`);
}

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

// ── Credential Management ─────────────────────────────────────────────────────

/**
 * Seeds the FIRST-TIME credentials.
 * If the credentials file already exists, this is a complete no-op.
 * The existing credentials are NEVER touched.
 */
export function seedInitialCredentials(username: string, password: string): void {
  if (existsSync(CREDS_FILE)) {
    // File exists — credentials have already been set. Do nothing.
    return;
  }
  writeCredsFile(username, hashPassword(password));
  console.log("[AdminAuth] Initial credentials seeded.");
}

/**
 * Verifies a login attempt against the credentials file ONLY.
 * No hardcoded fallback — if the file doesn't exist, login fails.
 */
export function verifyLogin(username: string, password: string): boolean {
  const creds = readCredsFile();
  if (!creds) {
    console.warn("[AdminAuth] No credentials file found — login rejected.");
    return false;
  }
  return creds.username === username && creds.passwordHash === hashPassword(password);
}

/**
 * Permanently replaces ALL credentials.
 * After this call, the old username and password are gone forever.
 * Every future login must use the new credentials.
 */
export function replaceCredentials(newUsername: string, newPassword: string): void {
  writeCredsFile(newUsername, hashPassword(newPassword));
  console.log(`[AdminAuth] Credentials permanently replaced. New username: ${newUsername}`);
}

/**
 * Returns the current username (never the hash).
 */
export function getCurrentUsername(): string | null {
  const creds = readCredsFile();
  return creds?.username ?? null;
}
