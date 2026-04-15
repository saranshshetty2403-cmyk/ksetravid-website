/* =============================================================
   KSETRAVID MERCH STORE — UPI-powered checkout module
   Design: Cosmic Tech-Death Noir
   Data: Live from database (admin-managed)
   Features:
     - Dynamic category filter tabs (auto-generated from DB products)
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
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const WHATSAPP_NUMBER = "919999999999"; // placeholder — band's WhatsApp

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildUpiUri(upiId: string, upiName: string, amount: number, note: string) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: upiName,
    am: amount.toString(),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type DbProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string | null;
  sizes: string;
  tags: string;
  collectionTag: string | null;
  isActive: boolean;
  sortOrder: number;
  shopifyUrl: string | null;
};

type UpiData = {
  upiId: string;
  accountName: string;
  qrCodeUrl: string | null;
};

/* ── UPI Checkout Modal ─────────────────────────────────────────── */
function UpiCheckoutModal({
  product,
  size,
  upi,
  onClose,
  onBack,
}: {
  product: DbProduct;
  size: string;
  upi: UpiData;
  onClose: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const note = `Ksetravid Merch: ${product.name} (${size})`;
  const upiUri = useMemo(() => buildUpiUri(upi.upiId, upi.accountName, product.price, note), [product, size, upi]);

  const whatsappMsg = encodeURIComponent(
    `Hi! I just paid ₹${product.price} via UPI for:\n*${product.name}* — Size: ${size}\nUPI ID: ${upi.upiId}\nPlease confirm my order. 🤘`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  function copyUpiId() {
    navigator.clipboard.writeText(upi.upiId).then(() => {
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
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
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
          <div className="flex items-center gap-4 p-4 mb-6" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover shrink-0" style={{ border: "1px solid oklch(0.52 0.24 25 / 0.25)" }} />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm leading-tight mb-1" style={{ color: "oklch(0.87 0.02 80)" }}>{product.name}</p>
              <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.50 0.015 285)" }}>Size: {size}</p>
              <p className="font-display text-lg mt-1" style={{ color: "oklch(0.52 0.24 25)" }}>{formatINR(product.price)}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-4" style={{ color: "oklch(0.45 0.015 285)" }}>
              Scan QR to Pay
            </p>
            <div className="p-4 bg-white inline-block">
              {upi.qrCodeUrl ? (
                <img src={upi.qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
              ) : (
                <QRCodeSVG value={upiUri} size={160} level="M" />
              )}
            </div>
          </div>

          {/* UPI ID copy */}
          <div className="mb-6 p-4" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-2" style={{ color: "oklch(0.45 0.015 285)" }}>UPI ID</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm" style={{ color: "oklch(0.87 0.02 80)" }}>{upi.upiId}</span>
              <button
                onClick={copyUpiId}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
                style={{
                  backgroundColor: copied ? "oklch(0.52 0.24 25 / 0.15)" : "transparent",
                  border: `1px solid ${copied ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`,
                  color: copied ? "oklch(0.52 0.24 25)" : "oklch(0.55 0.015 285)",
                }}
              >
                {copied ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <p className="font-mono-tech text-xs mt-2" style={{ color: "oklch(0.45 0.015 285)" }}>
              Pay to: {upi.accountName}
            </p>
          </div>

          {/* Pay button */}
          <a
            href={upiUri}
            className="flex items-center justify-center gap-3 py-4 mb-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
            style={{ backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
          >
            <Smartphone size={16} /> Open UPI App · {formatINR(product.price)}
          </a>

          {/* WhatsApp confirm */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-3 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
            style={{ backgroundColor: "oklch(0.11 0.006 285)", color: "oklch(0.65 0.18 145)", border: "1px solid oklch(0.65 0.18 145 / 0.3)" }}
          >
            <MessageCircle size={14} /> Confirm Order on WhatsApp
          </a>

          {/* Notice */}
          <div className="flex items-start gap-3 mt-4 p-3" style={{ backgroundColor: "oklch(0.62 0.18 60 / 0.06)", border: "1px solid oklch(0.62 0.18 60 / 0.2)" }}>
            <AlertCircle size={14} style={{ color: "oklch(0.62 0.18 60)", flexShrink: 0, marginTop: 2 }} />
            <p className="font-mono-tech text-xs leading-relaxed" style={{ color: "oklch(0.62 0.18 60)" }}>
              After payment, confirm your order via WhatsApp with your payment screenshot. We ship from Bangalore, India.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Product Detail Modal ───────────────────────────────────────── */
function ProductModal({
  product,
  upi,
  onClose,
  onPay,
}: {
  product: DbProduct;
  upi: UpiData | null;
  onClose: () => void;
  onPay: (size: string) => void;
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const sizes = product.sizes.split(",").map(s => s.trim()).filter(Boolean);

  function handlePay() {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    onPay(selectedSize);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-y-auto"
        style={{
          maxHeight: "90vh",
          backgroundColor: "oklch(0.08 0.006 285)",
          border: "1px solid oklch(1 0 0 / 0.10)",
          boxShadow: "0 0 60px oklch(0 0 0 / 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 transition-colors duration-150"
          style={{ color: "oklch(0.50 0.015 285)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden" style={{ backgroundColor: "oklch(0.10 0.006 285)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.45 0.015 285)" }}>
              {product.collectionTag ?? product.category}
            </p>

            <h3 className="font-display text-2xl md:text-3xl mb-2 leading-tight" style={{ color: "oklch(0.93 0.015 80)" }}>
              {product.name}
            </h3>

            <p className="font-display text-3xl mb-6" style={{ color: "oklch(0.52 0.24 25)" }}>
              {formatINR(product.price)}
              <span className="font-mono-tech text-xs ml-2" style={{ color: "oklch(0.45 0.015 285)" }}>Taxes included</span>
            </p>

            {product.description && (
              <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "oklch(0.60 0.015 285)" }}>
                {product.description}
              </p>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: sizeError ? "oklch(0.65 0.22 25)" : "oklch(0.55 0.015 285)" }}>
                {sizeError ? "⚠ Please select a size first" : "Select Size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className="font-mono-tech text-xs tracking-wider px-3 py-2 transition-all duration-150"
                    style={{
                      border: selectedSize === size ? "1px solid oklch(0.52 0.24 25)" : sizeError ? "1px solid oklch(0.65 0.22 25 / 0.40)" : "1px solid oklch(1 0 0 / 0.15)",
                      backgroundColor: selectedSize === size ? "oklch(0.52 0.24 25 / 0.15)" : "transparent",
                      color: selectedSize === size ? "oklch(0.52 0.24 25)" : "oklch(0.60 0.015 285)",
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
              style={{ backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
            >
              <ShoppingBag size={16} />
              Pay with UPI
              <span className="font-mono-tech text-xs px-2 py-0.5 ml-1" style={{ backgroundColor: "oklch(0.97 0.005 80 / 0.15)", border: "1px solid oklch(0.97 0.005 80 / 0.25)" }}>
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
  const { data: dbProducts, isLoading: productsLoading } = trpc.merch.list.useQuery();
  const { data: upiData } = trpc.upi.get.useQuery();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<DbProduct | null>(null);
  const [checkoutSize, setCheckoutSize] = useState<string>("");

  // Only show active products
  const products = (dbProducts ?? []).filter(p => p.isActive);

  // Dynamically build category tabs from DB products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return [
      { key: "all", label: "All Items" },
      ...cats.map(c => ({
        key: c,
        label: c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " "),
      })),
    ];
  }, [products]);

  // Dynamically build collections from DB products
  const collections = useMemo(() => {
    return Array.from(new Set(products.map(p => p.collectionTag).filter(Boolean)));
  }, [products]);

  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);

  const upi: UpiData = {
    upiId: upiData?.upiId ?? "nikhilraj2110@oksbi",
    accountName: upiData?.accountName ?? "T R Nikhil",
    qrCodeUrl: upiData?.qrCodeUrl ?? null,
  };

  function handlePay(product: DbProduct, size: string) {
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
    if (checkoutProduct) setSelectedProduct(checkoutProduct);
    setCheckoutProduct(null);
    setCheckoutSize("");
  }

  return (
    <>
      {selectedProduct && !checkoutProduct && (
        <ProductModal product={selectedProduct} upi={upi} onClose={handleCloseAll} onPay={(size) => handlePay(selectedProduct, size)} />
      )}
      {checkoutProduct && checkoutSize && (
        <UpiCheckoutModal product={checkoutProduct} size={checkoutSize} upi={upi} onClose={handleCloseAll} onBack={handleBackToProduct} />
      )}

      <section id="merch" className="relative py-14 md:py-24" style={{ backgroundColor: "oklch(0.07 0.005 285)" }}>
        <div className="container relative">
          {/* Section Header */}
          <div className="mb-12">
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>◆ Official Store</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>MERCH STORE</h2>
                <div className="h-px w-24" style={{ backgroundColor: "oklch(0.52 0.24 25)" }} />
                <p className="font-body text-base mt-5 max-w-xl" style={{ color: "oklch(0.55 0.015 285)" }}>
                  Official Ksetravid merchandise. Pay directly via UPI — every purchase supports the band.
                </p>
              </div>
              <div className="flex flex-col gap-3 items-start md:items-end">
                <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.10)", border: "1px solid oklch(0.52 0.24 25 / 0.35)" }}>
                  <Smartphone size={14} style={{ color: "oklch(0.52 0.24 25)" }} />
                  <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>UPI Payments Accepted</span>
                </div>
                {collections.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collections.map((col) => (
                      <span key={col} className="font-mono-tech text-xs tracking-widest uppercase px-3 py-1" style={{ border: "1px solid oklch(1 0 0 / 0.10)", color: "oklch(0.45 0.015 285)" }}>
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1 mb-10 border-b" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="font-mono-tech text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200 relative"
                style={{
                  color: activeCategory === cat.key ? "oklch(0.52 0.24 25)" : "oklch(0.50 0.015 285)",
                  backgroundColor: "transparent",
                  borderBottom: activeCategory === cat.key ? "2px solid oklch(0.52 0.24 25)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {cat.label}
                <span className="ml-2 font-mono-tech text-xs" style={{ color: "oklch(0.38 0.015 285)" }}>
                  {cat.key === "all" ? products.length : products.filter(p => p.category === cat.key).length}
                </span>
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.52 0.24 25)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <ShoppingBag size={40} className="mx-auto mb-4" style={{ color: "oklch(0.30 0.015 285)" }} />
              <p className="font-mono-tech text-sm" style={{ color: "oklch(0.45 0.015 285)" }}>No products in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="text-left block overflow-hidden group transition-all duration-300"
                  style={{ backgroundColor: "oklch(0.10 0.006 285)", border: "1px solid oklch(1 0 0 / 0.07)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.35)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.07)"; }}
                >
                  {/* Product image */}
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "oklch(0.12 0.006 285)" }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.tags && product.tags.split(",")[0]?.trim() && (
                      <span
                        className="absolute top-3 left-3 font-mono-tech text-xs tracking-wider uppercase px-2 py-1"
                        style={{ backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)" }}
                      >
                        {product.tags.split(",")[0].trim()}
                      </span>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.45 0.015 285)" }}>
                      {product.collectionTag ?? product.category}
                    </p>
                    <h3 className="font-display text-base leading-tight mb-3" style={{ color: "oklch(0.87 0.02 80)" }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg" style={{ color: "oklch(0.52 0.24 25)" }}>
                        {formatINR(product.price)}
                      </span>
                      <span
                        className="flex items-center gap-1 font-mono-tech text-xs tracking-widest uppercase transition-colors duration-200"
                        style={{ color: "oklch(0.45 0.015 285)" }}
                      >
                        View <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Shopify link */}
          <div className="mt-12 text-center">
            <a
              href="https://ksetravid.myshopify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
              style={{ backgroundColor: "transparent", color: "oklch(0.55 0.015 285)", border: "1px solid oklch(1 0 0 / 0.12)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.4)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.12)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.015 285)"; }}
            >
              Browse Full Store on Shopify
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
