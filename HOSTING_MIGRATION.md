# Ksetravid — Hosting Migration Guide

This document is written for any developer or hosting provider who needs to deploy or migrate the Ksetravid website to a new server or cloud platform. It covers every dependency, environment variable, database step, file storage consideration, and deployment configuration required to get the site running from scratch.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Database Setup (Neon Postgres)](#4-database-setup-neon-postgres)
5. [File Storage Setup](#5-file-storage-setup)
6. [Payment Gateway Setup (Razorpay)](#6-payment-gateway-setup-razorpay)
7. [Admin Panel Access](#7-admin-panel-access)
8. [Deployment: Vercel (Recommended)](#8-deployment-vercel-recommended)
9. [Deployment: Railway](#9-deployment-railway)
10. [Deployment: Render](#10-deployment-render)
11. [Deployment: VPS / Docker](#11-deployment-vps--docker)
12. [Post-Deployment Checklist](#12-post-deployment-checklist)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Architecture Overview

The Ksetravid website is a full-stack TypeScript application with the following components.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 | Public website (all sections) |
| Backend | Express 4 + tRPC 11 | API server, admin procedures |
| Database | Neon Postgres (serverless) | All persistent data |
| File Storage | Cloud storage (CDN) | Images, QR codes, member photos |
| Auth (Admin) | JWT + SHA-256 | Admin panel session |
| Auth (Users) | OAuth (optional) | End-user login (not required) |
| Payments | Razorpay + manual UPI | Merchandise checkout |

The frontend and backend are built into a single deployable artifact. In production, Express serves the compiled React SPA and handles all `/api/trpc/*` requests. On Vercel, the backend runs as a serverless function.

---

## 2. Prerequisites

Before deploying, ensure you have the following accounts and tools set up.

| Requirement | Purpose | Where to Get It |
|---|---|---|
| Node.js 22+ | Build and run the app | [nodejs.org](https://nodejs.org) |
| pnpm | Package manager | `npm install -g pnpm` |
| Neon account | Postgres database | [neon.tech](https://neon.tech) |
| Cloud storage | File uploads (images) | See Section 5 |
| Razorpay account | Payment processing | [razorpay.com](https://razorpay.com) (optional) |
| Git | Source code | [git-scm.com](https://git-scm.com) |

Clone the repository and install dependencies before proceeding:

```bash
git clone https://github.com/saranshshetty2403-cmyk/ksetravid.git
cd ksetravid
pnpm install
```

---

## 3. Environment Variables Reference

All environment variables must be set on your hosting platform before the first deployment. The table below lists every variable, whether it is required, and what it does.

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **YES** | Signs admin session cookies. Must be at least 32 random characters. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `KSETRAVID_DB_URL` | **YES** | Neon Postgres connection string. Format: `postgresql://user:pass@host/db?sslmode=require` |
| `KSETRAVID_RAZORPAY_KEY_ID` | Optional | Razorpay Key ID (from Razorpay Dashboard → API Keys). If empty, the site falls back to manual UPI-only checkout. |
| `KSETRAVID_RAZORPAY_KEY_SECRET` | Optional | Razorpay Key Secret. Required if Key ID is set. |
| `VITE_RAZORPAY_KEY_ID` | Optional | Same as `KSETRAVID_RAZORPAY_KEY_ID` but exposed to the frontend. Must match. |
| `BUILT_IN_FORGE_API_URL` | See Section 5 | Base URL of the file storage proxy. Replace with your own S3 endpoint if migrating away from the current storage. |
| `BUILT_IN_FORGE_API_KEY` | See Section 5 | Bearer token for the file storage proxy. |
| `VITE_APP_ID` | Optional | OAuth application ID. Only needed if Manus end-user login is kept. |
| `OAUTH_SERVER_URL` | Optional | OAuth backend URL. Only needed if Manus end-user login is kept. |
| `OWNER_OPEN_ID` | Optional | Manus owner ID. Only needed if Manus end-user login is kept. |
| `NODE_ENV` | Auto | Set to `production` automatically by all major hosting platforms. |

> **Minimum viable set for a working deployment:** `JWT_SECRET` and `KSETRAVID_DB_URL`. Everything else is optional or can be added later.

---

## 4. Database Setup (Neon Postgres)

The application uses Neon Postgres, a serverless Postgres provider that works in both Node.js and serverless (Vercel, Cloudflare) environments. Neon has a generous free tier suitable for production use.

### Step 1 — Create a Neon Project

Go to [neon.tech](https://neon.tech), create a free account, and create a new project. Name it `ksetravid` or any name you prefer. Select the region closest to your users (e.g. `ap-southeast-1` for India).

### Step 2 — Get the Connection String

In the Neon dashboard, navigate to your project and click **Connection Details**. Copy the **Connection string** — it looks like this:

```
postgresql://ksetravid_owner:abc123@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/ksetravid?sslmode=require
```

Set this as `KSETRAVID_DB_URL` in your hosting platform's environment variables.

### Step 3 — Run the Database Migration

With `KSETRAVID_DB_URL` set in your local `.env` file, run:

```bash
pnpm db:push
```

This command runs `drizzle-kit generate` (creates SQL migration files in `drizzle/migrations/`) and then `drizzle-kit migrate` (applies them to Neon). All tables are created automatically from `drizzle/schema.ts`.

You do **not** need to write any SQL manually. The schema file defines every table — see `drizzle/schema.ts` for the full annotated structure.

### Step 4 — Seed Initial Data

The application seeds itself automatically on first startup. When the server starts and detects empty tables, `server/seed.ts` inserts:

- 16 site image slots (with default CDN URLs)
- 5 initial tour dates
- 8 merch products (Berserker, Nomad, Ouroboros collections)
- UPI settings (default: `nikhilraj2110@oksbi`)
- Default admin credentials (see Section 7)

No manual seeding step is required.

### Switching Database Providers

The app uses Drizzle ORM with the `@neondatabase/serverless` driver. To switch to a different Postgres provider (Supabase, PlanetScale, Railway Postgres, etc.):

1. Open `server/db.ts` and replace the `neon()` client with the appropriate driver.
2. Update `drizzle.config.ts` to point to the new connection string variable.
3. Run `pnpm db:push` against the new database.

---

## 5. File Storage Setup

All uploaded images (site images, member photos, merch photos, UPI QR codes) are stored in a cloud storage bucket. The URL returned by the upload is saved to the database and served directly to users via CDN.

### Current Implementation

The current `server/storage.ts` uses a storage proxy that requires `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`. **These credentials are tied to the current hosting platform and will not work on a new host.**

### Replacing with AWS S3

This is the recommended replacement for any production host. Install the AWS SDK:

```bash
pnpm add @aws-sdk/client-s3
```

Then replace the contents of `server/storage.ts` with the following. The rest of the codebase will continue to work unchanged because only `storagePut` and `storageGet` are exported.

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const hash = Math.random().toString(36).slice(2, 10);
  const key = relKey.replace(/(\.[^.]+)$/, `_${hash}$1`);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: data as Buffer,
    ContentType: contentType,
  }));
  // If the bucket is public, use this URL directly:
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: relKey }), { expiresIn: 3600 });
  return { key: relKey, url };
}
```

Add these environment variables to your host:

| Variable | Value |
|---|---|
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | From AWS IAM |
| `S3_BUCKET` | Your S3 bucket name |

### Replacing with Cloudflare R2

Cloudflare R2 is S3-compatible and has no egress fees, making it ideal for image-heavy sites. Use the same S3 code above with these changes:

```typescript
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

For public bucket access, configure a custom domain in the R2 dashboard and use that as the CDN URL base.

### Replacing with Supabase Storage

```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { data: result, error } = await supabase.storage
    .from("ksetravid-assets")
    .upload(relKey, data, { contentType, upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("ksetravid-assets").getPublicUrl(relKey);
  return { key: relKey, url: publicUrl };
}
```

---

## 6. Payment Gateway Setup (Razorpay)

The checkout supports two modes that are selected automatically based on whether Razorpay keys are present.

| Mode | Condition | Behaviour |
|---|---|---|
| **Razorpay** (automatic) | `KSETRAVID_RAZORPAY_KEY_ID` and `KSETRAVID_RAZORPAY_KEY_SECRET` are set | Customer pays via Razorpay widget; order is confirmed automatically on payment success. |
| **Manual UPI** (fallback) | Keys are empty or not set | Customer is shown the UPI ID and QR code; they enter their UTR number; admin verifies manually. |

### Setting Up Razorpay

1. Create an account at [razorpay.com](https://razorpay.com).
2. Go to **Settings → API Keys** and generate a new key pair.
3. Set `KSETRAVID_RAZORPAY_KEY_ID` and `KSETRAVID_RAZORPAY_KEY_SECRET` on your host.
4. Set `VITE_RAZORPAY_KEY_ID` to the same value as `KSETRAVID_RAZORPAY_KEY_ID` (this is the public key exposed to the browser).

> The Key ID (starts with `rzp_live_` or `rzp_test_`) is safe to expose to the frontend. The Key Secret must never be exposed — it is only used server-side to verify payment signatures.

### Updating UPI Details

UPI settings (ID, account name, QR code) are stored in the database and managed via **Admin Dashboard → UPI Settings**. No code changes are needed to update them.

---

## 7. Admin Panel Access

The admin panel is available at `/admin/login`. It uses a standalone username/password system that is completely independent of any OAuth provider.

### Default Credentials

| Field | Value |
|---|---|
| Username | `ksetravid` |
| Password | `Loudbox2026` |

These are seeded into the `admin_credentials` table on first startup. **Change them immediately after first login** via Admin Dashboard → Credentials.

### How the Session Works

After a successful login, the server creates a signed JWT (using `JWT_SECRET`) and stores it in an httpOnly cookie named `ksetravid_admin_session`. The cookie expires after 7 days. Every admin API request verifies this cookie server-side. There is no client-side token storage.

### Resetting the Admin Password

If you are locked out, connect to the Neon database directly (via the Neon SQL editor or `psql`) and run:

First generate the SHA-256 hash of your new password using Node.js:

```bash
node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('YourNewPassword' + 'ksetravid_salt_2026').digest('hex'));"
```

Then paste the output into the Neon SQL editor:

```sql
UPDATE admin_credentials SET "passwordHash" = '<paste_hash_here>' WHERE username = 'ksetravid';
```

Alternatively, delete the row and restart the server — the seed will recreate the default credentials.

---

## 8. Deployment: Vercel (Recommended)

Vercel is the recommended platform because the project already includes a `vercel.json` configuration file.

### Step 1 — Import the Repository

Go to [vercel.com](https://vercel.com), click **Add New Project**, and import the GitHub repository.

### Step 2 — Configure Build Settings

Vercel will detect the `vercel.json` automatically. Confirm these settings:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | `pnpm build` |
| Output Directory | `dist/public` |
| Install Command | `pnpm install` |

### Step 3 — Add Environment Variables

In the Vercel project settings, go to **Environment Variables** and add all variables from Section 3. At minimum:

```
JWT_SECRET          = <32+ random chars>
KSETRAVID_DB_URL    = postgresql://...
```

### Step 4 — Deploy

Click **Deploy**. Vercel will build the project and deploy it. The first deployment triggers the database seed automatically.

### Step 5 — Add a Custom Domain

In the Vercel project settings, go to **Domains** and add your custom domain. Follow Vercel's DNS instructions to point your domain to Vercel.

### How the Vercel Deployment Works

The `vercel.json` routes all `/api/trpc/*` requests to a serverless function at `api/trpc/handler.js`. All other routes serve the compiled React SPA from `dist/public/`. The SPA handles client-side routing via a catch-all fallback to `index.html`.

---

## 9. Deployment: Railway

Railway is a simple platform that runs the app as a long-running Node.js process (not serverless).

### Step 1 — Create a New Service

Go to [railway.app](https://railway.app), create a new project, and add a service from your GitHub repository.

### Step 2 — Configure the Service

In the service settings, set:

| Setting | Value |
|---|---|
| Build Command | `pnpm install && pnpm build` |
| Start Command | `node dist/index.js` |

### Step 3 — Add Environment Variables

In the service's **Variables** tab, add all variables from Section 3. Railway can also provision a Postgres database — if you use Railway Postgres instead of Neon, set `DATABASE_URL` (Railway injects this automatically for linked databases).

### Step 4 — Deploy

Push to your main branch or click **Deploy** in the Railway dashboard. Railway builds and starts the server automatically.

---

## 10. Deployment: Render

Render is similar to Railway and supports both web services and background workers.

### Step 1 — Create a Web Service

Go to [render.com](https://render.com), click **New Web Service**, and connect your GitHub repository.

### Step 2 — Configure the Service

| Setting | Value |
|---|---|
| Environment | Node |
| Build Command | `pnpm install && pnpm build` |
| Start Command | `node dist/index.js` |

### Step 3 — Add Environment Variables

In the **Environment** tab, add all variables from Section 3.

### Step 4 — Deploy

Render deploys automatically on every push to the connected branch.

---

## 11. Deployment: VPS / Docker

For a VPS (DigitalOcean, Hetzner, Linode, etc.) or a Docker-based deployment, use the following approach.

### Manual VPS Deployment

```bash
# 1. Clone the repository on the server
git clone https://github.com/saranshshetty2403-cmyk/ksetravid.git
cd ksetravid

# 2. Install dependencies
pnpm install

# 3. Create a .env file with all required variables (never commit this file)
cat > .env << EOF
JWT_SECRET=your_32_char_secret_here
KSETRAVID_DB_URL=postgresql://user:pass@host/db?sslmode=require
NODE_ENV=production
EOF

# 4. Build the project
pnpm build

# 5. Run database migrations
pnpm db:push

# 6. Start the server
node dist/index.js
```

Use a process manager like PM2 to keep the server running:

```bash
npm install -g pm2
pm2 start dist/index.js --name ksetravid
pm2 save
pm2 startup
```

### Nginx Reverse Proxy (Recommended for VPS)

Place Nginx in front of the Node.js server to handle SSL termination and serve static files efficiently.

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Serve compiled static files directly (faster than Node.js)
    location / {
        root /path/to/ksetravid/dist/public;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Use Certbot to get a free SSL certificate: `certbot --nginx -d yourdomain.com`.

### Docker

A basic `Dockerfile` for containerised deployment:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t ksetravid .
docker run -p 3000:3000 \
  -e JWT_SECRET=your_secret \
  -e KSETRAVID_DB_URL=postgresql://... \
  ksetravid
```

---

## 12. Post-Deployment Checklist

After deploying to a new host, verify each item below before going live.

| Step | What to Check |
|---|---|
| Homepage loads | Visit the root URL and confirm all sections render correctly |
| Admin login | Visit `/admin/login`, log in with default credentials, change password immediately |
| Database seeded | Admin Dashboard → Tour Dates, Merch, Images should all show initial data |
| Image uploads | Admin Dashboard → Image Manager → upload a test image and confirm it appears on the site |
| Merch checkout | Add a product to cart, go through checkout, confirm order appears in Admin Dashboard → Orders |
| Razorpay (if used) | Complete a test payment using Razorpay test keys (`rzp_test_*`) |
| Alert toggle | Admin Dashboard → Band Members → toggle the alert ON and confirm it appears on the homepage |
| Mobile layout | Check the site on a mobile device or browser DevTools |
| SSL certificate | Confirm the site loads over HTTPS with a valid certificate |
| Custom domain | Confirm DNS is pointing to the new host and the domain resolves correctly |

---

## 13. Troubleshooting

**The site loads but the admin panel shows "Unauthorized"**
The `JWT_SECRET` env var is either missing or different from the one used when the session cookie was issued. Set `JWT_SECRET` correctly and log in again.

**Database connection errors on startup**
Check that `KSETRAVID_DB_URL` is set correctly and includes `?sslmode=require` at the end. Neon requires SSL. Test the connection string with `psql "$KSETRAVID_DB_URL"` from your local machine.

**Image uploads fail with "Storage proxy credentials missing"**
`BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` are not set. If you have migrated to AWS S3 or another provider, replace `server/storage.ts` as described in Section 5.

**Checkout shows "Razorpay not configured" or falls back to manual UPI unexpectedly**
Check that both `KSETRAVID_RAZORPAY_KEY_ID` and `KSETRAVID_RAZORPAY_KEY_SECRET` are set. Also check that `VITE_RAZORPAY_KEY_ID` matches the Key ID (it must be set at build time — if you add it after building, rebuild the project).

**The site shows a blank page after deployment**
The React SPA requires a catch-all route that serves `index.html` for all non-API paths. On Vercel this is handled by `vercel.json`. On Nginx use `try_files $uri /index.html`. On Railway/Render the Express server handles this automatically.

**`pnpm db:push` fails with "relation already exists"**
The migration has already been applied. This is safe to ignore. If you need a clean slate, drop all tables in Neon and run `pnpm db:push` again (this will also delete all data).

**Admin password forgotten**
Connect to Neon via the SQL editor and run:
```sql
DELETE FROM admin_credentials;
```
Then restart the server — the seed will recreate the default credentials (`ksetravid` / `Loudbox2026`).
