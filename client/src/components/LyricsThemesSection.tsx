/* =============================================================
   KSETRAVID LYRICAL THEMES — Philosophy & Themes section
   Showcases the conceptual depth of the band's music
   ============================================================= */

const THEMES = [
  {
    icon: "◎",
    title: "Upanishadic Philosophy",
    description: "The band's name itself — Ksetravid, 'the knower of the field' — is drawn from the Bhagavad Gita's concept of Kshetrajna. Their music explores the ancient Indian philosophical tradition of self-inquiry and cosmic consciousness.",
    color: "oklch(0.62 0.18 60)",
  },
  {
    icon: "⊕",
    title: "Manmade Crisis",
    description: "A recurring theme across their discography: the self-destructive nature of human civilization, the illnesses we create for ourselves and each other, and the systemic failures of modern society.",
    color: "oklch(0.52 0.24 25)",
  },
  {
    icon: "◉",
    title: "Consciousness & Awakening",
    description: "From the Third Eye's exploration of the Ajna chakra to Anamnesis's fractured memory, Ksetravid consistently probes the boundaries of perception, awareness, and what lies beyond ordinary consciousness.",
    color: "oklch(0.55 0.18 250)",
  },
  {
    icon: "⊗",
    title: "False Belief Systems",
    description: "Static Belief System exemplifies the band's critical stance toward organized religion and dogmatic thinking. They challenge the structures humans build to avoid confronting deeper truths.",
    color: "oklch(0.55 0.15 200)",
  },
  {
    icon: "◈",
    title: "Science Fiction",
    description: "A futuristic lens applied to ancient questions. Ksetravid blends sci-fi imagery with philosophical inquiry, creating a sound that feels simultaneously ancient and apocalyptically modern.",
    color: "oklch(0.60 0.15 145)",
  },
  {
    icon: "◬",
    title: "The Darker Side of Life",
    description: "Uncompromising realism. The band refuses to sanitize human experience — their music confronts suffering, violence, collapse, and the uncomfortable truths that most art avoids.",
    color: "oklch(0.55 0.15 300)",
  },
];

export default function LyricsThemesSection() {
  return (
    <section
      className="relative py-24"
      style={{ backgroundColor: "oklch(0.07 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Conceptual Depth
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            THEMES
          </h2>
          <div className="crimson-rule" />
          <p className="font-body text-lg mt-6 max-w-2xl" style={{ color: "oklch(0.65 0.015 80)", fontStyle: "italic" }}>
            Ksetravid's music is not merely sonic — it is a philosophical project. Each release is a chapter in an ongoing exploration of consciousness, society, and the human condition.
          </p>
        </div>

        {/* Themes grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THEMES.map((theme) => (
            <div
              key={theme.title}
              className="card-hover-crimson p-6 border relative overflow-hidden"
              style={{
                borderColor: "oklch(1 0 0 / 0.08)",
                backgroundColor: "oklch(0.10 0.006 285)",
              }}
            >
              {/* Icon */}
              <div
                className="font-mono-tech text-3xl mb-4"
                style={{ color: theme.color }}
              >
                {theme.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-lg mb-3" style={{ color: "oklch(0.87 0.02 80)" }}>
                {theme.title}
              </h3>

              {/* Description */}
              <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.58 0.015 285)" }}>
                {theme.description}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300"
                style={{ backgroundColor: theme.color }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }}
              />
            </div>
          ))}
        </div>

        {/* Quote */}
        <div
          className="mt-16 p-8 md:p-12 border-l-4 relative"
          style={{
            borderColor: "oklch(0.42 0.22 25)",
            backgroundColor: "oklch(0.42 0.22 25 / 0.04)",
          }}
        >
          <p
            className="font-body text-xl md:text-2xl leading-relaxed italic"
            style={{ color: "oklch(0.75 0.015 80)" }}
          >
            "The project finds its conceptual roots in the Upanishads and the music aims to cover realism to portray the darker side of human life. The band takes self-introspection through a bandwidth of thoughts — how one learns about themselves by seeking what's inside and what society reflects upon them."
          </p>
          <p className="font-mono-tech text-xs tracking-widest uppercase mt-4" style={{ color: "oklch(0.45 0.015 285)" }}>
            — Ksetravid
          </p>
        </div>
      </div>
    </section>
  );
}
