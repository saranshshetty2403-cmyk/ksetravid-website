/* =============================================================
   KSETRAVID NAVBAR — Cosmic Tech-Death Noir
   Desktop: logo left | nav center | CTA right
   Mobile:  hamburger left | logo CENTERED (large) | spacer right
   Logo: pulled from DB via tRPC (admin-editable)
   Merch button: replaces Gallery — animated, blood-red, unmissable
   ============================================================= */
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Music", href: "#music" },
  { label: "Videos", href: "#videos" },
  { label: "Tour", href: "#tour" },
  { label: "Contact", href: "#contact" },
];

const FALLBACK_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [merchPulse, setMerchPulse] = useState(false);

  const { data: images } = trpc.images.list.useQuery();
  const logoUrl = images?.find(img => img.key === "logo")?.url ?? FALLBACK_LOGO;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pulse the merch button every 4 seconds to grab attention
  useEffect(() => {
    const interval = setInterval(() => {
      setMerchPulse(true);
      setTimeout(() => setMerchPulse(false), 700);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes merch-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px 2px oklch(0.42 0.22 25 / 0.6), 0 0 24px 4px oklch(0.42 0.22 25 / 0.3); }
          50% { box-shadow: 0 0 18px 6px oklch(0.52 0.24 25 / 0.9), 0 0 40px 10px oklch(0.52 0.24 25 / 0.5); }
        }
        @keyframes merch-border-spin {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes merch-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-2px) rotate(-1deg); }
          40% { transform: translateX(2px) rotate(1deg); }
          60% { transform: translateX(-2px) rotate(-0.5deg); }
          80% { transform: translateX(2px) rotate(0.5deg); }
        }
        @keyframes merch-drip {
          0% { transform: scaleY(0); opacity: 1; }
          80% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1); opacity: 0; }
        }
        .merch-btn-shake { animation: merch-shake 0.6s ease-in-out; }
        .merch-glow { animation: merch-glow-pulse 2s ease-in-out infinite; }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "oklch(0.08 0.005 285 / 0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid oklch(1 0 0 / 0.08)" : "none",
        }}
      >
        {/* ── DESKTOP NAVBAR (md and above) ── */}
        <div className="hidden md:flex container items-center justify-between h-20">
          {/* Logo — left */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center group flex-shrink-0"
            aria-label="Ksetravid Home"
          >
            <img
              src={logoUrl}
              alt="Ksetravid Logo"
              className="h-14 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav Links — center */}
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="nav-link-underline font-mono-tech text-xs tracking-widest uppercase transition-colors duration-200"
                style={{ color: "oklch(0.65 0.015 285)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.015 285)";
                }}
              >
                {link.label}
              </button>
            ))}

            {/* ── MERCH BUTTON — Desktop ── */}
            <MerchButton
              onClick={() => handleNavClick("#merch")}
              shake={merchPulse}
              size="desktop"
            />
          </div>

          {/* Listen CTA — right */}
          <a
            href="https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono-tech tracking-widest uppercase transition-all duration-200 border flex-shrink-0"
            style={{
              borderColor: "oklch(0.42 0.22 25)",
              color: "oklch(0.87 0.02 80)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            ▶ Listen
          </a>
        </div>

        {/* ── MOBILE NAVBAR (below md) ── */}
        <div className="md:hidden flex items-center h-20 px-4 relative">
          {/* Hamburger — left */}
          <button
            className="p-2 z-10 flex-shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ color: "oklch(0.87 0.02 80)" }}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Logo — absolutely centered, large */}
          <button
            onClick={() => handleNavClick("#home")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            aria-label="Ksetravid Home"
          >
            <img
              src={logoUrl}
              alt="Ksetravid Logo"
              className="h-12 w-auto object-contain"
              style={{ minWidth: "140px" }}
            />
          </button>

          {/* Merch icon — right side on mobile bar */}
          <div className="ml-auto flex-shrink-0">
            <MerchButton
              onClick={() => { setMobileOpen(false); handleNavClick("#merch"); }}
              shake={merchPulse}
              size="mobile-icon"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-20"
          style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.98)" }}
        >
          <div className="flex flex-col items-center gap-8 mt-12">
            <img
              src={logoUrl}
              alt="Ksetravid"
              className="w-56 object-contain mb-4"
            />
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="font-display text-2xl tracking-widest uppercase transition-colors duration-200"
                style={{ color: "oklch(0.87 0.02 80)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)";
                }}
              >
                {link.label}
              </button>
            ))}

            {/* ── MERCH BUTTON — Mobile Menu ── */}
            <MerchButton
              onClick={() => { setMobileOpen(false); handleNavClick("#merch"); }}
              shake={false}
              size="mobile-menu"
            />

            <a
              href="https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-8 py-3 font-mono-tech text-sm tracking-widest uppercase border"
              style={{
                borderColor: "oklch(0.42 0.22 25)",
                color: "oklch(0.87 0.02 80)",
                backgroundColor: "oklch(0.42 0.22 25 / 0.2)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              ▶ Listen on Spotify
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/* ── MERCH BUTTON COMPONENT ─────────────────────────────────────────────────
   Three variants:
   - desktop: compact text button in nav bar with glow + animated border
   - mobile-icon: icon-only button in mobile top bar
   - mobile-menu: full-width dramatic button in mobile overlay
   ──────────────────────────────────────────────────────────────────────────── */
function MerchButton({
  onClick,
  shake,
  size,
}: {
  onClick: () => void;
  shake: boolean;
  size: "desktop" | "mobile-icon" | "mobile-menu";
}) {
  const [hovered, setHovered] = useState(false);

  if (size === "mobile-icon") {
    return (
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-10 h-10 ${shake ? "merch-btn-shake" : ""}`}
        aria-label="Merch"
        style={{
          background: "oklch(0.18 0.08 25)",
          border: "1.5px solid oklch(0.52 0.24 25)",
          borderRadius: "4px",
          boxShadow: "0 0 10px 2px oklch(0.42 0.22 25 / 0.5)",
        }}
      >
        <ShoppingBag size={18} style={{ color: "oklch(0.87 0.02 80)" }} />
        {/* Blood drip accent */}
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 rounded-b-full"
          style={{ background: "oklch(0.52 0.24 25)", opacity: 0.8 }}
        />
      </button>
    );
  }

  if (size === "mobile-menu") {
    return (
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center gap-3 px-10 py-4 font-display text-xl tracking-widest uppercase overflow-hidden group ${shake ? "merch-btn-shake" : ""}`}
        style={{
          background: "linear-gradient(135deg, oklch(0.15 0.08 25) 0%, oklch(0.22 0.12 25) 50%, oklch(0.15 0.08 25) 100%)",
          border: "2px solid oklch(0.52 0.24 25)",
          color: "oklch(0.95 0.02 80)",
          boxShadow: "0 0 20px 4px oklch(0.42 0.22 25 / 0.6), inset 0 0 20px oklch(0.42 0.22 25 / 0.1)",
          minWidth: "220px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, oklch(0.22 0.12 25) 0%, oklch(0.32 0.18 25) 50%, oklch(0.22 0.12 25) 100%)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px 8px oklch(0.52 0.24 25 / 0.8), inset 0 0 30px oklch(0.42 0.22 25 / 0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, oklch(0.15 0.08 25) 0%, oklch(0.22 0.12 25) 50%, oklch(0.15 0.08 25) 100%)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px 4px oklch(0.42 0.22 25 / 0.6), inset 0 0 20px oklch(0.42 0.22 25 / 0.1)";
        }}
      >
        {/* Animated scan line */}
        <span
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, oklch(0.52 0.24 25 / 0.4) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "merch-border-spin 2s linear infinite",
          }}
        />
        <ShoppingBag size={22} />
        <span>Merch</span>
        {/* Corner accent marks */}
        <span className="absolute top-1 left-1 w-2 h-2 border-t border-l" style={{ borderColor: "oklch(0.72 0.18 25)" }} />
        <span className="absolute top-1 right-1 w-2 h-2 border-t border-r" style={{ borderColor: "oklch(0.72 0.18 25)" }} />
        <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l" style={{ borderColor: "oklch(0.72 0.18 25)" }} />
        <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r" style={{ borderColor: "oklch(0.72 0.18 25)" }} />
      </button>
    );
  }

  // Desktop variant
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 font-mono-tech text-xs tracking-widest uppercase overflow-hidden transition-all duration-200 ${shake ? "merch-btn-shake" : ""} ${hovered ? "" : "merch-glow"}`}
      style={{
        background: hovered
          ? "linear-gradient(135deg, oklch(0.28 0.14 25), oklch(0.38 0.20 25))"
          : "linear-gradient(135deg, oklch(0.18 0.08 25), oklch(0.25 0.12 25))",
        border: `1.5px solid ${hovered ? "oklch(0.65 0.26 25)" : "oklch(0.52 0.24 25)"}`,
        color: hovered ? "oklch(1 0 0)" : "oklch(0.92 0.04 25)",
        boxShadow: hovered
          ? "0 0 20px 4px oklch(0.52 0.24 25 / 0.8), inset 0 0 12px oklch(0.42 0.22 25 / 0.3)"
          : undefined,
        transform: hovered ? "scale(1.05)" : "scale(1)",
      }}
    >
      {/* Animated shimmer on hover */}
      {hovered && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.08) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "merch-border-spin 1.2s linear infinite",
          }}
        />
      )}
      <ShoppingBag size={12} />
      <span>Merch</span>
      {/* Tiny blood drip below button */}
      <span
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 rounded-b-full"
        style={{ background: "oklch(0.52 0.24 25)", opacity: hovered ? 1 : 0.6 }}
      />
    </button>
  );
}
