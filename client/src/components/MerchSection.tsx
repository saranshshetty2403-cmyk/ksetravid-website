/* =============================================================
   KSETRAVID MERCH — Merchandise section pointing to Bandcamp
   ============================================================= */

const MERCH_ITEMS = [
  {
    id: 1,
    name: "Ksetravid Logo Tee",
    description: "Classic black tee featuring the iconic Ksetravid logo — the eye of the knower.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/logo_square_3255306f.jpg",
    badge: "Available",
    badgeColor: "oklch(0.55 0.15 145)",
    url: "https://ksetravid.bandcamp.com/",
  },
  {
    id: 2,
    name: "Anamnesis Digital",
    description: "Download the Anamnesis single in high quality. Support the band directly on Bandcamp.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_anamnesis_ecc6e99c.jpg",
    badge: "Digital",
    badgeColor: "oklch(0.55 0.18 250)",
    url: "https://ksetravid.bandcamp.com/track/anamnesis",
  },
  {
    id: 3,
    name: "The Third Eye Digital",
    description: "Download The Third Eye single. High quality audio, direct from the band.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_thirdeye_8b380d53.jpg",
    badge: "Digital",
    badgeColor: "oklch(0.55 0.18 250)",
    url: "https://ksetravid.bandcamp.com/track/the-third-eye",
  },
  {
    id: 4,
    name: "God Playing Dice LP",
    description: "The debut album. Pre-order or wishlist on Bandcamp to be notified on release.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_hero_bg-PCFrUDfN4sN3ED5yRqYKQC.webp",
    badge: "Coming Soon",
    badgeColor: "oklch(0.62 0.18 60)",
    url: "https://ksetravid.bandcamp.com/",
  },
];

export default function MerchSection() {
  return (
    <section
      id="merch"
      className="relative py-24"
      style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Support the Band
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            MERCH & MUSIC
          </h2>
          <div className="crimson-rule" />
          <p className="font-body text-base mt-6 max-w-xl" style={{ color: "oklch(0.60 0.015 285)" }}>
            The best way to support an independent metal band is to buy directly. All music and merchandise available on Bandcamp.
          </p>
        </div>

        {/* Merch grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MERCH_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover-crimson block border overflow-hidden group"
              style={{
                borderColor: "oklch(1 0 0 / 0.08)",
                backgroundColor: "oklch(0.10 0.006 285)",
              }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: "brightness(0.75) saturate(0.8)" }}
                />
                {/* Badge */}
                <span
                  className="absolute top-3 left-3 font-mono-tech text-xs tracking-widest uppercase px-2 py-1"
                  style={{
                    backgroundColor: `${item.badgeColor}20`,
                    color: item.badgeColor,
                    border: `1px solid ${item.badgeColor}50`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {item.badge}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-display text-base mb-2" style={{ color: "oklch(0.87 0.02 80)" }}>
                  {item.name}
                </h4>
                <p className="font-body text-xs leading-relaxed" style={{ color: "oklch(0.55 0.015 285)" }}>
                  {item.description}
                </p>
                <p
                  className="font-mono-tech text-xs tracking-widest uppercase mt-3 transition-colors duration-200"
                  style={{ color: "oklch(0.45 0.015 285)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.45 0.015 285)"; }}
                >
                  View on Bandcamp →
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Bandcamp CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://ksetravid.bandcamp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              backgroundColor: "oklch(0.50 0.15 200)",
              color: "oklch(0.97 0.005 80)",
              border: "1px solid oklch(0.55 0.15 200)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
          >
            Visit Ksetravid on Bandcamp
          </a>
        </div>
      </div>
    </section>
  );
}
