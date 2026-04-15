/* =============================================================
   KSETRAVID NAVBAR — Cosmic Tech-Death Noir
   Desktop: logo left | nav center | CTA right
   Mobile:  hamburger left | logo CENTERED (large) | spacer right
   ============================================================= */
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Music", href: "#music" },
  { label: "Videos", href: "#videos" },
  { label: "Gallery", href: "#gallery" },
  { label: "Tour", href: "#tour" },
  { label: "Contact", href: "#contact" },
];

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_new_14609d64.jpg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "oklch(0.08 0.005 285 / 0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid oklch(1 0 0 / 0.08)" : "none",
        }}
      >
        {/* ── DESKTOP NAVBAR ── */}
        <div className="hidden md:flex container items-center justify-between h-20 overflow-hidden">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center gap-3 group"
            aria-label="Ksetravid Home"
          >
            <img
              src={LOGO_URL}
              alt="Ksetravid Logo"
              className="h-16 w-auto object-contain"
              style={{ filter: "brightness(1.1)", mixBlendMode: "screen", maxHeight: "64px" }}
            />
          </button>

          {/* Desktop Nav Links */}
          <div className="flex items-center gap-8">
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
          </div>

          {/* Listen CTA */}
          <a
            href="https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono-tech tracking-widest uppercase transition-all duration-200 border"
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

        {/* ── MOBILE NAVBAR ── */}
        <div className="md:hidden flex items-center justify-between px-4 h-20 relative overflow-hidden">
          {/* Hamburger — left */}
          <button
            className="p-2 z-10 flex-shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ color: "oklch(0.87 0.02 80)" }}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Logo — absolutely centered so it's always in the middle */}
          <button
            onClick={() => handleNavClick("#home")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            aria-label="Ksetravid Home"
          >
            <img
              src={LOGO_URL}
              alt="Ksetravid Logo"
              className="h-16 w-auto object-contain"
              style={{ filter: "brightness(1.1)", mixBlendMode: "screen", maxHeight: "64px" }}
            />
          </button>

          {/* Spacer — right side mirrors hamburger for visual balance */}
          <div className="w-10 flex-shrink-0" />
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
              src={LOGO_URL}
              alt="Ksetravid"
              className="w-48 object-contain mb-4"
              style={{ filter: "brightness(1.1)", mixBlendMode: "screen" }}
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
