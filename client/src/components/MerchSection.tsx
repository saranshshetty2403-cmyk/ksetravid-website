/* =============================================================
   KSETRAVID MERCH STORE — Full Order Flow
   Design: Cosmic Tech-Death Noir
   Flow: Product → Size + Qty → Delivery Info → Payment (Razorpay or Manual UPI+UTR) → Confirmation
   ============================================================= */
import { useState, useMemo, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X, ShoppingBag, ChevronRight, Smartphone, Copy, CheckCheck,
  MessageCircle, ArrowLeft, AlertCircle, Loader2, Plus, Minus,
  MapPin, User, Phone, Mail, CheckCircle2, Package, CreditCard,
  Shield, Hash,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const FALLBACK_WHATSAPP = "919999999999";

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildUpiUri(upiId: string, upiName: string, amount: number, txnRef: string) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: upiName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Ksetravid Order ${txnRef}`,
  });
  return `upi://pay?${params.toString()}`;
}

// Dynamically load the Razorpay checkout script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  whatsappNumber?: string | null;
};

type DeliveryInfo = {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_DELIVERY: DeliveryInfo = {
  buyerName: "", buyerPhone: "", buyerEmail: "",
  addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "",
};

/* ── Step 1: Delivery Info Form ─────────────────────────────────── */
function DeliveryForm({
  product,
  size,
  quantity,
  upi,
  onClose,
  onBack,
  onNext,
}: {
  product: DbProduct;
  size: string;
  quantity: number;
  upi: UpiData;
  onClose: () => void;
  onBack: () => void;
  onNext: (info: DeliveryInfo, txnRef: string, orderId: number) => void;
}) {
  const [form, setForm] = useState<DeliveryInfo>(EMPTY_DELIVERY);
  const [errors, setErrors] = useState<Partial<DeliveryInfo>>({});
  const totalAmount = product.price * quantity;

  const createOrder = trpc.orders.create.useMutation();

  function validate(): boolean {
    const e: Partial<DeliveryInfo> = {};
    if (!form.buyerName.trim()) e.buyerName = "Required";
    if (!form.buyerPhone.trim() || form.buyerPhone.replace(/\D/g, "").length < 10) e.buyerPhone = "Enter valid 10-digit number";
    if (!form.addressLine1.trim()) e.addressLine1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.pincode.trim() || form.pincode.replace(/\D/g, "").length < 6) e.pincode = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await createOrder.mutateAsync({
        buyerName: form.buyerName.trim(),
        buyerPhone: form.buyerPhone.trim(),
        buyerEmail: form.buyerEmail.trim() || null,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        selectedSize: size || null,
        quantity,
        unitPrice: product.price,
        totalAmount,
        upiId: upi.upiId,
      });
      onNext(form, result.txnRef, result.id);
    } catch {
      toast.error("Failed to save order. Please try again.");
    }
  }

  const inputStyle = {
    backgroundColor: "oklch(0.11 0.006 285)",
    border: "1px solid oklch(1 0 0 / 0.12)",
    color: "oklch(0.87 0.02 80)",
    outline: "none",
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "inherit",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-mono-tech, monospace)",
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "oklch(0.45 0.015 285)",
    marginBottom: "6px",
  };

  const errorStyle = { color: "oklch(0.65 0.22 25)", fontSize: "11px", marginTop: "4px", fontFamily: "monospace" };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.90)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-y-auto"
        style={{
          maxHeight: "95vh",
          backgroundColor: "oklch(0.08 0.006 285)",
          border: "1px solid oklch(0.52 0.24 25 / 0.35)",
          boxShadow: "0 0 80px oklch(0.52 0.24 25 / 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
          <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-widest uppercase transition-colors" style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}>
            <ArrowLeft size={14} /> Back
          </button>
          <p style={{ color: "oklch(0.52 0.24 25)", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            ◆ Delivery Details
          </p>
          <button onClick={onClose} className="p-1 transition-colors" style={{ color: "oklch(0.50 0.015 285)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Summary */}
          <div className="flex items-center gap-4 p-4 mb-6" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover shrink-0" style={{ border: "1px solid oklch(0.52 0.24 25 / 0.25)" }} />
            <div className="flex-1 min-w-0">
              <p style={{ color: "oklch(0.87 0.02 80)", fontSize: "13px", fontWeight: 600 }}>{product.name}</p>
              <p style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {size && `Size: ${size} · `}Qty: {quantity}
              </p>
              <p style={{ color: "oklch(0.52 0.24 25)", fontSize: "16px", fontWeight: 700, marginTop: "2px" }}>{formatINR(totalAmount)}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-4" style={{ color: "oklch(0.52 0.24 25)" }}>
              <User size={14} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Contact Information</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.buyerName ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                  value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                  placeholder="Your full name" />
                {errors.buyerName && <p style={errorStyle}>{errors.buyerName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}><Phone size={10} className="inline mr-1" />Phone *</label>
                  <input style={{ ...inputStyle, borderColor: errors.buyerPhone ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                    value={form.buyerPhone} onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                    placeholder="10-digit mobile" type="tel" />
                  {errors.buyerPhone && <p style={errorStyle}>{errors.buyerPhone}</p>}
                </div>
                <div>
                  <label style={labelStyle}><Mail size={10} className="inline mr-1" />Email (optional)</label>
                  <input style={inputStyle}
                    value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                    placeholder="email@example.com" type="email" />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4" style={{ color: "oklch(0.52 0.24 25)" }}>
              <MapPin size={14} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Delivery Address</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label style={labelStyle}>Address Line 1 *</label>
                <input style={{ ...inputStyle, borderColor: errors.addressLine1 ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                  value={form.addressLine1} onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                  placeholder="House/Flat No., Street, Area" />
                {errors.addressLine1 && <p style={errorStyle}>{errors.addressLine1}</p>}
              </div>
              <div>
                <label style={labelStyle}>Address Line 2 (optional)</label>
                <input style={inputStyle}
                  value={form.addressLine2} onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                  placeholder="Landmark, Colony" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={labelStyle}>City *</label>
                  <input style={{ ...inputStyle, borderColor: errors.city ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="City" />
                  {errors.city && <p style={errorStyle}>{errors.city}</p>}
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input style={{ ...inputStyle, borderColor: errors.state ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                    value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="State" />
                  {errors.state && <p style={errorStyle}>{errors.state}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Pincode *</label>
                  <input style={{ ...inputStyle, borderColor: errors.pincode ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.12)" }}
                    value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                    placeholder="6-digit" type="tel" maxLength={6} />
                  {errors.pincode && <p style={errorStyle}>{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest uppercase transition-all duration-200"
            style={{ fontFamily: "monospace", backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)", opacity: createOrder.isPending ? 0.7 : 1 }}
          >
            {createOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {createOrder.isPending ? "Saving..." : "Continue to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Step 2: Payment Modal (Razorpay or Manual UPI) ─────────────── */
function PaymentModal({
  product,
  size,
  quantity,
  upi,
  txnRef,
  orderId,
  deliveryInfo,
  onClose,
  onDone,
}: {
  product: DbProduct;
  size: string;
  quantity: number;
  upi: UpiData;
  txnRef: string;
  orderId: number;
  deliveryInfo: DeliveryInfo;
  onClose: () => void;
  onDone: (method: "razorpay" | "manual") => void;
}) {
  const totalAmount = product.price * quantity;
  const upiUri = useMemo(() => buildUpiUri(upi.upiId, upi.accountName, totalAmount, txnRef), [upi, totalAmount, txnRef]);

  // Check if Razorpay is configured on the server
  const { data: razorpayEnabled } = trpc.orders.isRazorpayEnabled.useQuery(undefined, { retry: 1 });

  // Payment method: "razorpay" | "manual" | null (not chosen yet)
  const [payMethod, setPayMethod] = useState<"razorpay" | "manual" | null>(null);

  // UTR manual flow state
  const [utrInput, setUtrInput] = useState("");
  const [utrError, setUtrError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // tRPC mutations
  const initiateRazorpay = trpc.orders.initiateRazorpay.useMutation();
  const verifyRazorpay = trpc.orders.verifyRazorpay.useMutation();
  const submitUTR = trpc.orders.submitUTR.useMutation();

  const whatsappMsg = encodeURIComponent(
    `Hi! I just placed an order on Ksetravid.\n\n` +
    `*Order Ref:* ${txnRef}\n` +
    `*Product:* ${product.name}${size ? ` — Size: ${size}` : ""}\n` +
    `*Qty:* ${quantity} × ${formatINR(product.price)} = *${formatINR(totalAmount)}*\n\n` +
    `*Delivery to:*\n${deliveryInfo.buyerName}\n${deliveryInfo.addressLine1}${deliveryInfo.addressLine2 ? ", " + deliveryInfo.addressLine2 : ""}\n${deliveryInfo.city}, ${deliveryInfo.state} — ${deliveryInfo.pincode}\nPhone: ${deliveryInfo.buyerPhone}\n\n` +
    `Please confirm my order. 🤘`
  );
  const whatsappUrl = `https://wa.me/${upi.whatsappNumber || FALLBACK_WHATSAPP}?text=${whatsappMsg}`;

  function copyUpiId() {
    navigator.clipboard.writeText(upi.upiId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }
  function copyTxnRef() {
    navigator.clipboard.writeText(txnRef).then(() => { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2500); });
  }

  async function handleRazorpayPay() {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Failed to load Razorpay. Please try manual UPI."); return; }

      const rzpData = await initiateRazorpay.mutateAsync({ orderId });

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Ksetravid",
        description: `Order ${rzpData.txnRef}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: rzpData.buyerName,
          contact: rzpData.buyerPhone,
          email: rzpData.buyerEmail || undefined,
        },
        theme: { color: "#c0392b" },
        handler: async (response: any) => {
          try {
            await verifyRazorpay.mutateAsync({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onDone("razorpay");
          } catch {
            toast.error("Payment verification failed. Please contact us with your payment screenshot.");
          }
        },
        modal: {
          ondismiss: () => { /* user closed modal — stay on payment page */ },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate payment. Please try manual UPI.");
    }
  }

  async function handleUTRSubmit() {
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      setUtrError("Please enter a valid UTR / transaction ID (min 6 characters)");
      return;
    }
    setUtrError("");
    try {
      await submitUTR.mutateAsync({ orderId, utrNumber: utrInput.trim() });
      onDone("manual");
    } catch {
      toast.error("Failed to save UTR. Please try again.");
    }
  }

  const modalBg = "oklch(0.08 0.006 285)";
  const borderColor = "oklch(0.52 0.24 25 / 0.45)";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.92)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-y-auto"
        style={{ maxHeight: "95vh", backgroundColor: modalBg, border: `1px solid ${borderColor}`, boxShadow: "0 0 80px oklch(0.52 0.24 25 / 0.20)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
          {payMethod ? (
            <button onClick={() => setPayMethod(null)} className="flex items-center gap-2 text-xs tracking-widest uppercase transition-colors" style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <span style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace", fontSize: "11px" }}>Step 2 of 2</span>
          )}
          <p style={{ color: "oklch(0.52 0.24 25)", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            ◆ Payment
          </p>
          <button onClick={onClose} className="p-1 transition-colors" style={{ color: "oklch(0.50 0.015 285)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.015 285)"; }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="flex items-center gap-4 p-4 mb-5" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover shrink-0" style={{ border: "1px solid oklch(0.52 0.24 25 / 0.25)" }} />
            <div className="flex-1 min-w-0">
              <p style={{ color: "oklch(0.87 0.02 80)", fontSize: "13px", fontWeight: 600 }}>{product.name}</p>
              <p style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {size && `Size: ${size} · `}Qty: {quantity}
              </p>
              <p style={{ color: "oklch(0.52 0.24 25)", fontSize: "18px", fontWeight: 700, marginTop: "2px" }}>{formatINR(totalAmount)}</p>
            </div>
          </div>

          {/* ── Payment Method Selection ── */}
          {!payMethod && (
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "14px" }}>
                Choose Payment Method
              </p>

              {/* Razorpay option — only shown if configured */}
              {razorpayEnabled && (
                <button
                  onClick={() => setPayMethod("razorpay")}
                  className="w-full flex items-center gap-4 p-4 mb-3 text-left transition-all duration-200"
                  style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.06)", border: "1px solid oklch(0.52 0.24 25 / 0.30)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.70)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.30)"; }}
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.15)", border: "1px solid oklch(0.52 0.24 25 / 0.30)" }}>
                    <CreditCard size={18} style={{ color: "oklch(0.52 0.24 25)" }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: "oklch(0.87 0.02 80)", fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>Pay with Razorpay</p>
                    <p style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace", fontSize: "11px" }}>UPI, Cards, Net Banking — instant confirmation</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1" style={{ backgroundColor: "oklch(0.65 0.18 145 / 0.12)", border: "1px solid oklch(0.65 0.18 145 / 0.30)" }}>
                    <Shield size={10} style={{ color: "oklch(0.65 0.18 145)" }} />
                    <span style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.65 0.18 145)" }}>Secure</span>
                  </div>
                </button>
              )}

              {/* Manual UPI option */}
              <button
                onClick={() => setPayMethod("manual")}
                className="w-full flex items-center gap-4 p-4 text-left transition-all duration-200"
                style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.12)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25 / 0.40)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.12)"; }}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "oklch(0.15 0.006 285)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
                  <Smartphone size={18} style={{ color: "oklch(0.55 0.015 285)" }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: "oklch(0.87 0.02 80)", fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>Pay via UPI Manually</p>
                  <p style={{ color: "oklch(0.50 0.015 285)", fontFamily: "monospace", fontSize: "11px" }}>Scan QR or open UPI app — enter UTR after payment</p>
                </div>
              </button>
            </div>
          )}

          {/* ── Razorpay Flow ── */}
          {payMethod === "razorpay" && (
            <div>
              <div className="mb-5 p-4" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.08)", border: "1px solid oklch(0.52 0.24 25 / 0.30)" }}>
                <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "6px" }}>
                  Order Reference
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 700, color: "oklch(0.52 0.24 25)", letterSpacing: "0.05em" }}>{txnRef}</span>
                  <button onClick={copyTxnRef} className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase"
                    style={{ fontFamily: "monospace", backgroundColor: copiedRef ? "oklch(0.52 0.24 25 / 0.15)" : "transparent", border: `1px solid ${copiedRef ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`, color: copiedRef ? "oklch(0.52 0.24 25)" : "oklch(0.55 0.015 285)" }}>
                    {copiedRef ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRazorpayPay}
                disabled={initiateRazorpay.isPending || verifyRazorpay.isPending}
                className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest uppercase transition-all duration-200"
                style={{ fontFamily: "monospace", backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)", opacity: (initiateRazorpay.isPending || verifyRazorpay.isPending) ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!initiateRazorpay.isPending) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
              >
                {(initiateRazorpay.isPending || verifyRazorpay.isPending)
                  ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  : <><CreditCard size={16} /> Pay {formatINR(totalAmount)} with Razorpay</>
                }
              </button>

              <div className="flex items-start gap-3 mt-4 p-3" style={{ backgroundColor: "oklch(0.65 0.18 145 / 0.06)", border: "1px solid oklch(0.65 0.18 145 / 0.20)" }}>
                <Shield size={13} style={{ color: "oklch(0.65 0.18 145)", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "monospace", fontSize: "11px", lineHeight: 1.6, color: "oklch(0.65 0.18 145)" }}>
                  Razorpay will open a secure checkout. Your order is automatically confirmed once payment is complete.
                </p>
              </div>
            </div>
          )}

          {/* ── Manual UPI Flow ── */}
          {payMethod === "manual" && (
            <div>
              {/* Transaction Ref */}
              <div className="mb-4 p-4" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.08)", border: "1px solid oklch(0.52 0.24 25 / 0.30)" }}>
                <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "6px" }}>
                  Transaction Reference (use in payment note)
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 700, color: "oklch(0.52 0.24 25)", letterSpacing: "0.05em" }}>{txnRef}</span>
                  <button onClick={copyTxnRef} className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase"
                    style={{ fontFamily: "monospace", backgroundColor: copiedRef ? "oklch(0.52 0.24 25 / 0.15)" : "transparent", border: `1px solid ${copiedRef ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`, color: copiedRef ? "oklch(0.52 0.24 25)" : "oklch(0.55 0.015 285)" }}>
                    {copiedRef ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-4">
                <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "12px" }}>
                  Scan QR to Pay {formatINR(totalAmount)}
                </p>
                <div className="p-4 bg-white inline-block">
                  {upi.qrCodeUrl ? (
                    <img src={upi.qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                  ) : (
                    <QRCodeSVG value={upiUri} size={160} level="M" />
                  )}
                </div>
              </div>

              {/* UPI ID */}
              <div className="mb-4 p-4" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "8px" }}>UPI ID</p>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: "oklch(0.87 0.02 80)" }}>{upi.upiId}</span>
                  <button onClick={copyUpiId} className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase"
                    style={{ fontFamily: "monospace", backgroundColor: copied ? "oklch(0.52 0.24 25 / 0.15)" : "transparent", border: `1px solid ${copied ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`, color: copied ? "oklch(0.52 0.24 25)" : "oklch(0.55 0.015 285)" }}>
                    {copied ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "oklch(0.45 0.015 285)", marginTop: "4px" }}>Pay to: {upi.accountName}</p>
              </div>

              {/* Open UPI App button */}
              <a
                href={upiUri}
                className="flex items-center justify-center gap-3 py-3 mb-4 text-sm tracking-widest uppercase transition-all duration-200"
                style={{ fontFamily: "monospace", backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)", display: "flex" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
              >
                <Smartphone size={16} /> Open UPI App · Pay {formatINR(totalAmount)}
              </a>

              {/* UTR Entry */}
              <div className="mb-4 p-4" style={{ backgroundColor: "oklch(0.11 0.006 285)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={13} style={{ color: "oklch(0.52 0.24 25)" }} />
                  <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)" }}>
                    Enter UTR / Transaction ID after payment
                  </p>
                </div>
                <input
                  value={utrInput}
                  onChange={e => { setUtrInput(e.target.value); setUtrError(""); }}
                  placeholder="e.g. 123456789012 or T2504151234..."
                  style={{
                    backgroundColor: "oklch(0.08 0.006 285)",
                    border: `1px solid ${utrError ? "oklch(0.65 0.22 25)" : "oklch(1 0 0 / 0.15)"}`,
                    color: "oklch(0.87 0.02 80)",
                    outline: "none",
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    marginBottom: "8px",
                  }}
                />
                {utrError && <p style={{ color: "oklch(0.65 0.22 25)", fontSize: "11px", fontFamily: "monospace", marginBottom: "8px" }}>{utrError}</p>}
                <p style={{ fontFamily: "monospace", fontSize: "10px", color: "oklch(0.38 0.015 285)", lineHeight: 1.5 }}>
                  Find the UTR/transaction ID in your UPI app under payment history. This confirms your order.
                </p>
              </div>

              <button
                onClick={handleUTRSubmit}
                disabled={submitUTR.isPending}
                className="w-full flex items-center justify-center gap-3 py-3 mb-3 text-sm tracking-widest uppercase transition-all duration-200"
                style={{ fontFamily: "monospace", backgroundColor: utrInput.trim().length >= 6 ? "oklch(0.52 0.24 25)" : "oklch(0.20 0.006 285)", color: "oklch(0.97 0.005 80)", border: `1px solid ${utrInput.trim().length >= 6 ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`, opacity: submitUTR.isPending ? 0.7 : 1 }}
              >
                {submitUTR.isPending ? <><Loader2 size={14} className="animate-spin" /> Confirming...</> : <><CheckCircle2 size={14} /> Confirm Payment</>}
              </button>

              {/* WhatsApp confirm */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-3 text-xs tracking-widest uppercase transition-all duration-200"
                style={{ fontFamily: "monospace", backgroundColor: "oklch(0.11 0.006 285)", color: "oklch(0.65 0.18 145)", border: "1px solid oklch(0.65 0.18 145 / 0.3)", display: "flex" }}
              >
                <MessageCircle size={14} /> Also Confirm on WhatsApp
              </a>

              <div className="flex items-start gap-3 mt-4 p-3" style={{ backgroundColor: "oklch(0.62 0.18 60 / 0.06)", border: "1px solid oklch(0.62 0.18 60 / 0.2)" }}>
                <AlertCircle size={14} style={{ color: "oklch(0.62 0.18 60)", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "monospace", fontSize: "11px", lineHeight: 1.6, color: "oklch(0.62 0.18 60)" }}>
                  Enter your UTR number above to confirm your order. We will verify and ship from Bangalore, India.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Order Confirmed ────────────────────────────────────── */
function OrderConfirmedModal({
  txnRef,
  paymentMethod,
  onClose,
}: {
  txnRef: string;
  paymentMethod: "razorpay" | "manual";
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.92)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="relative w-full max-w-md text-center p-10"
        style={{
          backgroundColor: "oklch(0.08 0.006 285)",
          border: "1px solid oklch(0.52 0.24 25 / 0.45)",
          boxShadow: "0 0 100px oklch(0.52 0.24 25 / 0.15)",
        }}
      >
        <CheckCircle2 size={48} className="mx-auto mb-5" style={{ color: "oklch(0.52 0.24 25)" }} />
        <h3 style={{ fontFamily: "var(--font-display, serif)", fontSize: "24px", color: "oklch(0.93 0.015 80)", marginBottom: "12px" }}>
          {paymentMethod === "razorpay" ? "PAYMENT CONFIRMED" : "ORDER PLACED"}
        </h3>
        <p style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "16px" }}>
          Transaction Reference
        </p>
        <p style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: "oklch(0.52 0.24 25)", marginBottom: "20px", letterSpacing: "0.05em" }}>
          {txnRef}
        </p>

        {paymentMethod === "razorpay" ? (
          <p style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: 1.7, color: "oklch(0.55 0.015 285)", marginBottom: "28px" }}>
            Your payment has been verified automatically. We will process and ship your order from Bangalore, India.
          </p>
        ) : (
          <p style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: 1.7, color: "oklch(0.55 0.015 285)", marginBottom: "28px" }}>
            Your UTR has been recorded. We will verify your payment and ship from Bangalore, India. Save your order reference for tracking.
          </p>
        )}

        <div className="flex items-center gap-2 justify-center mb-6 p-3" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.08)", border: "1px solid oklch(0.52 0.24 25 / 0.25)" }}>
          <Package size={14} style={{ color: "oklch(0.52 0.24 25)" }} />
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.52 0.24 25)" }}>
            Ships from Bangalore, India
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 text-sm tracking-widest uppercase transition-all duration-200"
          style={{ fontFamily: "monospace", backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

/* ── Product Detail Modal ───────────────────────────────────────── */
function ProductModal({
  product,
  upi,
  onClose,
  onCheckout,
}: {
  product: DbProduct;
  upi: UpiData | null;
  onClose: () => void;
  onCheckout: (size: string, quantity: number) => void;
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const sizes = product.sizes.split(",").map(s => s.trim()).filter(Boolean);

  function handleCheckout() {
    if (sizes.length > 0 && !selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    onCheckout(selectedSize, quantity);
  }

  const totalAmount = product.price * quantity;

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
          <div className="relative aspect-square md:aspect-auto" style={{ backgroundColor: "oklch(0.11 0.006 285)", minHeight: "280px" }}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            {product.collectionTag && (
              <span className="absolute top-4 left-4 font-mono-tech text-xs tracking-wider uppercase px-3 py-1.5"
                style={{ backgroundColor: "oklch(0.08 0.006 285 / 0.85)", color: "oklch(0.52 0.24 25)", border: "1px solid oklch(0.52 0.24 25 / 0.4)" }}>
                {product.collectionTag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-7 flex flex-col">
            <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "8px" }}>
              {product.category}
            </p>
            <h3 style={{ fontFamily: "var(--font-display, serif)", fontSize: "22px", lineHeight: 1.2, color: "oklch(0.93 0.015 80)", marginBottom: "12px" }}>
              {product.name}
            </h3>
            <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "28px", color: "oklch(0.52 0.24 25)", marginBottom: "16px" }}>
              {formatINR(product.price)}
            </p>

            {product.description && (
              <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "14px", lineHeight: 1.7, color: "oklch(0.55 0.015 285)", marginBottom: "20px" }}>
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-2 mb-5">
                {product.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="font-mono-tech text-xs tracking-wider uppercase px-2 py-1"
                    style={{ border: "1px solid oklch(1 0 0 / 0.12)", color: "oklch(0.45 0.015 285)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "10px" }}>
                  Select Size {sizeError && <span style={{ color: "oklch(0.65 0.22 25)" }}>— Required</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className="px-4 py-2 font-mono-tech text-xs tracking-widest uppercase transition-all duration-150"
                      style={{
                        border: `1px solid ${selectedSize === size ? "oklch(0.52 0.24 25)" : "oklch(1 0 0 / 0.15)"}`,
                        backgroundColor: selectedSize === size ? "oklch(0.52 0.24 25 / 0.12)" : "transparent",
                        color: selectedSize === size ? "oklch(0.52 0.24 25)" : "oklch(0.55 0.015 285)",
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="mb-6">
              <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0.015 285)", marginBottom: "10px" }}>
                Quantity
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center" style={{ border: "1px solid oklch(1 0 0 / 0.15)" }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 transition-colors duration-150"
                    style={{ color: "oklch(0.55 0.015 285)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.015 285)"; }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: "36px", textAlign: "center", fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "oklch(0.87 0.02 80)", padding: "8px 4px" }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="px-3 py-2 transition-colors duration-150"
                    style={{ color: "oklch(0.55 0.015 285)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.015 285)"; }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {quantity > 1 && (
                  <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "18px", color: "oklch(0.52 0.24 25)" }}>
                    = {formatINR(totalAmount)}
                  </span>
                )}
              </div>
            </div>

            {/* Buy button */}
            <button
              onClick={handleCheckout}
              className="mt-auto flex items-center justify-center gap-3 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
              style={{ backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.52 0.24 25)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.45 0.22 25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
            >
              <ShoppingBag size={16} /> Buy Now · {formatINR(totalAmount)}
            </button>

            {upi && (
              <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.38 0.015 285)", textAlign: "center", marginTop: "10px" }}>
                Pay via UPI · {upi.upiId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Fallback Data ───────────────────────────────────────────────── */
const FALLBACK_PRODUCTS: DbProduct[] = [
  { id: 1, name: "Anamnesis — Regular Tee", category: "tees", price: 999, imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg", description: "The Anamnesis regular tee.", sizes: "S,M,L,XL,2XL,3XL", tags: "Signature,black", collectionTag: "Anamnesis", isActive: true, sortOrder: 1, shopifyUrl: null },
  { id: 2, name: "Anamnesis — Tank Top", category: "tanks", price: 899, imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg", description: "The Anamnesis tank top.", sizes: "S,M,L,XL,2XL", tags: "Signature,black", collectionTag: "Anamnesis", isActive: true, sortOrder: 2, shopifyUrl: null },
  { id: 3, name: "Ksetravid — Logo Tee", category: "tees", price: 799, imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/merch_anamnesis_tee_hd_e9accf90.jpg", description: "Classic logo tee.", sizes: "S,M,L,XL,2XL,3XL", tags: "Logo,black", collectionTag: null, isActive: true, sortOrder: 3, shopifyUrl: null },
];

const FALLBACK_UPI: UpiData = {
  upiId: "ksetravid@upi",
  accountName: "Ksetravid",
  qrCodeUrl: null,
  whatsappNumber: FALLBACK_WHATSAPP,
};

/* ── Main MerchSection ──────────────────────────────────────────── */
export default function MerchSection() {
  const { data: dbProducts, isLoading: productsLoading } = trpc.merch.list.useQuery(undefined, { retry: 1, retryDelay: 500 });
  const { data: upiData } = trpc.upi.get.useQuery(undefined, { retry: 1, retryDelay: 500 });

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);

  // Checkout flow state
  type CheckoutStep = "idle" | "delivery" | "payment" | "confirmed";
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");
  const [checkoutProduct, setCheckoutProduct] = useState<DbProduct | null>(null);
  const [checkoutSize, setCheckoutSize] = useState("");
  const [checkoutQty, setCheckoutQty] = useState(1);
  const [checkoutTxnRef, setCheckoutTxnRef] = useState("");
  const [checkoutOrderId, setCheckoutOrderId] = useState(0);
  const [checkoutDelivery, setCheckoutDelivery] = useState<DeliveryInfo>(EMPTY_DELIVERY);
  const [confirmedPayMethod, setConfirmedPayMethod] = useState<"razorpay" | "manual">("manual");

  const products = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) return dbProducts.filter(p => p.isActive);
    if (!productsLoading) return FALLBACK_PRODUCTS;
    return [];
  }, [dbProducts, productsLoading]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return [
      { key: "all", label: "All Items" },
      ...cats.map(c => ({ key: c, label: c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " ") })),
    ];
  }, [products]);

  const collections = useMemo(() => Array.from(new Set(products.map(p => p.collectionTag).filter(Boolean))), [products]);
  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);

  const upi: UpiData = upiData ? {
    upiId: upiData.upiId,
    accountName: upiData.accountName,
    qrCodeUrl: upiData.qrCodeUrl ?? null,
    whatsappNumber: upiData.whatsappNumber ?? FALLBACK_WHATSAPP,
  } : FALLBACK_UPI;

  function handleOpenCheckout(product: DbProduct, size: string, quantity: number) {
    setCheckoutProduct(product);
    setCheckoutSize(size);
    setCheckoutQty(quantity);
    setSelectedProduct(null);
    setCheckoutStep("delivery");
  }

  function handleCloseAll() {
    setSelectedProduct(null);
    setCheckoutStep("idle");
    setCheckoutProduct(null);
    setCheckoutSize("");
    setCheckoutQty(1);
    setCheckoutTxnRef("");
    setCheckoutOrderId(0);
    setCheckoutDelivery(EMPTY_DELIVERY);
  }

  function handleDeliveryNext(info: DeliveryInfo, txnRef: string, orderId: number) {
    setCheckoutDelivery(info);
    setCheckoutTxnRef(txnRef);
    setCheckoutOrderId(orderId);
    setCheckoutStep("payment");
  }

  function handlePaymentDone(method: "razorpay" | "manual") {
    setConfirmedPayMethod(method);
    setCheckoutStep("confirmed");
  }

  return (
    <>
      {/* Product Detail Modal */}
      {selectedProduct && checkoutStep === "idle" && (
        <ProductModal
          product={selectedProduct}
          upi={upi}
          onClose={handleCloseAll}
          onCheckout={(size, qty) => handleOpenCheckout(selectedProduct, size, qty)}
        />
      )}

      {/* Step 1: Delivery Info */}
      {checkoutStep === "delivery" && checkoutProduct && (
        <DeliveryForm
          product={checkoutProduct}
          size={checkoutSize}
          quantity={checkoutQty}
          upi={upi}
          onClose={handleCloseAll}
          onBack={() => { setCheckoutStep("idle"); setSelectedProduct(checkoutProduct); }}
          onNext={handleDeliveryNext}
        />
      )}

      {/* Step 2: Payment (Razorpay or Manual UPI) */}
      {checkoutStep === "payment" && checkoutProduct && checkoutTxnRef && (
        <PaymentModal
          product={checkoutProduct}
          size={checkoutSize}
          quantity={checkoutQty}
          upi={upi}
          txnRef={checkoutTxnRef}
          orderId={checkoutOrderId}
          deliveryInfo={checkoutDelivery}
          onClose={handleCloseAll}
          onDone={handlePaymentDone}
        />
      )}

      {/* Step 3: Confirmation */}
      {checkoutStep === "confirmed" && checkoutTxnRef && (
        <OrderConfirmedModal
          txnRef={checkoutTxnRef}
          paymentMethod={confirmedPayMethod}
          onClose={handleCloseAll}
        />
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
                className="font-mono-tech text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200"
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
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "oklch(0.12 0.006 285)" }}>
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {product.tags && product.tags.split(",")[0]?.trim() && (
                      <span className="absolute top-3 left-3 font-mono-tech text-xs tracking-wider uppercase px-2 py-1"
                        style={{ backgroundColor: "oklch(0.52 0.24 25)", color: "oklch(0.97 0.005 80)" }}>
                        {product.tags.split(",")[0].trim()}
                      </span>
                    )}
                  </div>
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
                      <span className="flex items-center gap-1 font-mono-tech text-xs tracking-widest uppercase transition-colors duration-200" style={{ color: "oklch(0.45 0.015 285)" }}>
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
