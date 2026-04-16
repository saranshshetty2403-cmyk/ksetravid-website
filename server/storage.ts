/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KSETRAVID — FILE STORAGE (IMAGE UPLOADS)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This module handles all file uploads (site images, merch photos, member
 * photos, UPI QR codes). Files are uploaded to a cloud storage bucket and
 * the returned public CDN URL is saved to the database.
 *
 * ── CURRENT IMPLEMENTATION ──────────────────────────────────────────────────
 * Uses the Manus-hosted storage proxy (BUILT_IN_FORGE_API_URL + KEY).
 * The proxy wraps an S3-compatible bucket and returns public CDN URLs.
 * This works automatically on the Manus platform with no extra setup.
 *
 * ── MIGRATION: REPLACING WITH YOUR OWN STORAGE ──────────────────────────────
 * When moving to a different host (Vercel, Railway, VPS, etc.) you MUST
 * replace this file with a direct S3 / Cloudflare R2 / Supabase Storage
 * implementation. The rest of the codebase only calls two functions:
 *
 *   storagePut(key, data, contentType) → { key, url }
 *   storageGet(key)                    → { key, url }
 *
 * So you only need to rewrite those two exported functions. Everything else
 * (DB, routers, admin dashboard) will continue to work unchanged.
 *
 * ── AWS S3 REPLACEMENT EXAMPLE ──────────────────────────────────────────────
 * Install: pnpm add @aws-sdk/client-s3
 *
 *   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
 *   const s3 = new S3Client({ region: process.env.AWS_REGION });
 *
 *   export async function storagePut(key, data, contentType) {
 *     await s3.send(new PutObjectCommand({
 *       Bucket: process.env.S3_BUCKET,
 *       Key: key,
 *       Body: data,
 *       ContentType: contentType,
 *       ACL: "public-read",
 *     }));
 *     return { key, url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}` };
 *   }
 *
 * ── CLOUDFLARE R2 REPLACEMENT EXAMPLE ───────────────────────────────────────
 * R2 is S3-compatible. Use the same @aws-sdk/client-s3 with:
 *   endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`
 *   credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET }
 *
 * ── REQUIRED ENV VARS (current Manus implementation) ────────────────────────
 *   BUILT_IN_FORGE_API_URL — base URL of the Manus storage proxy
 *   BUILT_IN_FORGE_API_KEY — bearer token for the storage proxy
 *
 * See HOSTING_MIGRATION.md → "File Storage" for the full replacement guide.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ENV } from './_core/env';

type StorageConfig = { baseUrl: string; apiKey: string };

/**
 * Reads storage credentials from ENV and validates they are set.
 * Throws a descriptive error if missing (so the developer knows exactly what to set).
 */
function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

/** Builds the upload endpoint URL with the file path as a query param. */
function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

/** Calls the proxy's downloadUrl endpoint to get a presigned GET URL. */
async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

/** Strips leading slashes from a storage key to keep paths consistent. */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Appends a short random hash suffix to the filename portion of a key.
 * This prevents filename collisions when the same file is uploaded twice
 * (e.g. replacing a member photo with a new one of the same name).
 * Example: "band-members/pritam.jpg" → "band-members/pritam_a3f9c2b1.jpg"
 */
function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const segmentStart = relKey.lastIndexOf("/");
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1 || lastDot <= segmentStart) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/** Wraps raw bytes in a multipart FormData for the proxy's upload endpoint. */
function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Upload a file to cloud storage and return its public CDN URL.
 *
 * @param relKey     - Storage path, e.g. "band-members/pritam.jpg"
 *                     A random hash suffix is automatically appended to avoid collisions.
 * @param data       - File content as Buffer, Uint8Array, or string.
 * @param contentType - MIME type, e.g. "image/jpeg". Defaults to "application/octet-stream".
 * @returns          - { key: final storage path, url: public CDN URL }
 *
 * Usage in server/routers.ts:
 *   const { url } = await storagePut(`band-members/${nanoid(12)}.jpg`, buffer, "image/jpeg");
 *   // Save url to the database — this is what the frontend displays.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
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

/**
 * Get a presigned download URL for a file already in storage.
 * Useful if you need to serve a private file temporarily.
 * Note: most files in this app are public (CDN URLs), so this is rarely needed.
 *
 * @param relKey - Storage path, e.g. "band-members/pritam_a3f9c2b1.jpg"
 * @returns      - { key, url: presigned download URL }
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
