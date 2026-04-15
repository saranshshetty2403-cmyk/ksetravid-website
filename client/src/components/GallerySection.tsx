/* =============================================================
   KSETRAVID GALLERY — Photo grid with lightbox
   Masonry-style layout with hover reveal captions
   ============================================================= */
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PHOTOS = [
  {
    id: 1,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_dark_fb7584d3.png",
    alt: "Ksetravid — Dark portrait with mandala",
    caption: "Ksetravid — Bangalore, 2024",
    size: "large",
  },
  {
    id: 2,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg",
    alt: "Ksetravid — Outdoor band photo",
    caption: "Band photo — Bangalore, 2024",
    size: "medium",
  },
  {
    id: 3,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg",
    alt: "Ksetravid — Black and white portrait",
    caption: "Black & white — Press photo",
    size: "medium",
  },
  {
    id: 4,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_live_d9615956.jpg",
    alt: "Ksetravid — Live performance",
    caption: "Live — Hisaab Barabar India Tour 2025",
    size: "large",
  },
  {
    id: 5,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_silhouette_03b6ba71.png",
    alt: "Ksetravid — Silhouette with logo",
    caption: "Ksetravid — Silhouette promo",
    size: "medium",
  },
  {
    id: 6,
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_anamnesis_ecc6e99c.jpg",
    alt: "Anamnesis — Single artwork",
    caption: "Anamnesis — Single artwork, 2024",
    size: "medium",
  },
];

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex((i) => (i !== null ? (i - 1 + PHOTOS.length) % PHOTOS.length : 0));
  const nextPhoto = () => setLightboxIndex((i) => (i !== null ? (i + 1) % PHOTOS.length : 0));

  return (
    <section
      id="gallery"
      className="relative py-14 md:py-24"
      style={{ backgroundColor: "oklch(0.06 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-10 md:mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Photos
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            GALLERY
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 auto-rows-[110px] sm:auto-rows-[150px] md:auto-rows-[200px]">
          {PHOTOS.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden cursor-pointer group ${
                photo.size === "large" ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => openLightbox(index)}
              style={{ border: "1px solid oklch(1 0 0 / 0.06)" }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                style={{ filter: "brightness(0.75) saturate(0.85)" }}
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(to top, oklch(0.06 0.005 285 / 0.9) 0%, transparent 60%)",
                }}
              >
                <p className="font-mono-tech text-xs tracking-widest" style={{ color: "oklch(0.65 0.015 285)" }}>
                  {photo.caption}
                </p>
              </div>
              {/* Crimson corner on hover */}
              <div
                className="absolute top-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  borderTop: "2px solid oklch(0.52 0.24 25)",
                  borderLeft: "2px solid oklch(0.52 0.24 25)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/ksetravid/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase border transition-all duration-200"
            style={{
              borderColor: "oklch(0.42 0.22 25 / 0.5)",
              color: "oklch(0.87 0.02 80)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            <span>◆</span>
            Follow on Instagram @ksetravid
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "oklch(0.04 0.003 285 / 0.97)" }}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 transition-colors duration-200"
            style={{ color: "oklch(0.65 0.015 285)" }}
            onClick={closeLightbox}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.015 285)"; }}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 transition-colors duration-200"
            style={{ color: "oklch(0.65 0.015 285)" }}
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.015 285)"; }}
          >
            <ChevronLeft size={32} />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] mx-12 md:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={PHOTOS[lightboxIndex].src}
              alt={PHOTOS[lightboxIndex].alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p
              className="font-mono-tech text-xs tracking-widest text-center mt-4"
              style={{ color: "oklch(0.55 0.015 285)" }}
            >
              {PHOTOS[lightboxIndex].caption}
            </p>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 transition-colors duration-200"
            style={{ color: "oklch(0.65 0.015 285)" }}
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.015 285)"; }}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}
