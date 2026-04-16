# Ksetravid Project TODO

## Admin Dashboard (v1)
- [x] Full-stack upgrade (backend + database + user management)
- [x] File-based admin credentials (host-independent, no DB dependency)
- [x] Seed initial credentials: ksetravid / Loudbox2026
- [x] Admin login page at /admin/login (username + password, JWT session cookie)
- [x] Admin dashboard at /admin with protected route guard
- [x] Admin sidebar navigation (desktop + mobile drawer)
- [x] Image Manager — view all 13 site images, replace via device file picker, download
- [x] Merch Editor — add/edit/delete products, new categories auto-add to website filters
- [x] Merch Editor — name, image, sizes, price, tags, category, collection, shopify URL, visibility
- [x] Tour Dates Editor — add/edit/delete shows with all fields + sold out / past flags
- [x] UPI Settings — UPI ID, account name, QR code upload via device file picker
- [x] Admin Credentials — change username + password (old ones permanently replaced)
- [x] All public sections wired to DB: Hero, Gallery, Tour, Navbar, About, Contact, Merch
- [x] Database seeded with all existing hardcoded data on first run (idempotent)
- [x] File upload: base64 → S3 CDN (works on phone + PC via native file picker)
- [x] Download buttons for images, merch data, tour data, UPI data
- [x] Vitest tests for all admin procedures (10 tests, all passing)

## Website (v1)
- [x] Navbar with transparent PNG logo (mobile centered + bigger, desktop normal)
- [x] Hero section
- [x] About section
- [x] Music section
- [x] Videos section
- [x] Gallery section
- [x] Tour section
- [x] Lyrics/Themes section
- [x] Merch section with UPI checkout
- [x] Press section
- [x] Contact/Footer section

## Pending
- [x] Wire About section member photos to DB (member_pritam, member_arunav, member_saurav keys added)
- [x] Add WhatsApp number to UPI settings (whatsappNumber field added to DB + admin form)

## Order Flow (v2)
- [x] Add orders table to Postgres schema (buyer name, phone, address, product, size, qty, price, txn ID, status)
- [x] Push schema migration to Neon
- [x] Add tRPC procedures: createOrder, listOrders (admin), updateOrderStatus (admin)
- [x] Rewrite MerchSection checkout modal with delivery info form + UPI deep link
- [x] UPI deep link pre-fills: amount, UPI ID, transaction ref in remarks/comments
- [x] Add Orders section to admin dashboard with full order list and status management
- [x] Add quantity selector (+/-) to each product card in MerchSection

## Vercel Deployment Fixes
- [x] Fix @shared path alias resolution (pre-bundle with esbuild)
- [x] Remove filesystem operations from adminAuth.ts
- [ ] Fix Vercel SPA routing (routes config not applying, /merch returns 404)

## Payment Confirmation Flow (v3)
- [x] Add Step 3 "Payment Confirmation" to checkout: customer enters UTR/transaction ID
- [x] Save order to DB on UTR submission with status "pending"
- [x] Show order confirmation screen with order ID after UTR submitted
- [x] Admin panel: show UTR number in order details for verification

## Razorpay Integration (v4)
- [x] Add Razorpay npm package (razorpay server-side + razorpay checkout.js client-side)
- [x] Add KSETRAVID_RAZORPAY_KEY_ID and KSETRAVID_RAZORPAY_KEY_SECRET env vars (empty = fallback to manual)
- [x] tRPC procedure: initiateRazorpay (creates Razorpay order, returns order_id + key)
- [x] tRPC procedure: verifyRazorpay (verifies signature, saves order to DB as paid)
- [x] tRPC procedure: submitUTR (manual fallback, saves UTR to DB)
- [x] Frontend: payment method selection screen (Razorpay if configured, always show manual)
- [x] Frontend: Razorpay checkout modal with automatic payment confirmation
- [x] Frontend: manual UPI flow with QR + UTR entry field
- [x] Frontend: order confirmation screen shows payment method used
- [x] Admin panel: show payment method (Razorpay/Manual) and UTR/transaction ID in order details
