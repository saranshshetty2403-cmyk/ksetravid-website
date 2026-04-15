/* =============================================================
   KSETRAVID ABOUT — Band bio + members grid
   Dark circuit-board background, asymmetric layout
   ============================================================= */

const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_about_bg-mps2bmXs33M4MQ8C7eQV9t.webp";
const BAND_PHOTO_OUTDOOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_outdoor_2cab208c.jpg";
const BAND_PHOTO_BW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/band_photo_bw_d0425d7f.jpg";

const MEMBERS = [
  {
    name: "Pritam Middey",
    role: "Guitars",
    description: "The architect of Ksetravid's intricate riff structures, blending technical death metal precision with progressive melodic sensibility.",
  },
  {
    name: "Arunav Bhattacharjee",
    role: "Bass",
    description: "Low-end foundation and harmonic depth. Also active in Sugar! and ex-Nihilus, bringing cross-genre versatility to the rhythm section.",
  },
  {
    name: "Nikhil TR",
    role: "Drums",
    description: "Explosive technical drumming forged across Demonic Resurrection, Godless, and Incendiarius. The rhythmic engine of Ksetravid's chaos.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-14 md:py-24 overflow-hidden"
      style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${ABOUT_BG})`,
          opacity: 0.15,
        }}
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
              style={{
                filter: "contrast(1.05) brightness(0.85)",
                maxHeight: "420px",
                objectPosition: "center top",
              }}
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
            {/* Crimson corner accent */}
            <div
              className="absolute top-0 left-0 w-8 h-8"
              style={{
                borderTop: "2px solid oklch(0.52 0.24 25)",
                borderLeft: "2px solid oklch(0.52 0.24 25)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-8 h-8"
              style={{
                borderBottom: "2px solid oklch(0.52 0.24 25)",
                borderRight: "2px solid oklch(0.52 0.24 25)",
              }}
            />
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

          <div className="grid md:grid-cols-3 gap-6">
            {MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className="card-hover-crimson p-6 border relative overflow-hidden"
                style={{
                  borderColor: "oklch(1 0 0 / 0.08)",
                  backgroundColor: "oklch(0.10 0.006 285)",
                }}
              >
                {/* Number accent */}
                <span
                  className="absolute top-4 right-4 font-display text-5xl opacity-10"
                  style={{ color: "oklch(0.52 0.24 25)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Role badge */}
                <div
                  className="inline-block font-mono-tech text-xs tracking-widest uppercase px-2 py-1 mb-4"
                  style={{
                    backgroundColor: "oklch(0.42 0.22 25 / 0.15)",
                    color: "oklch(0.52 0.24 25)",
                    border: "1px solid oklch(0.42 0.22 25 / 0.3)",
                  }}
                >
                  {member.role}
                </div>

                <h4 className="font-display text-xl mb-3" style={{ color: "oklch(0.93 0.015 80)" }}>
                  {member.name}
                </h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.60 0.015 285)" }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>

          {/* Vocalist search notice */}
          <div
            className="mt-8 p-5 border-l-2 flex items-start gap-4"
            style={{
              borderColor: "oklch(0.62 0.18 60)",
              backgroundColor: "oklch(0.62 0.18 60 / 0.06)",
            }}
          >
            <span className="font-mono-tech text-lg" style={{ color: "oklch(0.62 0.18 60)" }}>⚡</span>
            <div>
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.62 0.18 60)" }}>
                Vocalist Search — 2026
              </p>
              <p className="font-body text-sm" style={{ color: "oklch(0.65 0.015 285)" }}>
                Following the departure of Siddhant Sarkar in March 2026, Ksetravid is actively seeking a new vocalist. The band continues to write and prepare for the release of their debut album <em>God Playing Dice</em>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
