/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KSETRAVID — DATABASE SEEDER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file seeds all initial data into the database on first run.
 * It is called automatically by server/routers.ts on every server startup.
 * All seed operations are IDEMPOTENT — they check if data already exists
 * before inserting, so it is safe to restart the server multiple times.
 *
 * ── WHAT GETS SEEDED ───────────────────────────────────────────────────────────
 *   Tour Dates      — 4 initial past shows
 *   Site Images     — 16 image slots with default CDN URLs
 *   Merch Products  — 8 products across 4 collections
 *   UPI Settings    — Default UPI ID (nikhilraj2110@oksbi)
 *
 * ── ADMIN CREDENTIALS ──────────────────────────────────────────────────────────
 * Admin credentials are seeded separately by seedAdminCredentials() in db.ts.
 * Default: username=ksetravid, password=Loudbox2026
 * IMPORTANT: Change these immediately after first login via Admin Dashboard.
 *
 * ── MIGRATION NOTE ────────────────────────────────────────────────────────────
 * When migrating to a new host with an empty database:
 *   1. Set KSETRAVID_DB_URL to the new Postgres connection string
 *   2. Run: pnpm db:push  (creates all tables from drizzle/schema.ts)
 *   3. Start the server — this file runs automatically and fills the tables
 *   4. Log in at /admin/login with ksetravid / Loudbox2026
 *   5. Update credentials, UPI settings, images, and tour dates via the dashboard
 *
 * To preserve existing data from the old database, export it from Neon
 * (old project) and import into the new Neon project using pg_dump/pg_restore
 * or the Neon SQL editor. In that case, the seed will be a no-op (tables not empty).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  getDb,
  getTourDates,
  getSiteImages,
  getMerchProducts,
  getUpiSettings,
} from "./db";
import {
  tourDates,
  siteImages,
  merchProducts,
  upiSettings,
} from "../drizzle/schema";

// ── Site Images (all hardcoded CDN URLs) ──────────────────────────────────────
const INITIAL_IMAGES = [
  {
    key: "logo",
    label: "Logo",
    section: "Global",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png",
    altText: "Ksetravid logo",
  },
  {
    key: "hero_bg",
    label: "Hero Background",
    section: "Hero",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_hero_bg-PCFrUDfN4sN3ED5yRqYKQC.webp",
    altText: "Cosmic hero background",
  },
  {
    key: "hero_band_photo",
    label: "Hero Band Photo",
    section: "Hero",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png",
    altText: "Ksetravid band photo",
  },
  {
    key: "about_bg",
    label: "About Background",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_about_bg-mps2bmXs33M4MQ8C7eQV9t.webp",
    altText: "About section background",
  },
  {
    key: "about_band_outdoor",
    label: "Band Photo (Outdoor)",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg",
    altText: "Band outdoor photo",
  },
  {
    key: "about_band_bw",
    label: "Band Photo (B&W)",
    section: "About",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg",
    altText: "Band black and white photo",
  },
  {
    key: "gallery_1",
    label: "Gallery Photo 1",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png",
    altText: "Gallery photo 1",
  },
  {
    key: "gallery_2",
    label: "Gallery Photo 2",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg",
    altText: "Gallery photo 2",
  },
  {
    key: "gallery_3",
    label: "Gallery Photo 3",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg",
    altText: "Gallery photo 3",
  },
  {
    key: "gallery_4",
    label: "Gallery Photo 4",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_live_d9615956.jpg",
    altText: "Gallery photo 4",
  },
  {
    key: "gallery_5",
    label: "Gallery Photo 5",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_silhouette_03b6ba71.png",
    altText: "Gallery photo 5",
  },
  {
    key: "gallery_6",
    label: "Gallery Photo 6",
    section: "Gallery",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_anamnesis_ecc6e99c.jpg",
    altText: "Gallery photo 6",
  },
  {
    key: "tour_bg",
    label: "Tour Background",
    section: "Tour",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_tour_bg-G2r5A4Ci2qCwubZPq5aP54.webp",
    altText: "Tour section background",
  },
  {
    key: "member_pritam",
    label: "Pritam Middey (Guitars)",
    section: "Members",
    url: "",
    altText: "Pritam Middey — Guitars",
  },
  {
    key: "member_arunav",
    label: "Arunav Bhattacharjee (Bass)",
    section: "Members",
    url: "",
    altText: "Arunav Bhattacharjee — Bass",
  },
  {
    key: "member_nikhil",
    label: "Nikhil TR (Drums)",
    section: "Members",
    url: "",
    altText: "Nikhil TR — Drums",
  },
];

// ── Tour Dates ────────────────────────────────────────────────────────────────
const INITIAL_TOUR_DATES = [
  { date: "Jun 15, 2025", city: "Bangalore", venue: "TBA", country: "India", isSoldOut: false, isPast: true, sortOrder: 4 },
  { date: "Jun 8, 2025", city: "Kolkata", venue: "Top Cat", country: "India", isSoldOut: false, isPast: true, sortOrder: 3 },
  { date: "Jun 7, 2025", city: "Delhi", venue: "TBA", country: "India", isSoldOut: false, isPast: true, sortOrder: 2 },
  { date: "Jun 5, 2025", city: "Mumbai", venue: "Antisocial", country: "India", isSoldOut: false, isPast: true, sortOrder: 1 },
];

// ── Merch Products ────────────────────────────────────────────────────────────
const INITIAL_MERCH = [
  {
    name: "Anamnesis — Regular Tee",
    category: "tees",
    price: 1000,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg",
    sizes: "S,M,L,XL,2XL",
    tags: "Best Seller,graphic,black",
    collectionTag: "Anamnesis",
    description: "Unleash the essence of Ksetravid's Anamnesis with this exclusive graphic T-shirt, crafted by acclaimed artist Dipayan Das. Made for fans who live and breathe heavy music, this tee blends bold artwork with premium comfort — perfect for gigs, festivals, or everyday streetwear.",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Anamnesis — Tank Top",
    category: "tanks",
    price: 850,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tank_hd_b3f14fac.jpg",
    sizes: "S,L,XL,2XL,3XL",
    tags: "New,graphic,black",
    collectionTag: "Anamnesis",
    description: "A brutal, premium graphic tank top featuring exclusive Anamnesis artwork by Dipayan Das. Designed for fans who live and breathe heavy music. Lightweight, sleeveless cut — ideal for the pit.",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Berserker — Shorts",
    category: "shorts",
    price: 700,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_shorts_correct_cf0c28e8.png",
    sizes: "28,30,32,34,36",
    tags: "Limited,occult,black",
    collectionTag: "Berserker",
    description: "Berserker-series shorts featuring the signature Ksetravid occult artwork. Satin-finish black fabric with drawstring waist. The Berserker design channels ancient fury through modern streetwear.",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Berserker — Tank Top",
    category: "tanks",
    price: 800,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_tank_hd_afbe5844.png",
    sizes: "S,M,L,XL,2XL,3XL",
    tags: "New,occult,black",
    collectionTag: "Berserker",
    description: "The Berserker tank top brings the raw power of Ksetravid's occult-metal aesthetic to a sleeveless format. Heavyweight cotton blend, oversized fit, printed with the iconic Berserker artwork.",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Crop Top — She/Her",
    category: "crop-tops",
    price: 750,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_crop_top_hd_1e662d72.png",
    sizes: "XS,S,M,L,XL",
    tags: "She/Her,occult,fitted",
    collectionTag: "Berserker",
    description: "Ksetravid's first crop top — designed for she/her fans who want to carry the band's occult energy in a fitted silhouette. Features the Berserker artwork on premium stretch fabric.",
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Nomad — Shorts",
    category: "shorts",
    price: 700,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_shorts_hd_66199aa0.png",
    sizes: "28,30,32,34,36",
    tags: "Limited,serpent,black",
    collectionTag: "Nomad",
    description: "Nomad-series shorts with the Ksetravid logo and serpentine artwork. Satin-finish black with drawstring waist. The Nomad collection represents the wandering consciousness — unbound, untethered.",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Nomad — Tank Top",
    category: "tanks",
    price: 750,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_tank_hd_78506900.png",
    sizes: "S,M,L,XL,2XL,3XL",
    tags: "New,serpent,black",
    collectionTag: "Nomad",
    description: "The Nomad tank top — sleeveless, raw, and relentless. Featuring the serpent-and-eye motif from the Nomad collection. Lightweight cotton, perfect for summer shows and festival season.",
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Ouroboros & Meditate — Tee",
    category: "tees",
    price: 1000,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_ouroborus_tee_hd_b56f698d.jpg",
    sizes: "S,M,L,XL,3XL",
    tags: "Signature,philosophical,black",
    collectionTag: "Ouroboros",
    description: "The Ouroboros & Meditate tee is the most philosophical piece in the Ksetravid merch line. Two designs in one — the eternal serpent devouring itself, and a figure in deep meditation within a triangle. Rooted in the Upanishadic concept of the self as infinite.",
    isActive: true,
    sortOrder: 8,
  },
];

// ── UPI Settings ──────────────────────────────────────────────────────────────
const INITIAL_UPI = {
  upiId: "nikhilraj2110@oksbi",
  accountName: "T R Nikhil",
  qrCodeUrl: null as string | null,
};

// ── Main seed function ─────────────────────────────────────────────────────────
export async function seedDatabase(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Seed] Database not available — skipping seed");
    return;
  }

  try {
    // Seed site images (only if empty)
    const existingImages = await getSiteImages();
    if (existingImages.length === 0) {
      console.log("[Seed] Seeding site images...");
      await db.insert(siteImages).values(INITIAL_IMAGES);
      console.log(`[Seed] Inserted ${INITIAL_IMAGES.length} site images`);
    }

    // Seed tour dates (only if empty)
    const existingTour = await getTourDates();
    if (existingTour.length === 0) {
      console.log("[Seed] Seeding tour dates...");
      await db.insert(tourDates).values(INITIAL_TOUR_DATES);
      console.log(`[Seed] Inserted ${INITIAL_TOUR_DATES.length} tour dates`);
    }

    // Seed merch products (only if empty)
    const existingMerch = await getMerchProducts();
    if (existingMerch.length === 0) {
      console.log("[Seed] Seeding merch products...");
      await db.insert(merchProducts).values(INITIAL_MERCH);
      console.log(`[Seed] Inserted ${INITIAL_MERCH.length} merch products`);
    }

    // Seed UPI settings (only if empty)
    const existingUpi = await getUpiSettings();
    if (!existingUpi) {
      console.log("[Seed] Seeding UPI settings...");
      await db.insert(upiSettings).values(INITIAL_UPI);
      console.log("[Seed] UPI settings seeded");
    }

    console.log("[Seed] Database seed complete");
  } catch (err) {
    console.error("[Seed] Error during database seed:", err);
  }
}
