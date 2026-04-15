/* =============================================================
   KSETRAVID TOUR — Tour dates with concert background
   Tour dates and background image: pulled from DB via tRPC
   ============================================================= */
import { trpc } from "@/lib/trpc";

const FALLBACK_TOUR_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_tour_bg-G2r5A4Ci2qCwubZPq5aP54.webp";

export default function TourSection() {
  const { data: images } = trpc.images.list.useQuery();
  const { data: shows } = trpc.tour.list.useQuery();

  const tourBg = images?.find(img => img.key === "tour_bg")?.url ?? FALLBACK_TOUR_BG;

  const upcomingShows = (shows ?? []).filter(s => !s.isPast).sort((a, b) => a.sortOrder - b.sortOrder);
  const pastShows = (shows ?? []).filter(s => s.isPast).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      id="tour"
      className="relative py-14 md:py-24 overflow-hidden"
      style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${tourBg})`,
          opacity: 0.18,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, oklch(0.08 0.005 285 / 0.7) 0%, oklch(0.08 0.005 285 / 0.5) 50%, oklch(0.08 0.005 285 / 0.8) 100%)",
        }}
      />

      <div className="container relative z-10">
        {/* Section header */}
        <div className="mb-10 md:mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Live
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            TOUR DATES
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Upcoming shows notice */}
        <div
          className="mb-12 p-6 border-l-2 flex items-start gap-4"
          style={{
            borderColor: "oklch(0.62 0.18 60)",
            backgroundColor: "oklch(0.62 0.18 60 / 0.06)",
          }}
        >
          <span className="font-mono-tech text-xl" style={{ color: "oklch(0.62 0.18 60)" }}>⚡</span>
          <div>
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.62 0.18 60)" }}>
              2026 Shows — TBA
            </p>
            <p className="font-body text-base" style={{ color: "oklch(0.68 0.015 80)" }}>
              Ksetravid is currently in the studio completing their debut album <em>God Playing Dice</em> and searching for a new vocalist. New tour dates will be announced soon. Follow on social media to stay updated.
            </p>
          </div>
        </div>

        {/* Upcoming shows (if any) */}
        {upcomingShows.length > 0 && (
          <div className="mb-12">
            <h3 className="font-display text-2xl mb-6" style={{ color: "oklch(0.87 0.02 80)" }}>
              Upcoming Shows
            </h3>
            {/* Desktop table */}
            <div className="hidden md:block border" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              <div
                className="grid grid-cols-5 px-6 py-3 border-b"
                style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(0.10 0.006 285)" }}
              >
                {["Date", "City", "Venue", "Country", "Tickets"].map((col) => (
                  <span key={col} className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.45 0.015 285)" }}>
                    {col}
                  </span>
                ))}
              </div>
              {upcomingShows.map((show, i) => (
                <div
                  key={show.id ?? i}
                  className="grid grid-cols-5 px-6 py-4 border-b transition-colors duration-200"
                  style={{ borderColor: "oklch(1 0 0 / 0.05)", backgroundColor: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <span className="font-mono-tech text-sm" style={{ color: "oklch(0.55 0.015 285)" }}>{show.date}</span>
                  <span className="font-display text-base" style={{ color: "oklch(0.87 0.02 80)" }}>{show.city}</span>
                  <span className="font-body text-sm" style={{ color: "oklch(0.65 0.015 285)" }}>{show.venue}</span>
                  <span className="font-body text-sm" style={{ color: "oklch(0.55 0.015 285)" }}>{show.country}</span>
                  <span>
                    {show.isSoldOut ? (
                      <span className="font-mono-tech text-xs px-2 py-0.5" style={{ backgroundColor: "oklch(0.35 0.2 25)", color: "oklch(0.87 0.02 80)", border: "1px solid oklch(0.52 0.24 25)" }}>SOLD OUT</span>
                    ) : show.ticketUrl ? (
                      <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer" className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
                        Get Tickets →
                      </a>
                    ) : (
                      <span className="font-mono-tech text-xs" style={{ color: "oklch(0.45 0.015 285)" }}>TBA</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {upcomingShows.map((show, i) => (
                <div key={show.id ?? i} className="border p-4" style={{ borderColor: "oklch(0.42 0.22 25 / 0.3)", backgroundColor: "oklch(0.10 0.006 285)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-display text-base" style={{ color: "oklch(0.87 0.02 80)" }}>{show.city}</span>
                    <span className="font-mono-tech text-xs px-2 py-0.5 shrink-0" style={{ backgroundColor: "oklch(0.42 0.22 25 / 0.2)", color: "oklch(0.52 0.24 25)" }}>{show.date}</span>
                  </div>
                  <p className="font-body text-sm mb-1" style={{ color: "oklch(0.65 0.015 285)" }}>{show.venue}</p>
                  <p className="font-mono-tech text-xs mb-2" style={{ color: "oklch(0.45 0.015 285)" }}>{show.country}</p>
                  {show.isSoldOut ? (
                    <span className="font-mono-tech text-xs px-2 py-0.5" style={{ backgroundColor: "oklch(0.35 0.2 25)", color: "oklch(0.87 0.02 80)", border: "1px solid oklch(0.52 0.24 25)" }}>SOLD OUT</span>
                  ) : show.ticketUrl ? (
                    <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer" className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.52 0.24 25)" }}>
                      Get Tickets →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past shows */}
        {pastShows.length > 0 && (
          <div>
            <h3
              className="font-display text-2xl mb-6"
              style={{ color: "oklch(0.55 0.015 285)" }}
            >
              Past Shows
            </h3>

            {/* Desktop table */}
            <div className="hidden md:block border" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              <div
                className="grid grid-cols-4 px-6 py-3 border-b"
                style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(0.10 0.006 285)" }}
              >
                {["Date", "City", "Venue", "Country"].map((col) => (
                  <span key={col} className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.45 0.015 285)" }}>
                    {col}
                  </span>
                ))}
              </div>
              {pastShows.map((show, i) => (
                <div
                  key={show.id ?? i}
                  className="grid grid-cols-4 px-6 py-4 border-b transition-colors duration-200"
                  style={{ borderColor: "oklch(1 0 0 / 0.05)", backgroundColor: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <span className="font-mono-tech text-sm" style={{ color: "oklch(0.55 0.015 285)" }}>{show.date}</span>
                  <span className="font-display text-base" style={{ color: "oklch(0.87 0.02 80)" }}>{show.city}</span>
                  <span className="font-body text-sm" style={{ color: "oklch(0.65 0.015 285)" }}>{show.venue}</span>
                  <span className="font-body text-sm" style={{ color: "oklch(0.55 0.015 285)" }}>{show.country}</span>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {pastShows.map((show, i) => (
                <div key={show.id ?? i} className="border p-4" style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(0.10 0.006 285)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-display text-base" style={{ color: "oklch(0.87 0.02 80)" }}>{show.city}</span>
                    <span className="font-mono-tech text-xs px-2 py-0.5 shrink-0" style={{ backgroundColor: "oklch(0.42 0.22 25 / 0.2)", color: "oklch(0.52 0.24 25)" }}>{show.date}</span>
                  </div>
                  <p className="font-body text-sm mb-1" style={{ color: "oklch(0.65 0.015 285)" }}>{show.venue}</p>
                  <p className="font-mono-tech text-xs" style={{ color: "oklch(0.45 0.015 285)" }}>{show.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking CTA */}
        <div
          className="mt-16 p-8 border text-center"
          style={{
            borderColor: "oklch(0.42 0.22 25 / 0.3)",
            backgroundColor: "oklch(0.42 0.22 25 / 0.05)",
          }}
        >
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Booking Enquiries
          </p>
          <h3 className="font-display text-2xl md:text-3xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            WANT KSETRAVID AT YOUR SHOW?
          </h3>
          <p className="font-body text-base mb-6 max-w-lg mx-auto" style={{ color: "oklch(0.65 0.015 285)" }}>
            For booking enquiries, festival slots, and live show requests, reach out directly.
          </p>
          <a
            href="mailto:ksetravid@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              backgroundColor: "oklch(0.42 0.22 25)",
              color: "oklch(0.97 0.005 80)",
              border: "1px solid oklch(0.52 0.24 25)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)"; }}
          >
            ◆ Book Ksetravid
          </a>
        </div>
      </div>
    </section>
  );
}
