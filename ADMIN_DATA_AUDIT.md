# Ksetravid Admin Dashboard — Complete Data & Control Audit

## What the Database Stores & What the Admin Can Change

---

## 1. `site_images` — All Website Images

Every image on the website is stored here by a unique `key`. The admin can replace any image by uploading a new file from their phone or PC.

| Key | Label | Section | Current Use |
|-----|-------|---------|-------------|
| `hero_bg` | Hero Background | Hero | Full-bleed background behind hero text |
| `hero_band_photo` | Hero Band Photo | Hero | Band photo on the right side of hero |
| `logo` | Logo | Global | Navbar logo + hero logo + contact footer |
| `about_bg` | About Background | About | Background texture behind bio section |
| `about_band_outdoor` | Band Photo (Outdoor) | About | Left photo in About section grid |
| `about_band_bw` | Band Photo (B&W) | About | Right photo in About section grid |
| `gallery_1` through `gallery_6` | Gallery Photos 1–6 | Gallery | Photo grid in Gallery section |
| `tour_bg` | Tour Background | Tour | Background image behind tour dates |

**Total: ~14 images controllable from the dashboard**

---

## 2. `merch_products` — Merch Store Products

Every product in the shop. The admin can add, edit, or remove products.

| Field | What It Controls |
|-------|-----------------|
| `name` | Product name (e.g. "Anamnesis — Regular Tee") |
| `category` | Filter tab it appears under (tees / tanks / shorts / crop-tops / hoodies / etc.) |
| `price` | Price in INR |
| `imageUrl` | Product photo — upload from device |
| `description` | Full product description text |
| `sizes` | Available sizes (e.g. S, M, L, XL, 2XL or 28, 30, 32) |
| `tags` | Searchable tags (e.g. "graphic, black, summer") |
| `collectionTag` | Collection name (Anamnesis / Berserker / Nomad / Ouroboros / new ones) |
| `isActive` | Show or hide the product on the website |
| `sortOrder` | Display order in the grid |
| `shopifyUrl` | Optional Shopify link for the product |

**Current products: 9 (all seeded from existing hardcoded data)**

---

## 3. `tour_dates` — Live & Upcoming Shows

All tour dates shown on the website. The admin can add, edit, or delete shows.

| Field | What It Controls |
|-------|-----------------|
| `date` | Show date (e.g. "15 Mar 2025") |
| `city` | City name |
| `venue` | Venue name |
| `country` | Country (default: India) |
| `ticketUrl` | Link to buy tickets (optional) |
| `isSoldOut` | Shows "SOLD OUT" badge |
| `isPast` | Moves the show to the Past Shows section |
| `sortOrder` | Display order |

---

## 4. `upi_settings` — Payment / Checkout

Controls the UPI payment details shown in the Merch checkout modal.

| Field | What It Controls |
|-------|-----------------|
| `upiId` | UPI ID (e.g. nikhilraj2110@oksbi) |
| `accountName` | Account holder name (e.g. T R Nikhil) |
| `qrCodeUrl` | QR code image — upload from device |

---

## 5. `admin_credentials` (file-based, not in DB)

Stored in `server/data/admin-credentials.json` — completely independent of any database or hosting platform.

| Field | What It Controls |
|-------|-----------------|
| `username` | Admin login username |
| `passwordHash` | HMAC-SHA256 hash of the password |

**Rule:** Once changed, old credentials are permanently gone. No fallback.

---

## What Is NOT in the Database (Static / Hardcoded)

These items are part of the band's identity and are not expected to change frequently. They can be added to the DB in a future update if needed:

- Band bio text (About section)
- Member names, roles, and descriptions
- Social media links (Instagram, YouTube, Spotify, etc.)
- Music releases (Anamnesis, Third Eye, etc.) and their Spotify/Bandcamp/YouTube links
- Press features (The Hindu, Rolling Stone India, etc.)
- Videos section (YouTube embed IDs)
- WhatsApp number for merch order confirmation
- Lyrics / Themes section content

---

## Summary Table

| Dashboard Section | DB Table | Records |
|-------------------|----------|---------|
| Image Manager | `site_images` | ~14 images |
| Merch Products | `merch_products` | 9+ products |
| Tour Dates | `tour_dates` | Unlimited |
| UPI / Payment | `upi_settings` | 1 row |
| Admin Credentials | File: `data/admin-credentials.json` | 1 row |
