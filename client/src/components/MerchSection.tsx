/* =============================================================
   KSETRAVID MERCH STORE — UPI-powered checkout module
   Design: Cosmic Tech-Death Noir
   Data sourced from ksetravid.myshopify.com
   UPI: nikhilraj2110@oksbi | T R Nikhil
   Features:
     - Category filter tabs (All / Tees / Tanks / Shorts / Crop Tops)
     - Product grid with real images, prices (INR), badges
     - Product detail modal with size selector
     - UPI checkout modal: QR code + deep link + WhatsApp confirm
   ============================================================= */
import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  ShoppingBag,
  ChevronRight,
  Smartphone,
  Copy,
  CheckCheck,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

/* ── UPI Config ─────────────────────────────────────────────────── */
const UPI_ID = "nikhilraj2110@oksbi";
const UPI_NAME = "T R Nikhil";
const WHATSAPP_NUMBER = "919999999999"; // placeholder — band's WhatsApp

/* ── Product data from ksetravid.myshopify.com ─────────────────── */
const PRODUCTS = [
  {
    id: 1,
    name: "Anamnesis — Regular Tee",
    collection: "Anamnesis",
    category: "tees",
    price: 1000,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    badge: "Best Seller",
    badgeColor: "oklch(0.52 0.24 25)",
    description:
      "Unleash the essence of Ksetravid's Anamnesis with this exclusive graphic T-shirt, crafted by acclaimed artist Dipayan Das. Made for fans who live and breathe heavy music, this tee blends bold artwork with premium comfort — perfect for gigs, festivals, or everyday streetwear.",
    artist: "Dipayan Das",
  },
  {
    id: 2,
    name: "Anamnesis — Tank Top",
    collection: "Anamnesis",
    category: "tanks",
    price: 850,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tank_hd_b3f14fac.jpg",
    sizes: ["S", "L", "XL", "2XL", "3XL"],
    badge: "New",
    badgeColor: "oklch(0.55 0.18 250)",
    description:
      "A brutal, premium graphic tank top featuring exclusive Anamnesis artwork by Dipayan Das. Designed for fans who live and breathe heavy music. Lightweight, sleeveless cut — ideal for the pit.",
    artist: "Dipayan Das",
  },
  {
    id: 3,
    name: "Berserker — Shorts",
    collection: "Berserker",
    category: "shorts",
    price: 700,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_shorts_correct_cf0c28e8.png",
    sizes: ["28", "30", "32", "34", "36"],
    badge: "Limited",
    badgeColor: "oklch(0.62 0.18 60)",
    description:
      "Berserker-series shorts featuring the signature Ksetravid occult artwork. Satin-finish black fabric with drawstring waist. The Berserker design channels ancient fury through modern streetwear.",
    artist: "Ksetravid",
  },
  {
    id: 4,
    name: "Berserker — Tank Top",
    collection: "Berserker",
    category: "tanks",
    price: 800,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_berserker_tank_hd_afbe5844.png",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    badge: "New",
    badgeColor: "oklch(0.55 0.18 250)",
    description:
      "The Berserker tank top brings the raw power of Ksetravid's occult-metal aesthetic to a sleeveless format. Heavyweight cotton blend, oversized fit, printed with the iconic Berserker artwork.",
    artist: "Ksetravid",
  },
  {
    id: 5,
    name: "Crop Top — She/Her",
    collection: "Berserker",
    category: "crop-tops",
    price: 750,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_crop_top_hd_1e662d72.png",
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "She/Her",
    badgeColor: "oklch(0.60 0.15 320)",
    description:
      "Ksetravid's first crop top — designed for she/her fans who want to carry the band's occult energy in a fitted silhouette. Features the Berserker artwork on premium stretch fabric.",
    artist: "Ksetravid",
  },
  {
    id: 6,
    name: "Nomad — Shorts",
    collection: "Nomad",
    category: "shorts",
    price: 700,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_shorts_hd_66199aa0.png",
    sizes: ["28", "30", "32", "34", "36"],
    badge: "Limited",
    badgeColor: "oklch(0.62 0.18 60)",
    description:
      "Nomad-series shorts with the Ksetravid logo and serpentine artwork. Satin-finish black with drawstring waist. The Nomad collection represents the wandering consciousness — unbound, untethered.",
    artist: "Ksetravid",
  },
  {
    id: 7,
    name: "Nomad — Tank Top",
    collection: "Nomad",
    category: "tanks",
    price: 750,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_nomad_tank_hd_78506900.png",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    badge: "New",
    badgeColor: "oklch(0.55 0.18 250)",
    description:
      "The Nomad tank top — sleeveless, raw, and relentless. Featuring the serpent-and-eye motif from the Nomad collection. Lightweight cotton, perfect for summer shows and festival season.",
    artist: "Ksetravid",
  },
  {
    id: 8,
    name: "Ouroboros & Meditate — Tee",
    collection: "Ouroboros",
    category: "tees",
    price: 1000,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_ouroborus_tee_hd_b56f698d.jpg",
    sizes: ["S", "M", "L", "XL", "3XL"],
    badge: "Signature",
    badgeColor: "oklch(0.62 0.18 60)",
    description:
      "The Ouroboros & Meditate tee is the most philosophical piece in the Ksetravid merch line. Two designs in one — the eternal serpent devouring itself, and a figure in deep meditation within a triangle. Rooted in the Upanishadic concept of the self as infinite.",
    artist: "Ksetravid",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Items" },
  { key: "tees", label: "Tees" },
  { key: "tanks", label: "Tanks" },
  { key: "shorts", label: "Shorts" },
  { key: "crop-tops", label: "Crop Tops" },
];

const COLLECTIONS = ["Anamnesis", "Berserker", "Nomad", "Ouroboros"];

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/* ── Build UPI URI ──────────────────────────────────────────────── */
function buildUpiUri(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: amount.toString(),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

/* ── UPI Checkout Modal ─────────────────────────────────────────── */
function UpiCheckoutModal({
  product,
  size,
  onClose,
  onBack,
}: {
  product: (typeof PRODUCTS)[0];
  size: string;
  onClose: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const note = `Ksetravid Merch: ${product.name} (${size})`;
  const upiUri = useMemo(() => buildUpiUri(product.price, note), [product, size]);

  const whatsappMsg = encodeURIComponent(
    `Hi! I just paid ₹${product.price} via UPI for:\n*${product.name}* — Size: ${size}\nUPI ID: ${UPI_ID}\nPlease confirm my order. 🤘`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.92)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-y-auto"
        style={{
          maxHeight: "95vh",
          backgroundColor: "oklch(0.08 0.006 285)",
          border: "1px solid oklch(0.52 0.24 25 / 0.45)",
          boxShadow: "0 0 80px oklch(0.52 0.24 25 / 0.20), 0 0 0 1px oklch(0.52 0.24 25 / 0.10)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono-tech text-xs tracking-widest uppercase transition-colors duration-150"
            style={{ color: "oklch(0.50 0.015 285)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ UPI Checkout
          </p>
          <button
            onClick={onClose}
            className="p-1 transition-colors duration-150"
            style={{ color: "oklch(0.50 0.015 285)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div
            className="flex items-center gap-4 p-4 mb-6"
            style={{
              backgroundColor: "oklch(0.11 0.006 285)",
              border: "1px solid oklch(1 0 0 / 0.08)",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover shrink-0"
              style={{ border: "1px solid oklch(0.52 0.24 25 / 0.25)" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm leading-tight mb-1" style={{ color: "oklch(0.87 0.02 80)" }}>
                {product.name}
              </p>
              <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.50 0.015 285)" }}>
                Size: {size} · {product.collection}
              </p>
            </div>
            <p className="font-display text-xl shrink-0" style={{ color: "oklch(0.52 0.24 25)" }}>
              {formatINR(product.price)}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-4 text-center" style={{ color: "oklch(0.55 0.015 285)" }}>
              Scan with any UPI app
            </p>
            <div
              className="p-4 mb-3"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "2px solid oklch(0.52 0.24 25 / 0.50)",
                boxShadow: "0 0 30px oklch(0.52 0.24 25 / 0.15)",
              }}
            >
              <QRCodeSVG
                value={upiUri}
                size={200}
                bgColor="#ffffff"
                fgColor="#0d0d0d"
                level="M"
                includeMargin={false}
              />
            </div>
            {/* UPI app logos row */}
            <div className="flex items-center gap-3 mt-1">
              {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                <span
                  key={app}
                  className="font-mono-tech text-xs px-2 py-1"
                  style={{
                    color: "oklch(0.42 0.015 285)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    backgroundColor: "oklch(0.11 0.006 285)",
                  }}
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "oklch(1 0 0 / 0.08)" }} />
            <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.38 0.015 285)" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "oklch(1 0 0 / 0.08)" }} />
          </div>

          {/* Open UPI App button (mobile deep link) */}
          <a
            href={upiUri}
            className="flex items-center justify-center gap-3 w-full py-4 mb-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              backgroundColor: "oklch(0.52 0.24 25)",
              color: "oklch(0.97 0.005 80)",
              border: "1px solid oklch(0.52 0.24 25)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
          >
            <Smartphone size={16} />
            Open UPI App
          </a>

          {/* UPI ID copy row */}
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 mb-6"
            style={{
              backgroundColor: "oklch(0.11 0.006 285)",
              border: "1px solid oklch(1 0 0 / 0.10)",
            }}
          >
            <div>
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.42 0.015 285)" }}>
                UPI ID
              </p>
              <p className="font-mono-tech text-sm" style={{ color: "oklch(0.80 0.015 285)" }}>
                {UPI_ID}
              </p>
            </div>
            <button
              onClick={copyUpiId}
              className="flex items-center gap-2 px-4 py-2 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200 shrink-0"
              style={{
                border: "1px solid oklch(1 0 0 / 0.15)",
                color: copied ? "oklch(0.65 0.18 145)" : "oklch(0.55 0.015 285)",
                backgroundColor: copied ? "oklch(0.65 0.18 145 / 0.10)" : "transparent",
              }}
            >
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Amount reminder */}
          <div
            className="flex items-start gap-3 p-4 mb-6"
            style={{
              backgroundColor: "oklch(0.52 0.24 25 / 0.08)",
              border: "1px solid oklch(0.52 0.24 25 / 0.25)",
            }}
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.24 25)" }} />
            <p className="font-mono-tech text-xs leading-relaxed" style={{ color: "oklch(0.65 0.015 285)" }}>
              Please enter exactly <span style={{ color: "oklch(0.52 0.24 25)" }}>{formatINR(product.price)}</span> and add the note:{" "}
              <span style={{ color: "oklch(0.75 0.015 285)" }}>"{note}"</span>
            </p>
          </div>

          {/* WhatsApp confirm */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              backgroundColor: "oklch(0.11 0.006 285)",
              color: "oklch(0.65 0.22 145)",
              border: "1px solid oklch(0.65 0.22 145 / 0.30)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.65 0.22 145 / 0.10)";
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.65 0.22 145 / 0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.11 0.006 285)";
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.65 0.22 145 / 0.30)";
            }}
          >
            <MessageCircle size={16} />
            Send Payment Proof via WhatsApp
          </a>

          <p className="font-mono-tech text-xs text-center mt-4" style={{ color: "oklch(0.35 0.015 285)" }}>
            After payment, send a screenshot via WhatsApp to confirm your order.
            <br />Ships from Bangalore, India · Allow 3–7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Product Detail Modal ───────────────────────────────────────── */
function ProductModal({
  product,
  onClose,
  onPay,
}: {
  product: (typeof PRODUCTS)[0];
  onClose: () => void;
  onPay: (size: string) => void;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  function handlePay() {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    onPay(selectedSize);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-y-auto"
        style={{
          maxHeight: "90vh",
          backgroundColor: "oklch(0.09 0.006 285)",
          border: "1px solid oklch(0.52 0.24 25 / 0.35)",
          boxShadow: "0 0 60px oklch(0.52 0.24 25 / 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 transition-colors duration-200"
          style={{ color: "oklch(0.55 0.015 285)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.015 285)"; }}
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Product image */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span
              className="absolute bottom-4 left-4 font-mono-tech text-xs tracking-widest uppercase px-3 py-1"
              style={{
                backgroundColor: "oklch(0.09 0.006 285 / 0.9)",
                color: "oklch(0.52 0.24 25)",
                border: "1px solid oklch(0.52 0.24 25 / 0.4)",
              }}
            >
              {product.collection} Collection
            </span>
          </div>

          {/* Product info */}
          <div className="p-5 md:p-8 flex flex-col">
            {/* Badge */}
            <span
              className="font-mono-tech text-xs tracking-widest uppercase px-2 py-1 self-start mb-4"
              style={{
                backgroundColor: `${product.badgeColor}18`,
                color: product.badgeColor,
                border: `1px solid ${product.badgeColor}45`,
              }}
            >
              {product.badge}
            </span>

            <h3
              className="font-display text-2xl md:text-3xl mb-2 leading-tight"
              style={{ color: "oklch(0.93 0.015 80)" }}
            >
              {product.name}
            </h3>

            {product.artist && (
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-4" style={{ color: "oklch(0.45 0.015 285)" }}>
                Artwork by {product.artist}
              </p>
            )}

            <p
              className="font-display text-3xl mb-6"
              style={{ color: "oklch(0.52 0.24 25)" }}
            >
              {formatINR(product.price)}
              <span className="font-mono-tech text-xs ml-2" style={{ color: "oklch(0.45 0.015 285)" }}>
                Taxes included
              </span>
            </p>

            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "oklch(0.60 0.015 285)" }}>
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <p
                className="font-mono-tech text-xs tracking-widest uppercase mb-3"
                style={{ color: sizeError ? "oklch(0.65 0.22 25)" : "oklch(0.55 0.015 285)" }}
              >
                {sizeError ? "⚠ Please select a size first" : "Select Size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="font-mono-tech text-xs tracking-wider px-3 py-2 transition-all duration-150"
                    style={{
                      border: selectedSize === size
                        ? "1px solid oklch(0.52 0.24 25)"
                        : sizeError
                        ? "1px solid oklch(0.65 0.22 25 / 0.40)"
                        : "1px solid oklch(1 0 0 / 0.15)",
                      backgroundColor: selectedSize === size
                        ? "oklch(0.52 0.24 25 / 0.15)"
                        : "transparent",
                      color: selectedSize === size
                        ? "oklch(0.52 0.24 25)"
                        : "oklch(0.60 0.015 285)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay with UPI CTA */}
            <button
              onClick={handlePay}
              className="flex items-center justify-center gap-3 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200 mt-auto"
              style={{
                backgroundColor: "oklch(0.52 0.24 25)",
                color: "oklch(0.97 0.005 80)",
                border: "1px solid oklch(0.52 0.24 25)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)";
              }}
            >
              <ShoppingBag size={16} />
              Pay with UPI
              <span
                className="font-mono-tech text-xs px-2 py-0.5 ml-1"
                style={{
                  backgroundColor: "oklch(0.97 0.005 80 / 0.15)",
                  border: "1px solid oklch(0.97 0.005 80 / 0.25)",
                }}
              >
                {formatINR(product.price)}
              </span>
            </button>

            <p className="font-mono-tech text-xs text-center mt-3" style={{ color: "oklch(0.40 0.015 285)" }}>
              Instant UPI payment · Ships from Bangalore, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main MerchSection ──────────────────────────────────────────── */
export default function MerchSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<(typeof PRODUCTS)[0] | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<(typeof PRODUCTS)[0] | null>(null);
  const [checkoutSize, setCheckoutSize] = useState<string>("");

  const filtered =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  function handlePay(product: (typeof PRODUCTS)[0], size: string) {
    setCheckoutProduct(product);
    setCheckoutSize(size);
    setSelectedProduct(null);
  }

  function handleCloseAll() {
    setSelectedProduct(null);
    setCheckoutProduct(null);
    setCheckoutSize("");
  }

  function handleBackToProduct() {
    if (checkoutProduct) {
      setSelectedProduct(checkoutProduct);
    }
    setCheckoutProduct(null);
    setCheckoutSize("");
  }

  return (
    <>
      {/* Product Detail Modal */}
      {selectedProduct && !checkoutProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseAll}
          onPay={(size) => handlePay(selectedProduct, size)}
        />
      )}

      {/* UPI Checkout Modal */}
      {checkoutProduct && checkoutSize && (
        <UpiCheckoutModal
          product={checkoutProduct}
          size={checkoutSize}
          onClose={handleCloseAll}
          onBack={handleBackToProduct}
        />
      )}

      <section
        id="merch"
        className="relative py-14 md:py-24"
        style={{ backgroundColor: "oklch(0.07 0.005 285)" }}
      >
        <div className="container relative">
          {/* ── Section Header ─────────────────────────────────── */}
          <div className="mb-12">
            <p
              className="font-mono-tech text-xs tracking-widest uppercase mb-3"
              style={{ color: "oklch(0.52 0.24 25)" }}
            >
              ◆ Official Store
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2
                  className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
                  style={{ color: "oklch(0.93 0.015 80)" }}
                >
                  MERCH STORE
                </h2>
                <div className="h-px w-24" style={{ backgroundColor: "oklch(0.52 0.24 25)" }} />
                <p className="font-body text-base mt-5 max-w-xl" style={{ color: "oklch(0.55 0.015 285)" }}>
                  Official Ksetravid merchandise. Pay directly via UPI — every purchase supports the band.
                </p>
              </div>

              {/* UPI badge + Collection tags */}
              <div className="flex flex-col gap-3 items-start md:items-end">
                {/* UPI accepted badge */}
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    backgroundColor: "oklch(0.52 0.24 25 / 0.10)",
                    border: "1px solid oklch(0.52 0.24 25 / 0.35)",
                  }}
                >
                  <Smartphone size={14} style={{ color: "oklch(0.52 0.24 25)" }} />
                  <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
                    UPI Payments Accepted
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLLECTIONS.map((col) => (
                    <span
                      key={col}
                      className="font-mono-tech text-xs tracking-widest uppercase px-3 py-1"
                      style={{
                        border: "1px solid oklch(1 0 0 / 0.10)",
                        color: "oklch(0.45 0.015 285)",
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Category Filter Tabs ────────────────────────────── */}
          <div
            className="flex flex-wrap gap-1 mb-10 border-b"
            style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="font-mono-tech text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200 relative"
                style={{
                  color:
                    activeCategory === cat.key
                      ? "oklch(0.52 0.24 25)"
                      : "oklch(0.50 0.015 285)",
                  backgroundColor: "transparent",
                  borderBottom:
                    activeCategory === cat.key
                      ? "2px solid oklch(0.52 0.24 25)"
                      : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat.key)
                    (e.currentTarget as HTMLElement).style.color = "oklch(0.70 0.015 285)";
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat.key)
                    (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)";
                }}
              >
                {cat.label}
                <span
                  className="ml-2 font-mono-tech text-xs"
                  style={{ color: "oklch(0.38 0.015 285)" }}
                >
                  {cat.key === "all"
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.category === cat.key).length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Product Grid ────────────────────────────────────── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="text-left block overflow-hidden group transition-all duration-300"
                style={{
                  backgroundColor: "oklch(0.10 0.006 285)",
                  border: "1px solid oklch(1 0 0 / 0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.52 0.24 25 / 0.45)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 20px oklch(0.52 0.24 25 / 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.07)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Product image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: "oklch(0 0 0 / 0.50)" }}
                  >
                    <span
                      className="font-mono-tech text-xs tracking-widest uppercase px-4 py-2"
                      style={{
                        border: "1px solid oklch(0.52 0.24 25)",
                        color: "oklch(0.52 0.24 25)",
                        backgroundColor: "oklch(0.07 0.005 285 / 0.8)",
                      }}
                    >
                      View Details
                    </span>
                  </div>
                  {/* Badge */}
                  <span
                    className="absolute top-3 left-3 font-mono-tech text-xs tracking-widest uppercase px-2 py-1"
                    style={{
                      backgroundColor: `${product.badgeColor}20`,
                      color: product.badgeColor,
                      border: `1px solid ${product.badgeColor}50`,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {product.badge}
                  </span>
                  {/* Collection */}
                  <span
                    className="absolute top-3 right-3 font-mono-tech text-xs tracking-widest uppercase px-2 py-1"
                    style={{
                      backgroundColor: "oklch(0.07 0.005 285 / 0.75)",
                      color: "oklch(0.45 0.015 285)",
                      border: "1px solid oklch(1 0 0 / 0.12)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {product.collection}
                  </span>
                </div>

                {/* Product info */}
                <div className="p-4">
                  <h4
                    className="font-display text-sm mb-1 leading-tight"
                    style={{ color: "oklch(0.87 0.02 80)" }}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="font-display text-lg"
                      style={{ color: "oklch(0.52 0.24 25)" }}
                    >
                      {formatINR(product.price)}
                    </span>
                    <span
                      className="font-mono-tech text-xs tracking-widest uppercase flex items-center gap-1"
                      style={{ color: "oklch(0.40 0.015 285)" }}
                    >
                      Shop <ChevronRight size={12} />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.sizes.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="font-mono-tech text-xs px-1.5 py-0.5"
                        style={{
                          border: "1px solid oklch(1 0 0 / 0.10)",
                          color: "oklch(0.42 0.015 285)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {product.sizes.length > 4 && (
                      <span
                        className="font-mono-tech text-xs px-1.5 py-0.5"
                        style={{ color: "oklch(0.38 0.015 285)" }}
                      >
                        +{product.sizes.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Store CTA Banner ────────────────────────────────── */}
          <div
            className="mt-16 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
            style={{
              backgroundColor: "oklch(0.10 0.006 285)",
              border: "1px solid oklch(0.52 0.24 25 / 0.20)",
              borderLeft: "4px solid oklch(0.52 0.24 25)",
            }}
          >
            <div>
              <p
                className="font-mono-tech text-xs tracking-widest uppercase mb-2"
                style={{ color: "oklch(0.52 0.24 25)" }}
              >
                ◆ Direct Support
              </p>
              <h3
                className="font-display text-2xl md:text-3xl mb-2"
                style={{ color: "oklch(0.93 0.015 80)" }}
              >
                SUPPORT KSETRAVID DIRECTLY
              </h3>
              <p className="font-body text-sm" style={{ color: "oklch(0.55 0.015 285)" }}>
                Every purchase funds the band's debut album, touring, and future releases.
                Pay via UPI — instant, zero fees, ships from Bangalore.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://ksetravid.myshopify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
                style={{
                  backgroundColor: "oklch(0.52 0.24 25)",
                  color: "oklch(0.97 0.005 80)",
                  border: "1px solid oklch(0.52 0.24 25)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)";
                }}
              >
                <ShoppingBag size={16} />
                Visit Shopify Store
              </a>
              <a
                href="https://www.instagram.com/ksetravid/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
                style={{
                  backgroundColor: "transparent",
                  color: "oklch(0.65 0.015 285)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.50)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.15)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.015 285)";
                }}
              >
                Follow for Drops
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
