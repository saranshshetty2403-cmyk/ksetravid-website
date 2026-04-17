/* =============================================================
   KSETRAVID HERO — Full-bleed cosmic eye background
   Redesigned to match the visual language of the other sections
   (◆ eyebrow + accent rules, bold display heading, framed media,
   red corner accents, generous spacing).
   Mobile: stacked, intentional, full-width feel.
   Desktop (lg+): asymmetric two-column with larger framed photo.
   Images: pulled from DB via tRPC (admin-editable).
   ============================================================= */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

// Fallback URLs (used only if DB is empty / loading)
const FALLBACK_HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_hero_bg-PCFrUDfN4sN3ED5yRqYKQC.webp";
const FALLBACK_BAND_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png";
const FALLBACK_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png";

const RED = "oklch(0.52 0.24 25)";
const RED_DEEP = "oklch(0.42 0.22 25)";
const BONE = "oklch(0.87 0.02 80)";
const MUTED = "oklch(0.55 0.015 285)";
const BG = "oklch(0.06 0.005 285)";

/* Reusable: red corner accents for framed media (used elsewhere in site) */
function CornerAccents() {
  const common = "absolute w-5 h-5 border-2";
  return (
    <>
      <span className={`${common} -top-px -left-px border-r-0 border-b-0`} style={{ borderColor: RED }} />
      <span className={`${common} -top-px -right-px border-l-0 border-b-0`} style={{ borderColor: RED }} />
      <span className={`${common} -bottom-px -left-px border-r-0 border-t-0`} style={{ borderColor: RED }} />
      <span className={`${common} -bottom-px -right-px border-l-0 border-t-0`} style={{ borderColor: RED }} />
    </>
  );
}

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: images } = trpc.images.list.useQuery();

  const getImg = (key: string, fallback: string) =>
    images?.find((img) => img.key === key)?.url ?? fallback;

  const HERO_BG = getImg("hero_bg", FALLBACK_HERO_BG);
  const BAND_PHOTO = getImg("hero_band_photo", FALLBACK_BAND_PHOTO);
  const LOGO_URL = getImg("logo", FALLBACK_LOGO);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToMusic = () =>
    document.querySelector("#music")?.scrollIntoView({ behavior: "smooth" });
  const scrollToAbout = () =>
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });

  /* Shared content blocks (so mobile + desktop stay in sync) */

  const Eyebrow = (
    <div
      className={`flex items-center gap-3 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "0.1s" }}
    >
      <span className="h-px w-8 lg:w-12" style={{ backgroundColor: `${RED} / 0.6`, background: RED, opacity: 0.6 }} />
      <span className="font-mono-tech text-[11px] lg:text-xs tracking-[0.25em] uppercase" style={{ color: RED }}>
        ◆ Bangalore, India
      </span>
      <span className="font-mono-tech text-[11px] lg:text-xs tracking-[0.25em] uppercase" style={{ color: MUTED }}>
        · Est. 2020
      </span>
      <span className="hidden sm:block h-px flex-1 max-w-16 lg:max-w-20" style={{ backgroundColor: RED, opacity: 0.4 }} />
    </div>
  );

  const GenreTags = (
    <div
      className={`flex flex-wrap gap-2 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "0.35s" }}
    >
      {["Progressive Death Metal", "Tech-Death", "Deathcore"].map((tag) => (
        <span
          key={tag}
          className="font-mono-tech text-[10px] lg:text-xs tracking-[0.2em] uppercase px-3 py-1.5 border"
          style={{
            borderColor: `${RED_DEEP}`,
            color: BONE,
            backgroundColor: "oklch(0.42 0.22 25 / 0.12)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );

  const Tagline = (cls: string) => (
    <p
      className={`font-body leading-relaxed transition-all duration-700 ${cls} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        color: "oklch(0.75 0.015 80)",
        transitionDelay: "0.45s",
        fontStyle: "italic",
      }}
    >
      Rooted in the Upanishads. Forged in fury. A sonic exploration of consciousness,
      collapse, and the darker side of human existence.
    </p>
  );

  const AlbumCard = (
    <div
      className={`relative w-full p-5 lg:p-6 border transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        borderColor: "oklch(0.42 0.22 25 / 0.5)",
        backgroundColor: "oklch(0.08 0.01 285 / 0.7)",
        backdropFilter: "blur(6px)",
        transitionDelay: "0.5s",
      }}
    >
      {/* left red accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: RED }}
      />
      <CornerAccents />
      <p
        className="font-mono-tech text-[10px] lg:text-xs tracking-[0.3em] uppercase mb-2"
        style={{ color: RED }}
      >
        ◆ Debut Album
      </p>
      <p
        className="font-display text-2xl lg:text-3xl tracking-wide leading-tight"
        style={{ color: BONE }}
      >
        GOD PLAYING DICE
      </p>
      <p
        className="font-mono-tech text-[10px] lg:text-xs mt-2 tracking-[0.25em] uppercase"
        style={{ color: MUTED }}
      >
        Coming Soon
      </p>
    </div>
  );

  const CTAs = (
    <div
      className={`flex flex-wrap gap-3 lg:gap-4 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "0.6s" }}
    >
      <button
        onClick={scrollToMusic}
        className="px-7 lg:px-8 py-3.5 font-mono-tech text-xs tracking-[0.25em] uppercase transition-all duration-200"
        style={{
          backgroundColor: RED_DEEP,
          color: "oklch(0.97 0.005 80)",
          border: `1px solid ${RED}`,
          boxShadow: "0 0 24px oklch(0.42 0.22 25 / 0.35)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = RED;
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 32px oklch(0.52 0.24 25 / 0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = RED_DEEP;
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 24px oklch(0.42 0.22 25 / 0.35)";
        }}
      >
        ▶ Hear the Music
      </button>
      <button
        onClick={scrollToAbout}
        className="px-7 lg:px-8 py-3.5 font-mono-tech text-xs tracking-[0.25em] uppercase transition-all duration-200 border"
        style={{
          borderColor: "oklch(0.87 0.02 80 / 0.35)",
          color: BONE,
          backgroundColor: "oklch(0.87 0.02 80 / 0.03)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.75)";
          (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.87 0.02 80 / 0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.35)";
          (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.87 0.02 80 / 0.03)";
        }}
      >
        Our Story
      </button>
    </div>
  );

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG})`, opacity: 0.35 }}
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, oklch(0.06 0.005 285 / 0.97) 0%, oklch(0.06 0.005 285 / 0.85) 45%, oklch(0.06 0.005 285 / 0.4) 70%, oklch(0.06 0.005 285 / 0.7) 100%)",
        }}
      />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: "linear-gradient(to bottom, transparent, oklch(0.08 0.005 285))",
        }}
      />

      {/* Content */}
      <div className="container relative z-10 w-full pt-28 pb-20 lg:pt-32 lg:pb-24 px-5 sm:px-6">

        {/* ── MOBILE / TABLET LAYOUT (below lg) ── */}
        <div className="flex flex-col lg:hidden gap-7 max-w-xl mx-auto">

          {/* Eyebrow */}
          <div className="flex justify-center">{Eyebrow}</div>

          {/* Logo — large, glowing, centered */}
          <div
            className={`relative flex justify-center transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            {/* Red radial glow behind logo */}
            <div
              className="absolute inset-0 -z-0 blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, oklch(0.42 0.22 25 / 0.45), transparent 65%)",
              }}
            />
            <h1 className="m-0 p-0 leading-none relative z-10">
              <img
                src={LOGO_URL}
                alt="Ksetravid — Progressive Death Metal band from Bangalore, India"
                className="w-72 sm:w-96 object-contain mx-auto drop-shadow-[0_0_18px_rgba(220,38,38,0.35)]"
                style={{ filter: "brightness(1.1) contrast(1.05)" }}
              />
            </h1>
          </div>

          {/* Genre tags */}
          <div className="flex justify-center">{GenreTags}</div>

          {/* Tagline */}
          <div className="text-center">
            {Tagline("text-base sm:text-lg max-w-md mx-auto")}
          </div>

          {/* Album card */}
          <div className="max-w-md w-full mx-auto">{AlbumCard}</div>

          {/* CTAs */}
          <div className="flex justify-center">{CTAs}</div>

          {/* Band photo — framed with corner accents */}
          <div
            className={`relative w-full max-w-md mx-auto mt-2 transition-all duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <div
              className="relative p-1.5 border"
              style={{
                borderColor: "oklch(0.42 0.22 25 / 0.45)",
                backgroundColor: "oklch(0.08 0.01 285 / 0.5)",
              }}
            >
              <CornerAccents />
              <img
                src={BAND_PHOTO}
                alt="Ksetravid band members"
                className="w-full object-cover"
                style={{
                  filter: "contrast(1.1) brightness(0.92) saturate(0.95)",
                  maxHeight: "320px",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── DESKTOP LAYOUT (lg+) ── */}
        <div className="hidden lg:grid grid-cols-12 gap-10 xl:gap-16 items-center">

          {/* Left column: text content (7/12) */}
          <div className="col-span-7 max-w-2xl">
            {Eyebrow}

            {/* Logo — much larger on desktop */}
            <div
              className={`relative mt-8 mb-7 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div
                className="absolute inset-0 -z-0 blur-3xl opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at left center, oklch(0.42 0.22 25 / 0.45), transparent 60%)",
                }}
              />
              <h1 className="m-0 p-0 leading-none relative z-10">
                <img
                  src={LOGO_URL}
                  alt="Ksetravid — Progressive Death Metal / Tech-Death Band from Bangalore, India"
                  className="h-56 xl:h-64 w-auto object-contain"
                  style={{
                    filter: "brightness(1.1) contrast(1.05)",
                    maxWidth: "560px",
                  }}
                />
              </h1>
            </div>

            <div className="mb-7">{GenreTags}</div>

            <div className="mb-8">
              {Tagline("text-lg xl:text-xl max-w-xl")}
            </div>

            <div className="mb-8 max-w-md">{AlbumCard}</div>

            {CTAs}
          </div>

          {/* Right column: framed band photo (5/12) */}
          <div
            className={`col-span-5 transition-all duration-1000 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div
              className="relative p-2 border"
              style={{
                borderColor: "oklch(0.42 0.22 25 / 0.5)",
                backgroundColor: "oklch(0.08 0.01 285 / 0.6)",
                boxShadow: "0 0 60px oklch(0.42 0.22 25 / 0.18)",
              }}
            >
              <CornerAccents />
              <img
                src={BAND_PHOTO}
                alt="Ksetravid band members"
                className="w-full object-cover"
                style={{
                  filter: "contrast(1.1) brightness(0.92) saturate(0.95)",
                  maxHeight: "640px",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
              {/* Caption strip */}
              <div
                className="absolute bottom-2 left-2 right-2 px-3 py-2 flex items-center justify-between"
                style={{
                  backgroundColor: "oklch(0.06 0.005 285 / 0.85)",
                  borderTop: `1px solid ${RED_DEEP}`,
                }}
              >
                <span
                  className="font-mono-tech text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: RED }}
                >
                  ◆ The Band
                </span>
                <span
                  className="font-mono-tech text-[10px] tracking-[0.25em] uppercase"
                  style={{ color: MUTED }}
                >
                  Live · 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
