/* =============================================================
   KSETRAVID — ADMIN DASHBOARD
   Full admin control panel: Images, Merch, Tour, UPI, Credentials
   Design: Cosmic Tech-Death Noir
   ============================================================= */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Image, ShoppingBag, MapPin, CreditCard, Settings,
  LogOut, Plus, Trash2, Edit2, Save, X, Download,
  Upload, ChevronLeft, ChevronRight, Eye, EyeOff,
  Check, AlertTriangle, RefreshCw, ClipboardList, Package, Phone, MapPinned, ChevronDown, ChevronUp, Users
} from "lucide-react";

// ── Styles ────────────────────────────────────────────────────────────────────
const BG = "oklch(0.06 0.005 285)";
const SURFACE = "oklch(0.09 0.008 285)";
const SURFACE2 = "oklch(0.12 0.008 285)";
const BORDER = "oklch(0.18 0.01 285)";
const CRIMSON = "oklch(0.52 0.24 25)";
const CRIMSON_DIM = "oklch(0.42 0.22 25)";
const TEXT = "oklch(0.87 0.02 80)";
const TEXT_DIM = "oklch(0.55 0.015 285)";
const LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png";

type Section = "images" | "merch" | "tour" | "upi" | "credentials" | "orders" | "band";

// ── Shared Input ──────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder = "", required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>
        {label}{required && <span style={{ color: CRIMSON }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm font-mono outline-none transition-colors"
        style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
        onFocus={e => { e.currentTarget.style.borderColor = CRIMSON_DIM; }}
        onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
      />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, small = false, className = "" }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "outline";
  disabled?: boolean; small?: boolean; className?: string;
}) {
  const base = `font-mono tracking-wider uppercase transition-all duration-200 flex items-center gap-2 disabled:opacity-40 ${small ? "text-[10px] px-3 py-1.5" : "text-xs px-4 py-2"}`;
  const styles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: CRIMSON_DIM, color: TEXT, border: `1px solid ${CRIMSON}` },
    ghost: { backgroundColor: "transparent", color: TEXT_DIM, border: `1px solid ${BORDER}` },
    danger: { backgroundColor: "oklch(0.35 0.2 25)", color: TEXT, border: "1px solid oklch(0.52 0.24 25)" },
    outline: { backgroundColor: "transparent", color: TEXT, border: `1px solid ${CRIMSON_DIM}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

// ── Image Upload Widget ───────────────────────────────────────────────────────
function ImageUploader({ currentUrl, onUploaded, folder = "site-images" }: {
  currentUrl: string; onUploaded: (url: string) => void; folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  // Sync preview when parent navigates to a different image slot
  useEffect(() => { setPreview(currentUrl); }, [currentUrl]);
  const uploadMutation = trpc.upload.uploadFile.useMutation({
    onError: err => { toast.error("Upload failed: " + err.message); setUploading(false); }
  });

  function openPicker() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      setPreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const res = await uploadMutation.mutateAsync({ base64, filename: file.name, contentType: file.type || "image/jpeg", folder });
          setPreview(res.url);
          onUploaded(res.url);
          toast.success("Image uploaded");
        } finally { setUploading(false); }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function downloadImage() {
    const a = document.createElement("a");
    a.href = preview;
    a.download = preview.split("/").pop() || "image.jpg";
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video overflow-hidden" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: TEXT_DIM }}>
            <Image size={32} />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.8)" }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: CRIMSON }} />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Btn onClick={openPicker} disabled={uploading} small>
          <Upload size={12} /> {uploading ? "Uploading..." : "Replace Image"}
        </Btn>
        {preview && (
          <Btn onClick={downloadImage} variant="ghost" small>
            <Download size={12} /> Download
          </Btn>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: IMAGE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
const SITE_IMAGE_REGISTRY = [
  { key: "logo", label: "Logo", section: "Global", desc: "Navbar + Hero + Footer logo" },
  { key: "hero_bg", label: "Hero Background", section: "Hero", desc: "Full-bleed cosmic background" },
  { key: "hero_band_photo", label: "Hero Band Photo", section: "Hero", desc: "Band photo on right side" },
  { key: "about_bg", label: "About Background", section: "About", desc: "Background texture in About section" },
  { key: "about_band_outdoor", label: "Band Photo (Outdoor)", section: "About", desc: "Left photo in About grid" },
  { key: "about_band_bw", label: "Band Photo (B&W)", section: "About", desc: "Right photo in About grid" },
  { key: "gallery_1", label: "Gallery Photo 1", section: "Gallery", desc: "Gallery grid slot 1" },
  { key: "gallery_2", label: "Gallery Photo 2", section: "Gallery", desc: "Gallery grid slot 2" },
  { key: "gallery_3", label: "Gallery Photo 3", section: "Gallery", desc: "Gallery grid slot 3" },
  { key: "gallery_4", label: "Gallery Photo 4", section: "Gallery", desc: "Gallery grid slot 4" },
  { key: "gallery_5", label: "Gallery Photo 5", section: "Gallery", desc: "Gallery grid slot 5" },
  { key: "gallery_6", label: "Gallery Photo 6", section: "Gallery", desc: "Gallery grid slot 6" },
  { key: "tour_bg", label: "Tour Background", section: "Tour", desc: "Background behind tour dates" },
  { key: "member_pritam", label: "Pritam Middey (Guitars)", section: "Members", desc: "Member photo in About section" },
  { key: "member_arunav", label: "Arunav Bhattacharjee (Bass)", section: "Members", desc: "Member photo in About section" },
  { key: "member_nikhil", label: "Nikhil TR (Drums)", section: "Members", desc: "Member photo in About section" },
];

function ImageManager() {
  const { data: images, refetch } = trpc.images.list.useQuery();
  const updateMutation = trpc.images.update.useMutation({ onSuccess: () => refetch() });
  const [currentIdx, setCurrentIdx] = useState(0);

  const current = SITE_IMAGE_REGISTRY[currentIdx];
  const dbImage = images?.find(img => img.key === current.key);
  const currentUrl = dbImage?.url ?? "";

  function handleUploaded(url: string) {
    updateMutation.mutate({
      id: dbImage?.id,
      key: current.key,
      label: current.label,
      section: current.section,
      url,
      altText: current.label,
    });
  }

  function downloadAll() {
    if (!images || images.length === 0) { toast.error("No images in database yet"); return; }
    const data = JSON.stringify(images.map(img => ({ key: img.key, label: img.label, section: img.section, url: img.url })), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ksetravid-site-images.json";
    a.click();
    toast.success("Image data downloaded");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>Image Manager</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>Replace any site image. Changes go live immediately.</p>
        </div>
        <Btn onClick={downloadAll} variant="ghost" small><Download size={12} /> Export All</Btn>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {SITE_IMAGE_REGISTRY.map((img, i) => (
          <button
            key={img.key}
            onClick={() => setCurrentIdx(i)}
            className="flex-shrink-0 px-3 py-1.5 text-[10px] font-mono tracking-wider uppercase transition-all"
            style={{
              backgroundColor: i === currentIdx ? CRIMSON_DIM : SURFACE2,
              border: `1px solid ${i === currentIdx ? CRIMSON : BORDER}`,
              color: i === currentIdx ? TEXT : TEXT_DIM,
            }}
          >
            {img.section} / {img.label.split(" ").slice(-1)[0]}
          </button>
        ))}
      </div>

      {/* Current image editor */}
      <div className="grid md:grid-cols-2 gap-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
        <div>
          <div className="mb-4">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: CRIMSON }}>
              {current.section}
            </p>
            <h3 className="font-display text-xl tracking-wider" style={{ color: TEXT }}>{current.label}</h3>
            <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>{current.desc}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <Btn onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} variant="ghost" small disabled={currentIdx === 0}>
              <ChevronLeft size={12} /> Prev
            </Btn>
            <span className="flex items-center text-xs font-mono px-3" style={{ color: TEXT_DIM }}>
              {currentIdx + 1} / {SITE_IMAGE_REGISTRY.length}
            </span>
            <Btn onClick={() => setCurrentIdx(Math.min(SITE_IMAGE_REGISTRY.length - 1, currentIdx + 1))} variant="ghost" small disabled={currentIdx === SITE_IMAGE_REGISTRY.length - 1}>
              Next <ChevronRight size={12} />
            </Btn>
          </div>
          {currentUrl && (
            <p className="text-[10px] font-mono break-all" style={{ color: TEXT_DIM }}>
              Current: {currentUrl.split("/").pop()}
            </p>
          )}
        </div>
        <ImageUploader currentUrl={currentUrl} onUploaded={handleUploaded} folder="site-images" />
      </div>

      {/* All images grid */}
      <div className="mt-8">
        <h3 className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{ color: TEXT_DIM }}>All Images Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SITE_IMAGE_REGISTRY.map((reg, i) => {
            const dbImg = images?.find(img => img.key === reg.key);
            return (
              <div
                key={reg.key}
                onClick={() => setCurrentIdx(i)}
                className="cursor-pointer group"
                style={{ border: `1px solid ${i === currentIdx ? CRIMSON : BORDER}` }}
              >
                <div className="aspect-video overflow-hidden" style={{ backgroundColor: SURFACE2 }}>
                  {dbImg?.url ? (
                    <img src={dbImg.url} alt={reg.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={20} style={{ color: TEXT_DIM }} />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-mono truncate" style={{ color: TEXT }}>{reg.label}</p>
                  <p className="text-[9px] font-mono" style={{ color: TEXT_DIM }}>{reg.section}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: MERCH EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
type MerchProduct = {
  id?: number; name: string; category: string; price: number; imageUrl: string;
  description: string; sizes: string; tags: string; collectionTag: string;
  isActive: boolean; sortOrder: number; shopifyUrl: string;
};

const EMPTY_PRODUCT: MerchProduct = {
  name: "", category: "tees", price: 0, imageUrl: "", description: "",
  sizes: "S,M,L,XL,2XL", tags: "", collectionTag: "", isActive: true, sortOrder: 0, shopifyUrl: "",
};

function MerchEditor() {
  const { data: products, refetch } = trpc.merch.list.useQuery();
  const saveMutation = trpc.merch.save.useMutation({ onSuccess: () => { refetch(); setEditing(null); toast.success("Product saved"); } });
  const deleteMutation = trpc.merch.delete.useMutation({ onSuccess: () => { refetch(); toast.success("Product deleted"); } });

  const [editing, setEditing] = useState<MerchProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Derive dynamic categories and tags from all products
  const allCategories = Array.from(new Set([
    "tees", "tanks", "shorts", "crop-tops", "hoodies",
    ...(products?.map(p => p.category) ?? [])
  ])).filter(Boolean);
  const allTags = Array.from(new Set(
    (products ?? []).flatMap(p => p.tags.split(",").map(t => t.trim())).filter(Boolean)
  ));

  function startEdit(p: MerchProduct) {
    setEditing({ ...p });
  }

  function startNew() {
    setEditing({ ...EMPTY_PRODUCT });
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.name || !editing.imageUrl || editing.price < 0) {
      toast.error("Name, image, and price are required");
      return;
    }
    saveMutation.mutate({
      id: editing.id,
      name: editing.name,
      category: editing.category,
      price: editing.price,
      imageUrl: editing.imageUrl,
      description: editing.description || null,
      sizes: editing.sizes,
      tags: editing.tags,
      collectionTag: editing.collectionTag || null,
      isActive: editing.isActive,
      sortOrder: editing.sortOrder,
      shopifyUrl: editing.shopifyUrl || null,
    });
  }

  function downloadData() {
    if (!products) return;
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ksetravid-merch-products.json";
    a.click();
    toast.success("Merch data downloaded");
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Btn onClick={() => setEditing(null)} variant="ghost" small><ChevronLeft size={12} /> Back</Btn>
          <h2 className="font-display text-xl tracking-widest uppercase" style={{ color: TEXT }}>
            {editing.id ? "Edit Product" : "New Product"}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Product Name" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} required />
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>
                Category <span style={{ color: CRIMSON }}>*</span>
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setEditing({ ...editing, category: cat })}
                    className="px-3 py-1 text-[10px] font-mono uppercase"
                    style={{
                      backgroundColor: editing.category === cat ? CRIMSON_DIM : SURFACE2,
                      border: `1px solid ${editing.category === cat ? CRIMSON : BORDER}`,
                      color: editing.category === cat ? TEXT : TEXT_DIM,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type a new category..."
                value={editing.category}
                onChange={e => setEditing({ ...editing, category: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full px-3 py-2 text-sm font-mono outline-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
              />
              <p className="text-[9px] font-mono mt-1" style={{ color: TEXT_DIM }}>New categories auto-appear as filter tabs on the website</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Price (INR) <span style={{ color: CRIMSON }}>*</span></label>
                <input
                  type="number"
                  value={editing.price}
                  onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Sort Order</label>
                <input
                  type="number"
                  value={editing.sortOrder}
                  onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Sizes (comma-separated)</label>
              <input
                type="text"
                value={editing.sizes}
                onChange={e => setEditing({ ...editing, sizes: e.target.value })}
                placeholder="S,M,L,XL,2XL or 28,30,32,34"
                className="w-full px-3 py-2 text-sm font-mono outline-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={editing.tags}
                onChange={e => setEditing({ ...editing, tags: e.target.value })}
                placeholder="graphic, black, summer, limited"
                className="w-full px-3 py-2 text-sm font-mono outline-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
              />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const current = editing.tags.split(",").map(t => t.trim()).filter(Boolean);
                        if (current.includes(tag)) return;
                        setEditing({ ...editing, tags: [...current, tag].join(", ") });
                      }}
                      className="px-2 py-0.5 text-[9px] font-mono"
                      style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT_DIM }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input label="Collection / Series" value={editing.collectionTag} onChange={v => setEditing({ ...editing, collectionTag: v })} placeholder="Anamnesis, Berserker, Nomad..." />
            <Input label="Shopify URL (optional)" value={editing.shopifyUrl} onChange={v => setEditing({ ...editing, shopifyUrl: v })} placeholder="https://ksetravid.myshopify.com/..." />
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Description</label>
              <textarea
                value={editing.description}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm font-mono outline-none resize-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                placeholder="Product description..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                className="flex items-center gap-2 text-xs font-mono"
                style={{ color: editing.isActive ? CRIMSON : TEXT_DIM }}
              >
                <div className="w-8 h-4 rounded-full relative transition-colors" style={{ backgroundColor: editing.isActive ? CRIMSON_DIM : SURFACE2, border: `1px solid ${editing.isActive ? CRIMSON : BORDER}` }}>
                  <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all" style={{ left: editing.isActive ? "calc(100% - 14px)" : "2px", backgroundColor: editing.isActive ? CRIMSON : TEXT_DIM }} />
                </div>
                {editing.isActive ? "Visible on website" : "Hidden from website"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-2" style={{ color: TEXT_DIM }}>Product Image <span style={{ color: CRIMSON }}>*</span></label>
            <ImageUploader
              currentUrl={editing.imageUrl}
              onUploaded={url => setEditing({ ...editing, imageUrl: url })}
              folder="merch"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
          <Btn onClick={handleSave} disabled={saveMutation.isPending}>
            <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save Product"}
          </Btn>
          <Btn onClick={() => setEditing(null)} variant="ghost"><X size={14} /> Cancel</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>Merch Products</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>{products?.length ?? 0} products · New categories auto-add to website filters</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={downloadData} variant="ghost" small><Download size={12} /> Export</Btn>
          <Btn onClick={startNew} small><Plus size={12} /> Add Product</Btn>
        </div>
      </div>

      {/* Category summary */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
          <span className="text-[10px] font-mono uppercase" style={{ color: TEXT_DIM }}>Active filters on website:</span>
          {allCategories.map(cat => (
            <span key={cat} className="px-2 py-0.5 text-[10px] font-mono uppercase" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}>
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {(products ?? []).map(product => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, opacity: product.isActive ? 1 : 0.5 }}
          >
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: SURFACE2 }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={20} style={{ color: TEXT_DIM }} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm truncate" style={{ color: TEXT }}>{product.name}</p>
                {!product.isActive && <span className="text-[9px] font-mono px-1.5 py-0.5" style={{ backgroundColor: SURFACE2, color: TEXT_DIM, border: `1px solid ${BORDER}` }}>HIDDEN</span>}
              </div>
              <p className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {product.category} · ₹{product.price} · {product.collectionTag || "—"}
              </p>
              <p className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                Sizes: {product.sizes}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Btn onClick={() => startEdit(product as MerchProduct)} variant="ghost" small><Edit2 size={12} /></Btn>
              {confirmDelete === product.id ? (
                <div className="flex gap-1">
                  <Btn onClick={() => { deleteMutation.mutate({ id: product.id! }); setConfirmDelete(null); }} variant="danger" small><Check size={12} /></Btn>
                  <Btn onClick={() => setConfirmDelete(null)} variant="ghost" small><X size={12} /></Btn>
                </div>
              ) : (
                <Btn onClick={() => setConfirmDelete(product.id!)} variant="ghost" small><Trash2 size={12} /></Btn>
              )}
            </div>
          </div>
        ))}
        {(products ?? []).length === 0 && (
          <div className="py-12 text-center" style={{ border: `1px dashed ${BORDER}` }}>
            <ShoppingBag size={32} className="mx-auto mb-3" style={{ color: TEXT_DIM }} />
            <p className="font-mono text-sm" style={{ color: TEXT_DIM }}>No products yet. Click "Add Product" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: TOUR DATES
// ═══════════════════════════════════════════════════════════════════════════════
type TourDate = { id?: number; date: string; city: string; venue: string; country: string; ticketUrl: string; isSoldOut: boolean; isPast: boolean; sortOrder: number; };
const EMPTY_TOUR: TourDate = { date: "", city: "", venue: "", country: "India", ticketUrl: "", isSoldOut: false, isPast: false, sortOrder: 0 };

function TourEditor() {
  const { data: shows, refetch } = trpc.tour.list.useQuery();
  const saveMutation = trpc.tour.save.useMutation({ onSuccess: () => { refetch(); setEditing(null); toast.success("Show saved"); } });
  const deleteMutation = trpc.tour.delete.useMutation({ onSuccess: () => { refetch(); toast.success("Show deleted"); } });
  const [editing, setEditing] = useState<TourDate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  function downloadData() {
    if (!shows) return;
    const blob = new Blob([JSON.stringify(shows, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ksetravid-tour-dates.json";
    a.click();
    toast.success("Tour data downloaded");
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Btn onClick={() => setEditing(null)} variant="ghost" small><ChevronLeft size={12} /> Back</Btn>
          <h2 className="font-display text-xl tracking-widest uppercase" style={{ color: TEXT }}>{editing.id ? "Edit Show" : "New Show"}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 p-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
          <Input label="Date" value={editing.date} onChange={v => setEditing({ ...editing, date: v })} placeholder="15 Mar 2025" required />
          <Input label="City" value={editing.city} onChange={v => setEditing({ ...editing, city: v })} required />
          <Input label="Venue" value={editing.venue} onChange={v => setEditing({ ...editing, venue: v })} required />
          <Input label="Country" value={editing.country} onChange={v => setEditing({ ...editing, country: v })} />
          <Input label="Ticket URL" value={editing.ticketUrl} onChange={v => setEditing({ ...editing, ticketUrl: v })} placeholder="https://..." />
          <Input label="Sort Order" value={String(editing.sortOrder)} onChange={v => setEditing({ ...editing, sortOrder: Number(v) })} type="number" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-mono cursor-pointer" style={{ color: TEXT }}>
              <input type="checkbox" checked={editing.isSoldOut} onChange={e => setEditing({ ...editing, isSoldOut: e.target.checked })} />
              Sold Out
            </label>
            <label className="flex items-center gap-2 text-xs font-mono cursor-pointer" style={{ color: TEXT }}>
              <input type="checkbox" checked={editing.isPast} onChange={e => setEditing({ ...editing, isPast: e.target.checked })} />
              Past Show
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Btn onClick={() => saveMutation.mutate({ ...editing, ticketUrl: editing.ticketUrl || null })} disabled={saveMutation.isPending}>
            <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save Show"}
          </Btn>
          <Btn onClick={() => setEditing(null)} variant="ghost"><X size={14} /> Cancel</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>Tour Dates</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>{shows?.length ?? 0} shows</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={downloadData} variant="ghost" small><Download size={12} /> Export</Btn>
          <Btn onClick={() => setEditing({ ...EMPTY_TOUR })} small><Plus size={12} /> Add Show</Btn>
        </div>
      </div>
      <div className="space-y-2">
        {(shows ?? []).map(show => (
          <div key={show.id} className="flex items-center gap-4 p-4" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, opacity: show.isPast ? 0.6 : 1 }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-sm" style={{ color: TEXT }}>{show.date} — {show.city}</p>
                {show.isSoldOut && <span className="text-[9px] font-mono px-1.5 py-0.5" style={{ backgroundColor: "oklch(0.35 0.2 25)", color: TEXT, border: `1px solid ${CRIMSON}` }}>SOLD OUT</span>}
                {show.isPast && <span className="text-[9px] font-mono px-1.5 py-0.5" style={{ backgroundColor: SURFACE2, color: TEXT_DIM, border: `1px solid ${BORDER}` }}>PAST</span>}
              </div>
              <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>{show.venue} · {show.country}</p>
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => setEditing(show as TourDate)} variant="ghost" small><Edit2 size={12} /></Btn>
              {confirmDelete === show.id ? (
                <div className="flex gap-1">
                  <Btn onClick={() => { deleteMutation.mutate({ id: show.id! }); setConfirmDelete(null); }} variant="danger" small><Check size={12} /></Btn>
                  <Btn onClick={() => setConfirmDelete(null)} variant="ghost" small><X size={12} /></Btn>
                </div>
              ) : (
                <Btn onClick={() => setConfirmDelete(show.id!)} variant="ghost" small><Trash2 size={12} /></Btn>
              )}
            </div>
          </div>
        ))}
        {(shows ?? []).length === 0 && (
          <div className="py-12 text-center" style={{ border: `1px dashed ${BORDER}` }}>
            <MapPin size={32} className="mx-auto mb-3" style={{ color: TEXT_DIM }} />
            <p className="font-mono text-sm" style={{ color: TEXT_DIM }}>No shows yet. Click "Add Show" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: UPI SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function UpiSettings() {
  const { data: upi, refetch } = trpc.upi.get.useQuery();
  const saveMutation = trpc.upi.save.useMutation({ onSuccess: () => { refetch(); toast.success("UPI settings saved"); } });
  const [form, setForm] = useState({ upiId: "", accountName: "", qrCodeUrl: "", whatsappNumber: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (upi && !loaded) {
      setForm({ upiId: upi.upiId, accountName: upi.accountName, qrCodeUrl: upi.qrCodeUrl ?? "", whatsappNumber: (upi as any).whatsappNumber ?? "" });
      setLoaded(true);
    }
  }, [upi, loaded]);

  function downloadData() {
    const blob = new Blob([JSON.stringify(upi, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ksetravid-upi-settings.json";
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>UPI / Payment</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>Controls the checkout modal in the Merch section</p>
        </div>
        <Btn onClick={downloadData} variant="ghost" small><Download size={12} /> Export</Btn>
      </div>
      <div className="grid md:grid-cols-2 gap-6 p-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="space-y-4">
          <Input label="UPI ID" value={form.upiId} onChange={v => setForm({ ...form, upiId: v })} placeholder="yourname@bank" required />
          <Input label="Account Name" value={form.accountName} onChange={v => setForm({ ...form, accountName: v })} placeholder="Full name on UPI account" required />
          <Input label="WhatsApp Number (with country code)" value={form.whatsappNumber} onChange={v => setForm({ ...form, whatsappNumber: v })} placeholder="919876543210" />
          <Input label="QR Code Image URL (optional)" value={form.qrCodeUrl} onChange={v => setForm({ ...form, qrCodeUrl: v })} placeholder="https://..." />
          <Btn onClick={() => saveMutation.mutate({ upiId: form.upiId, accountName: form.accountName, qrCodeUrl: form.qrCodeUrl || null, whatsappNumber: form.whatsappNumber || null })} disabled={saveMutation.isPending}>
            <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save UPI Settings"}
          </Btn>
        </div>
        <div>
          <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-2" style={{ color: TEXT_DIM }}>QR Code Image</label>
          <ImageUploader
            currentUrl={form.qrCodeUrl}
            onUploaded={url => setForm({ ...form, qrCodeUrl: url })}
            folder="upi"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════════
function CredentialsSettings() {
  const { data: usernameData } = trpc.admin.getUsername.useQuery();
  const updateMutation = trpc.admin.updateCredentials.useMutation({
    onSuccess: () => {
      toast.success("Credentials updated. Use new login next time.");
      setForm({ newUsername: "", newPassword: "", confirmPassword: "" });
    },
    onError: err => toast.error(err.message),
  });
  const [form, setForm] = useState({ newUsername: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);

  function handleSave() {
    if (!form.newUsername || !form.newPassword) { toast.error("Both fields required"); return; }
    if (form.newPassword !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    updateMutation.mutate({ newUsername: form.newUsername, newPassword: form.newPassword });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>Admin Credentials</h2>
        <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>
          Current username: <span style={{ color: CRIMSON }}>{usernameData?.username ?? "—"}</span>
        </p>
      </div>
      <div className="p-6 max-w-md" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="flex items-start gap-3 p-3 mb-6" style={{ backgroundColor: "oklch(0.35 0.2 25 / 0.15)", border: `1px solid ${CRIMSON_DIM}` }}>
          <AlertTriangle size={16} style={{ color: CRIMSON, flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs font-mono" style={{ color: TEXT }}>
            Once saved, the old username and password are permanently gone. You must use the new credentials for every future login.
          </p>
        </div>
        <div className="space-y-4">
          <Input label="New Username" value={form.newUsername} onChange={v => setForm({ ...form, newUsername: v })} placeholder="At least 3 characters" required />
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>New Password <span style={{ color: CRIMSON }}>*</span></label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 pr-16 text-sm font-mono outline-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {showPw ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Confirm Password <span style={{ color: CRIMSON }}>*</span></label>
            <input
              type={showPw ? "text" : "password"}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 text-sm font-mono outline-none"
              style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
            />
          </div>
          <Btn onClick={handleSave} disabled={updateMutation.isPending} variant="danger">
            <Save size={14} /> {updateMutation.isPending ? "Saving..." : "Replace Credentials"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: ORDERS
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_COLORS: Record<string, string> = {
  pending:   "oklch(0.65 0.18 60)",
  paid:      "oklch(0.65 0.18 150)",
  confirmed: "oklch(0.55 0.22 260)",
  shipped:   "oklch(0.55 0.22 200)",
  delivered: "oklch(0.55 0.22 140)",
  cancelled: "oklch(0.52 0.24 25)",
};

const STATUS_OPTIONS = ["pending","paid","confirmed","shipped","delivered","cancelled"] as const;

function OrdersSection() {
  const { data: orders, refetch, isLoading } = trpc.orders.list.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation({ onSuccess: () => { refetch(); toast.success("Status updated"); } });
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = orders?.filter(o => filter === "all" || o.paymentStatus === filter) ?? [];

  function downloadOrders() {
    if (!orders || orders.length === 0) { toast.error("No orders yet"); return; }
    const csv = [
      ["Txn Ref","Buyer","Phone","Email","Address","City","State","Pincode","Product","Category","Size","Qty","Unit Price","Total","UPI ID","Status","Date"].join(","),
      ...orders.map(o => [
        o.txnRef, o.buyerName, o.buyerPhone, o.buyerEmail ?? "",
        `"${o.addressLine1}${o.addressLine2 ? " " + o.addressLine2 : ""}"`,
        o.city, o.state, o.pincode,
        o.productName, o.productCategory, o.selectedSize ?? "", o.quantity, o.unitPrice, o.totalAmount,
        o.upiId, o.paymentStatus,
        new Date(o.createdAt).toLocaleString()
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ksetravid-orders-${Date.now()}.csv`;
    a.click();
    toast.success("Orders CSV downloaded");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl tracking-widest uppercase" style={{ color: TEXT }}>Orders</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>All customer orders and transaction records</p>
        </div>
        <Btn onClick={downloadOrders} variant="ghost" small>
          <Download size={12} /> Export CSV
        </Btn>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 transition-all"
            style={{
              backgroundColor: filter === s ? (STATUS_COLORS[s] ?? CRIMSON_DIM) : SURFACE2,
              border: `1px solid ${filter === s ? (STATUS_COLORS[s] ?? CRIMSON) : BORDER}`,
              color: TEXT,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin" style={{ color: CRIMSON }} />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: TEXT_DIM }}>
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-mono text-sm">No orders {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
            {/* Order header row */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[order.paymentStatus] + "33", border: `1px solid ${STATUS_COLORS[order.paymentStatus]}`, color: STATUS_COLORS[order.paymentStatus] }}
                >
                  {order.paymentStatus}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate" style={{ color: TEXT }}>{order.txnRef}</p>
                  <p className="text-[10px] font-mono truncate" style={{ color: TEXT_DIM }}>{order.buyerName} · {order.productName} × {order.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-mono font-bold" style={{ color: CRIMSON }}>₹{order.totalAmount}</span>
                {expanded === order.id ? <ChevronUp size={14} style={{ color: TEXT_DIM }} /> : <ChevronDown size={14} style={{ color: TEXT_DIM }} />}
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === order.id && (
              <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {/* Buyer */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Buyer</p>
                    <p className="text-sm font-mono" style={{ color: TEXT }}>{order.buyerName}</p>
                    <p className="text-xs font-mono flex items-center gap-1" style={{ color: TEXT_DIM }}><Phone size={10} />{order.buyerPhone}</p>
                    {order.buyerEmail && <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>{order.buyerEmail}</p>}
                  </div>
                  {/* Delivery address */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Delivery Address</p>
                    <p className="text-xs font-mono" style={{ color: TEXT }}>{order.addressLine1}</p>
                    {order.addressLine2 && <p className="text-xs font-mono" style={{ color: TEXT }}>{order.addressLine2}</p>}
                    <p className="text-xs font-mono flex items-center gap-1" style={{ color: TEXT_DIM }}><MapPinned size={10} />{order.city}, {order.state} — {order.pincode}</p>
                  </div>
                  {/* Product */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Product</p>
                    <p className="text-sm font-mono" style={{ color: TEXT }}>{order.productName}</p>
                    <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>{order.productCategory}{order.selectedSize ? ` · Size: ${order.selectedSize}` : ""} · Qty: {order.quantity}</p>
                    <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>₹{order.unitPrice} × {order.quantity} = <span style={{ color: CRIMSON }}>₹{order.totalAmount}</span></p>
                  </div>
                  {/* Payment */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Payment</p>
                    {/* Payment method badge */}
                    {(order as any).razorpayPaymentId ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5" style={{ backgroundColor: "oklch(0.65 0.18 145 / 0.12)", border: "1px solid oklch(0.65 0.18 145 / 0.35)", color: "oklch(0.65 0.18 145)" }}>✓ Razorpay — Auto Confirmed</span>
                    ) : (order as any).utrNumber ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5" style={{ backgroundColor: "oklch(0.62 0.18 60 / 0.10)", border: "1px solid oklch(0.62 0.18 60 / 0.35)", color: "oklch(0.62 0.18 60)" }}>⏳ Manual UPI — Verify UTR</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5" style={{ backgroundColor: "oklch(0.45 0.015 285 / 0.15)", border: "1px solid oklch(0.45 0.015 285 / 0.35)", color: "oklch(0.50 0.015 285)" }}>⚠ Awaiting Payment</span>
                    )}
                    <p className="text-xs font-mono" style={{ color: TEXT }}>UPI: {order.upiId}</p>
                    <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>Ref: {order.txnRef}</p>
                    {/* UTR number for manual payments */}
                    {(order as any).utrNumber && (
                      <p className="text-xs font-mono" style={{ color: "oklch(0.62 0.18 60)" }}>UTR: {(order as any).utrNumber}</p>
                    )}
                    {/* Razorpay IDs for auto-confirmed payments */}
                    {(order as any).razorpayPaymentId && (
                      <p className="text-xs font-mono" style={{ color: "oklch(0.65 0.18 145)" }}>RZP: {(order as any).razorpayPaymentId}</p>
                    )}
                    {order.paymentNote && <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>{order.paymentNote}</p>}
                  </div>
                  {/* Date */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Order Date</p>
                    <p className="text-xs font-mono" style={{ color: TEXT }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  {/* Admin notes */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Admin Notes</p>
                    <p className="text-xs font-mono" style={{ color: TEXT_DIM }}>{order.adminNotes || "—"}</p>
                  </div>
                </div>

                {/* Status updater */}
                <div className="flex flex-wrap items-center gap-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: TEXT_DIM }}>Update Status:</span>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus.mutate({ id: order.id, paymentStatus: s })}
                      disabled={order.paymentStatus === s || updateStatus.isPending}
                      className="text-[9px] font-mono tracking-widest uppercase px-2 py-1 transition-all disabled:opacity-30"
                      style={{
                        backgroundColor: order.paymentStatus === s ? STATUS_COLORS[s] + "44" : SURFACE2,
                        border: `1px solid ${order.paymentStatus === s ? STATUS_COLORS[s] : BORDER}`,
                        color: order.paymentStatus === s ? STATUS_COLORS[s] : TEXT_DIM,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAND EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function BandEditor() {
  const utils = trpc.useUtils();
  const { data: members = [], isLoading: membersLoading } = trpc.band.getMembers.useQuery();
  const { data: alert, isLoading: alertLoading } = trpc.band.getAlert.useQuery();

  // Member editing state
  const [editingMember, setEditingMember] = useState<{
    id?: number; name: string; role: string; photoUrl: string; bio: string; isActive: boolean; sortOrder: number;
  } | null>(null);

  const upsertMember = trpc.band.upsertMember.useMutation({
    onSuccess: () => { utils.band.getMembers.invalidate(); setEditingMember(null); toast.success("Member saved"); },
    onError: (e) => toast.error("Save failed: " + e.message),
  });
  const deleteMember = trpc.band.deleteMember.useMutation({
    onSuccess: () => { utils.band.getMembers.invalidate(); toast.success("Member removed"); },
    onError: (e) => toast.error("Delete failed: " + e.message),
  });

  // Alert editing state
  const [alertForm, setAlertForm] = useState({ message: "", alertType: "recruiting", isActive: true });
  const [alertInitialized, setAlertInitialized] = useState(false);
  useEffect(() => {
    if (alert && !alertInitialized) {
      setAlertForm({ message: alert.message, alertType: alert.alertType ?? "recruiting", isActive: alert.isActive });
      setAlertInitialized(true);
    }
  }, [alert, alertInitialized]);

  const saveAlert = trpc.band.saveAlert.useMutation({
    onSuccess: () => { utils.band.getAlert.invalidate(); toast.success("Alert updated"); },
    onError: (e) => toast.error("Save failed: " + e.message),
  });

  function startAdd() {
    setEditingMember({ name: "", role: "", photoUrl: "", bio: "", isActive: true, sortOrder: members.length });
  }
  function startEdit(m: typeof members[0]) {
    setEditingMember({ id: m.id, name: m.name, role: m.role, photoUrl: m.photoUrl ?? "", bio: m.bio ?? "", isActive: m.isActive, sortOrder: m.sortOrder });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest uppercase" style={{ color: TEXT }}>Band Members</h2>
          <p className="text-xs font-mono mt-1" style={{ color: TEXT_DIM }}>Manage members and the recruitment alert on the homepage.</p>
        </div>
        <Btn onClick={startAdd}><Plus size={12} /> Add Member</Btn>
      </div>

      {/* Member list */}
      {membersLoading ? (
        <div className="flex justify-center py-8"><RefreshCw size={20} className="animate-spin" style={{ color: CRIMSON }} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {members.map(m => (
            <div key={m.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="aspect-square overflow-hidden" style={{ backgroundColor: SURFACE2 }}>
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-display" style={{ color: TEXT_DIM }}>{m.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-display text-sm tracking-wider" style={{ color: TEXT }}>{m.name}</p>
                <p className="text-[10px] font-mono tracking-widest uppercase mt-0.5" style={{ color: CRIMSON }}>{m.role}</p>
                {m.bio && <p className="text-xs font-mono mt-1 line-clamp-2" style={{ color: TEXT_DIM }}>{m.bio}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5"
                    style={{ backgroundColor: m.isActive ? "oklch(0.35 0.15 145 / 0.3)" : "oklch(0.35 0.1 25 / 0.3)", color: m.isActive ? "oklch(0.7 0.15 145)" : TEXT_DIM, border: `1px solid ${m.isActive ? "oklch(0.5 0.15 145)" : BORDER}` }}
                  >{m.isActive ? "Active" : "Inactive"}</span>
                  <div className="flex gap-1 ml-auto">
                    <Btn onClick={() => startEdit(m)} variant="ghost" small><Edit2 size={10} /></Btn>
                    <Btn onClick={() => { if (confirm(`Remove ${m.name}?`)) deleteMember.mutate({ id: m.id }); }} variant="danger" small><Trash2 size={10} /></Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="col-span-3 py-12 text-center">
              <p className="font-mono text-xs" style={{ color: TEXT_DIM }}>No members yet. Click "Add Member" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit member form */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.9)" }}>
          <div className="w-full max-w-lg overflow-y-auto max-h-[90vh]" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg tracking-wider" style={{ color: TEXT }}>{editingMember.id ? "Edit Member" : "Add Member"}</h3>
              <Btn onClick={() => setEditingMember(null)} variant="ghost" small><X size={12} /></Btn>
            </div>
            <div className="space-y-4">
              <Input label="Name *" value={editingMember.name} onChange={v => setEditingMember({ ...editingMember, name: v })} placeholder="Full name" required />
              <Input label="Role / Instrument *" value={editingMember.role} onChange={v => setEditingMember({ ...editingMember, role: v })} placeholder="Guitars, Bass, Drums, Vocals..." required />
              <Input label="Bio (optional)" value={editingMember.bio} onChange={v => setEditingMember({ ...editingMember, bio: v })} placeholder="Short description..." />
              <Input label="Sort Order" value={String(editingMember.sortOrder)} onChange={v => setEditingMember({ ...editingMember, sortOrder: parseInt(v) || 0 })} type="number" />
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-2" style={{ color: TEXT_DIM }}>Photo</p>
                <ImageUploader
                  currentUrl={editingMember.photoUrl}
                  onUploaded={url => setEditingMember({ ...editingMember, photoUrl: url })}
                  folder="band-members"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMember.isActive}
                    onChange={e => setEditingMember({ ...editingMember, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-mono" style={{ color: TEXT }}>Active member (shows on homepage)</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Btn
                  onClick={() => upsertMember.mutate({
                    id: editingMember.id,
                    name: editingMember.name,
                    role: editingMember.role,
                    photoUrl: editingMember.photoUrl || null,
                    bio: editingMember.bio || null,
                    isActive: editingMember.isActive,
                    sortOrder: editingMember.sortOrder,
                  })}
                  disabled={upsertMember.isPending || !editingMember.name || !editingMember.role}
                >
                  <Save size={12} /> {upsertMember.isPending ? "Saving..." : "Save Member"}
                </Btn>
                <Btn onClick={() => setEditingMember(null)} variant="ghost"><X size={12} /> Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Band Alert section */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
        <h3 className="font-display text-lg tracking-wider mb-1" style={{ color: TEXT }}>Recruitment Alert</h3>
        <p className="text-xs font-mono mb-4" style={{ color: TEXT_DIM }}>This banner appears on the homepage About section. Use it to announce open positions or remove it when the lineup is complete.</p>

        {alertLoading ? (
          <div className="flex justify-center py-4"><RefreshCw size={16} className="animate-spin" style={{ color: CRIMSON }} /></div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Alert Message</label>
              <textarea
                value={alertForm.message}
                onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
                rows={3}
                placeholder="e.g. Ksetravid is looking for a lead vocalist. DM us on Instagram."
                className="w-full px-3 py-2 text-sm font-mono outline-none transition-colors resize-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                onFocus={e => { e.currentTarget.style.borderColor = CRIMSON_DIM; }}
                onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: TEXT_DIM }}>Alert Type</label>
              <select
                value={alertForm.alertType}
                onChange={e => setAlertForm({ ...alertForm, alertType: e.target.value })}
                className="px-3 py-2 text-sm font-mono outline-none"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
              >
                <option value="recruiting">Recruiting (looking for member)</option>
                <option value="hiatus">Hiatus</option>
                <option value="announcement">General Announcement</option>
                <option value="departure">Member Departure</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertForm.isActive}
                  onChange={e => setAlertForm({ ...alertForm, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-xs font-mono" style={{ color: TEXT }}>Show alert on homepage</span>
              </label>
            </div>
            <Btn
              onClick={() => saveAlert.mutate({ id: alert?.id, message: alertForm.message, alertType: alertForm.alertType, isActive: alertForm.isActive })}
              disabled={saveAlert.isPending || !alertForm.message}
            >
              <Save size={12} /> {saveAlert.isPending ? "Saving..." : "Save Alert"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: adminCheck, isLoading } = trpc.admin.check.useQuery();
  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => { toast.success("Logged out"); navigate("/admin/login"); }
  });

  useEffect(() => {
    if (!isLoading && !adminCheck?.isAdmin) {
      navigate("/admin/login");
    }
  }, [adminCheck, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: CRIMSON }} />
      </div>
    );
  }

  if (!adminCheck?.isAdmin) return null;

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "Orders", icon: <ClipboardList size={16} /> },
    { id: "band", label: "Band Members", icon: <Users size={16} /> },
    { id: "images", label: "Images", icon: <Image size={16} /> },
    { id: "merch", label: "Merch", icon: <ShoppingBag size={16} /> },
    { id: "tour", label: "Tour Dates", icon: <MapPin size={16} /> },
    { id: "upi", label: "UPI / Payment", icon: <CreditCard size={16} /> },
    { id: "credentials", label: "Credentials", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ backgroundColor: SURFACE, borderRight: `1px solid ${BORDER}` }}
      >
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <img src={LOGO} alt="Ksetravid" className="h-8 w-auto" />
          <div>
            <p className="font-display text-xs tracking-widest uppercase" style={{ color: TEXT }}>Admin</p>
            <p className="font-mono text-[9px]" style={{ color: TEXT_DIM }}>Control Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-wider uppercase text-left transition-all"
              style={{
                backgroundColor: section === item.id ? CRIMSON_DIM : "transparent",
                border: `1px solid ${section === item.id ? CRIMSON : "transparent"}`,
                color: section === item.id ? TEXT : TEXT_DIM,
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-wider uppercase mb-1"
            style={{ color: TEXT_DIM }}
          >
            <Eye size={14} /> View Website
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-wider uppercase"
            style={{ color: CRIMSON }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="Ksetravid" className="h-7 w-auto" />
          <span className="font-display text-xs tracking-widest uppercase" style={{ color: TEXT }}>Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2" style={{ color: TEXT }}>
          {sidebarOpen ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14" style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.95)" }}>
          <nav className="p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono tracking-wider uppercase text-left"
                style={{
                  backgroundColor: section === item.id ? CRIMSON_DIM : SURFACE,
                  border: `1px solid ${section === item.id ? CRIMSON : BORDER}`,
                  color: section === item.id ? TEXT : TEXT_DIM,
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono tracking-wider uppercase" style={{ color: TEXT_DIM, border: `1px solid ${BORDER}` }}>
              <Eye size={16} /> View Website
            </button>
            <button onClick={() => logoutMutation.mutate()} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono tracking-wider uppercase" style={{ color: CRIMSON, border: `1px solid ${CRIMSON_DIM}` }}>
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-5xl">
          {section === "orders" && <OrdersSection />}
          {section === "band" && <BandEditor />}
          {section === "images" && <ImageManager />}
          {section === "merch" && <MerchEditor />}
          {section === "tour" && <TourEditor />}
          {section === "upi" && <UpiSettings />}
          {section === "credentials" && <CredentialsSettings />}
        </div>
      </main>
    </div>
  );
}
