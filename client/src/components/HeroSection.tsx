/* =============================================================
   KSETRAVID HERO — Full-bleed cosmic eye background
   Mobile: fully stacked vertically — logo centered at top,
           then text, then band photo
   Desktop (lg+): asymmetric side-by-side layout
   Images: pulled from DB via tRPC (admin-editable)
   ============================================================= */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

// Fallback URLs (used only if DB is empty / loading)
const FALLBACK_HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_hero_bg-PCFrUDfN4sN3ED5yRqYKQC.webp";
const FALLBACK_BAND_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png";
const FALLBACK_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: images } = trpc.images.list.useQuery();

  const getImg = (key: string, fallback: string) =>
    images?.find(img => img.key === key)?.url ?? fallback;

  const HERO_BG = getImg("hero_bg", FALLBACK_HERO_BG);
  const BAND_PHOTO = getImg("hero_band_photo", FALLBACK_BAND_PHOTO);
  const LOGO_URL = getImg("logo", FALLBACK_LOGO);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToMusic = () => {
    document.querySelector("#music")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "oklch(0.06 0.005 285)" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          opacity: 0.35,
        }}
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
      <div className="container relative z-10 w-full pt-24 pb-16">

        {/* ── MOBILE LAYOUT: fully stacked ── */}
        <div className="flex flex-col items-center text-center lg:hidden gap-5">

          {/* Logo — large and centered on mobile */}
          <div
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.1s" }}
          >
            {/* aria-hidden: the desktop h1 is the canonical heading */}
            <div aria-hidden="true">
              <img
                src={LOGO_URL}
                alt=""
                className="w-64 sm:w-72 object-contain mx-auto"
                style={{ filter: "brightness(1.05)" }}
              />
            </div>
          </div>

          {/* Origin tag */}
          <div
            className={`flex items-center justify-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.2s" }}
          >
            <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
              ◆ Bangalore, India
            </span>
            <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.55 0.015 285)" }}>
              · Est. 2020
            </span>
          </div>

          {/* Genre tags */}
          <div
            className={`flex flex-wrap justify-center gap-2 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            {["Progressive Death Metal", "Tech-Death", "Deathcore"].map((tag) => (
              <span
                key={tag}
                className="font-mono-tech text-xs tracking-widest uppercase px-3 py-1 border"
                style={{
                  borderColor: "oklch(0.42 0.22 25 / 0.5)",
                  color: "oklch(0.65 0.015 285)",
                  backgroundColor: "oklch(0.42 0.22 25 / 0.08)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Tagline */}
          <p
            className={`font-body text-sm leading-relaxed transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              color: "oklch(0.70 0.015 80)",
              transitionDelay: "0.4s",
              fontStyle: "italic",
              maxWidth: "340px",
            }}
          >
            Rooted in the Upanishads. Forged in fury. A sonic exploration of consciousness, collapse, and the darker side of human existence.
          </p>

          {/* Album announcement */}
          <div
            className={`w-full max-w-xs p-4 border-l-2 text-left transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              borderColor: "oklch(0.52 0.24 25)",
              backgroundColor: "oklch(0.42 0.22 25 / 0.08)",
              transitionDelay: "0.5s",
            }}
          >
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.24 25)" }}>
              ◆ Debut Album
            </p>
            <p className="font-display text-xl tracking-wide" style={{ color: "oklch(0.87 0.02 80)" }}>
              GOD PLAYING DICE
            </p>
            <p className="font-mono-tech text-xs mt-1" style={{ color: "oklch(0.55 0.015 285)" }}>
              Coming Soon
            </p>
          </div>

          {/* CTAs */}
          <div
            className={`flex flex-wrap justify-center gap-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            <button
              onClick={scrollToMusic}
              className="px-6 py-3 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                backgroundColor: "oklch(0.42 0.22 25)",
                color: "oklch(0.97 0.005 80)",
                border: "1px solid oklch(0.52 0.24 25)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)"; }}
            >
              ▶ Hear the Music
            </button>
            <button
              onClick={scrollToAbout}
              className="px-6 py-3 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200 border"
              style={{
                borderColor: "oklch(0.87 0.02 80 / 0.3)",
                color: "oklch(0.87 0.02 80)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.7)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.3)"; }}
            >
              Our Story
            </button>
          </div>

          {/* Band photo — below content on mobile */}
          <div
            className={`w-full transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "0.5s", maxWidth: "320px" }}
          >
            <img
              src={BAND_PHOTO}
              alt="Ksetravid band"
              className="w-full object-cover"
              style={{
                filter: "contrast(1.1) brightness(0.9)",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
                maxHeight: "280px",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          </div>
        </div>

        {/* ── DESKTOP LAYOUT: side-by-side ── */}
        <div className="hidden lg:flex flex-row items-center gap-12">

          {/* Left: Text content */}
          <div className="flex-1 max-w-2xl">
            {/* Origin tag */}
            <div
              className={`flex items-center gap-3 mb-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
                ◆ Bangalore, India
              </span>
              <span className="h-px flex-1 max-w-12" style={{ backgroundColor: "oklch(0.52 0.24 25 / 0.5)" }} />
              <span className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.55 0.015 285)" }}>
                Est. 2020
              </span>
            </div>

            {/* Logo */}
            <div
              className={`mb-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <h1 className="m-0 p-0 leading-none">
                <img
                  src={LOGO_URL}
                  alt="Ksetravid — Progressive Death Metal / Tech-Death Band from Bangalore, India"
                  className="h-48 w-auto object-contain"
                  style={{ filter: "brightness(1.05)", maxWidth: "360px" }}
                />
              </h1>
            </div>

            {/* Genre tags */}
            <div
              className={`flex flex-wrap gap-2 mb-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.35s" }}
            >
              {["Progressive Death Metal", "Tech-Death", "Deathcore"].map((tag) => (
                <span
                  key={tag}
                  className="font-mono-tech text-xs tracking-widest uppercase px-3 py-1 border"
                  style={{
                    borderColor: "oklch(0.42 0.22 25 / 0.5)",
                    color: "oklch(0.65 0.015 285)",
                    backgroundColor: "oklch(0.42 0.22 25 / 0.08)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Tagline */}
            <p
              className={`font-body text-lg lg:text-xl leading-relaxed mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                color: "oklch(0.70 0.015 80)",
                transitionDelay: "0.45s",
                maxWidth: "520px",
                fontStyle: "italic",
              }}
            >
              Rooted in the Upanishads. Forged in fury. A sonic exploration of consciousness, collapse, and the darker side of human existence.
            </p>

            {/* Album announcement */}
            <div
              className={`mb-6 p-4 border-l-2 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                borderColor: "oklch(0.52 0.24 25)",
                backgroundColor: "oklch(0.42 0.22 25 / 0.08)",
                transitionDelay: "0.5s",
              }}
            >
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.24 25)" }}>
                ◆ Debut Album
              </p>
              <p className="font-display text-2xl tracking-wide" style={{ color: "oklch(0.87 0.02 80)" }}>
                GOD PLAYING DICE
              </p>
              <p className="font-mono-tech text-xs mt-1" style={{ color: "oklch(0.55 0.015 285)" }}>
                Coming Soon
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.6s" }}
            >
              <button
                onClick={scrollToMusic}
                className="px-8 py-3 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
                style={{
                  backgroundColor: "oklch(0.42 0.22 25)",
                  color: "oklch(0.97 0.005 80)",
                  border: "1px solid oklch(0.52 0.24 25)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)"; }}
              >
                ▶ Hear the Music
              </button>
              <button
                onClick={scrollToAbout}
                className="px-8 py-3 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200 border"
                style={{
                  borderColor: "oklch(0.87 0.02 80 / 0.3)",
                  color: "oklch(0.87 0.02 80)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.7)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.02 80 / 0.3)"; }}
              >
                Our Story
              </button>
            </div>
          </div>

          {/* Right: Band photo */}
          <div
            className={`flex-shrink-0 w-80 xl:w-96 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <img
              src={BAND_PHOTO}
              alt="Ksetravid band"
              className="w-full object-cover"
              style={{
                filter: "contrast(1.1) brightness(0.9)",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 5%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 5%, black 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
                maxHeight: "600px",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
