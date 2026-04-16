/* =============================================================
   KSETRAVID ABOUT — Band bio + members grid
   Members and alert are now fully DB-driven via admin dashboard
   ============================================================= */

import { trpc } from "@/lib/trpc";

const FALLBACK_ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_about_bg-mps2bmXs33M4MQ8C7eQV9t.webp";
const FALLBACK_BAND_PHOTO_OUTDOOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg";
const FALLBACK_BAND_PHOTO_BW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg";

// Alert type → icon + accent color
const ALERT_STYLES: Record<string, { icon: string; borderColor: string; bgColor: string; labelColor: string }> = {
  recruiting:   { icon: "⚡", borderColor: "oklch(0.62 0.18 60)",  bgColor: "oklch(0.62 0.18 60 / 0.06)",  labelColor: "oklch(0.62 0.18 60)" },
  hiatus:       { icon: "⏸",  borderColor: "oklch(0.55 0.15 285)", bgColor: "oklch(0.55 0.15 285 / 0.06)", labelColor: "oklch(0.65 0.015 285)" },
  announcement: { icon: "📢", borderColor: "oklch(0.52 0.24 25)",  bgColor: "oklch(0.52 0.24 25 / 0.06)",  labelColor: "oklch(0.52 0.24 25)" },
  departure:    { icon: "🚪", borderColor: "oklch(0.52 0.24 25)",  bgColor: "oklch(0.52 0.24 25 / 0.06)",  labelColor: "oklch(0.52 0.24 25)" },
};

export default function AboutSection() {
  const { data: images } = trpc.images.list.useQuery();
  const { data: members = [] } = trpc.band.getMembers.useQuery();
  const { data: alert } = trpc.band.getAlert.useQuery();

  const ABOUT_BG = images?.find(img => img.key === "about_bg")?.url ?? FALLBACK_ABOUT_BG;
  const BAND_PHOTO_OUTDOOR = images?.find(img => img.key === "about_band_outdoor")?.url ?? FALLBACK_BAND_PHOTO_OUTDOOR;
  const BAND_PHOTO_BW = images?.find(img => img.key === "about_band_bw")?.url ?? FALLBACK_BAND_PHOTO_BW;

  const activeMembers = members.filter(m => m.isActive);
  const alertStyle = ALERT_STYLES[alert?.alertType ?? "recruiting"] ?? ALERT_STYLES.recruiting;

  return (
    <section
      id="about"
      className="relative py-14 md:py-24 overflow-hidden"
      style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ABOUT_BG})`, opacity: 0.15 }}
      />

      <div className="container relative z-10">
        {/* Section header */}
        <div className="mb-10 md:mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ The Band
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            ABOUT
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Bio + Photo layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-12 md:mb-20 items-center">
          {/* Bio text */}
          <div>
            <p className="font-body text-base md:text-lg leading-relaxed mb-6" style={{ color: "oklch(0.75 0.015 80)" }}>
              Ksetravid emerged from Bangalore in 2020, born from the isolation of a global pandemic. Musicians scattered across India found each other online, united by a shared obsession with technical death metal and a desire to explore the darker corridors of human consciousness.
            </p>
            <p className="font-body text-base md:text-lg leading-relaxed mb-6" style={{ color: "oklch(0.75 0.015 80)" }}>
              The name <em style={{ color: "oklch(0.87 0.02 80)" }}>Ksetravid</em> — derived from the Sanskrit <em>Kshetrajna</em>, meaning "the knower of the field" — reflects the band's conceptual roots in the Upanishads. Their music is a vehicle for self-introspection: how one learns about themselves by seeking what lies within, and what society reflects upon them.
            </p>
            <p className="font-body text-base md:text-lg leading-relaxed mb-8" style={{ color: "oklch(0.75 0.015 80)" }}>
              Fast-paced riffs, complex rhythms, and a voice full of angst and fury — Ksetravid channels the full bandwidth of modern extreme metal. Each member brings a distinct musical heritage, and that collision of influences is precisely what makes their sound impossible to categorize cleanly.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              {[
                { value: "2020", label: "Founded" },
                { value: "4", label: "Singles" },
                { value: "BLR", label: "Origin" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl md:text-4xl mb-1" style={{ color: "oklch(0.52 0.24 25)" }}>
                    {stat.value}
                  </p>
                  <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.55 0.015 285)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="relative">
            <img
              src={BAND_PHOTO_OUTDOOR}
              alt="Ksetravid band"
              className="w-full object-cover"
              style={{ filter: "contrast(1.05) brightness(0.85)", maxHeight: "420px", objectPosition: "center top" }}
            />
            {/* Offset second photo */}
            <div
              className="absolute -bottom-8 -right-4 w-48 h-32 border-2 overflow-hidden hidden md:block"
              style={{ borderColor: "oklch(0.42 0.22 25)" }}
            >
              <img
                src={BAND_PHOTO_BW}
                alt="Ksetravid"
                className="w-full h-full object-cover"
                style={{ filter: "grayscale(100%) contrast(1.2)" }}
              />
            </div>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8" style={{ borderTop: "2px solid oklch(0.52 0.24 25)", borderLeft: "2px solid oklch(0.52 0.24 25)" }} />
            <div className="absolute bottom-0 right-0 w-8 h-8" style={{ borderBottom: "2px solid oklch(0.52 0.24 25)", borderRight: "2px solid oklch(0.52 0.24 25)" }} />
          </div>
        </div>

        {/* Members */}
        <div>
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Current Lineup
          </p>
          <h3 className="font-display text-3xl md:text-4xl mb-10" style={{ color: "oklch(0.93 0.015 80)" }}>
            THE MEMBERS
          </h3>

          {activeMembers.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {activeMembers.map((member, i) => (
                <div
                  key={member.id}
                  className="card-hover-crimson border relative overflow-hidden"
                  style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(0.10 0.006 285)" }}
                >
                  {/* Member photo */}
                  {member.photoUrl ? (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        style={{ filter: "contrast(1.05) brightness(0.9)" }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center" style={{ backgroundColor: "oklch(0.12 0.008 285)" }}>
                      <span className="font-display text-4xl opacity-20" style={{ color: "oklch(0.52 0.24 25)" }}>
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Number accent */}
                    <span className="absolute top-4 right-4 font-display text-5xl opacity-10" style={{ color: "oklch(0.52 0.24 25)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Role badge */}
                    <div
                      className="inline-block font-mono-tech text-xs tracking-widest uppercase px-2 py-1 mb-4"
                      style={{ backgroundColor: "oklch(0.42 0.22 25 / 0.15)", color: "oklch(0.52 0.24 25)", border: "1px solid oklch(0.42 0.22 25 / 0.3)" }}
                    >
                      {member.role}
                    </div>

                    <h4 className="font-display text-xl mb-3" style={{ color: "oklch(0.93 0.015 80)" }}>
                      {member.name}
                    </h4>
                    {member.bio && (
                      <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.60 0.015 285)" }}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border" style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(0.10 0.006 285)" }}>
              <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.55 0.015 285)" }}>
                Lineup details coming soon
              </p>
            </div>
          )}

          {/* Dynamic alert banner — shown only when isActive = true */}
          {alert?.isActive && alert.message && (
            <div
              className="mt-8 p-5 border-l-2 flex items-start gap-4"
              style={{ borderColor: alertStyle.borderColor, backgroundColor: alertStyle.bgColor }}
            >
              <span className="font-mono-tech text-lg" style={{ color: alertStyle.labelColor }}>
                {alertStyle.icon}
              </span>
              <div>
                <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: alertStyle.labelColor }}>
                  {alert.alertType === "recruiting" && "Open Position"}
                  {alert.alertType === "hiatus" && "Band Hiatus"}
                  {alert.alertType === "announcement" && "Announcement"}
                  {alert.alertType === "departure" && "Member Departure"}
                </p>
                <p className="font-body text-sm" style={{ color: "oklch(0.65 0.015 285)" }}>
                  {alert.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
