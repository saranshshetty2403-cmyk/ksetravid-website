/* =============================================================
   KSETRAVID PRESS — Media coverage + press kit
   ============================================================= */
import { ExternalLink } from "lucide-react";

const PRESS_FEATURES = [
  {
    publication: "The Hindu",
    date: "June 11, 2025",
    headline: "Bengaluru band Ksetravid take their sound, story and fury on four-city tour",
    excerpt: "Vocalist Siddhanth Sarkar of tech-death/prog metal band Ksetravid talks about the release of their debut album, God Playing Dice, and the ongoing four-city Hisaab Barabar India Tour.",
    url: "https://www.thehindu.com/news/cities/bangalore/bengaluru-band-ksetravid-take-their-sound-story-and-fury-on-four-city-tour/article69659504.ece",
    type: "Feature",
  },
  {
    publication: "Rolling Stone India",
    date: "August 17, 2022",
    headline: "New Rock and Metal: Ksetravid, Undying Inc, Hotaru, Archonist and more",
    excerpt: "Vocalist Sunneith Revankar pushes his vocals perhaps more aggressively than ever before, aided by bassist Ezra Helios and drummer Jerry Nelson. The result is a track that refuses to be ignored.",
    url: "https://rollingstoneindia.com/new-rock-metal-undying-inc-ksetravid-hotaru-archonist-still-status-scalar/",
    type: "Review",
  },
  {
    publication: "Unite Asia",
    date: "August 2, 2021",
    headline: "Metal Band Ksetravid Release Debut Single [India]",
    excerpt: "Indian modern metal project Ksetravid has released their debut single 'Man-made Crisis' which relates to a catharsis owning to one's deep-seated illness. Conceptually, the project finds its roots in Upanishads.",
    url: "https://uniteasia.org/metal-band-ksetravid-release-debut-single-india/",
    type: "News",
  },
  {
    publication: "The Mosh",
    date: "2024",
    headline: "Ksetravid — Band Profile",
    excerpt: "Ksetravid is a modern metal band from Bangalore, India. Formed in 2020 amid the global pandemic crisis, musicians from different parts of the country collaborated online, writing music that fit their individual experiences.",
    url: "https://themosh.net/bands-near-me/middle-east-asia/india/ksetravid/",
    type: "Profile",
  },
];

const TYPE_COLORS: Record<string, string> = {
  Feature: "oklch(0.55 0.18 250)",
  Review: "oklch(0.52 0.24 25)",
  News: "oklch(0.62 0.18 60)",
  Profile: "oklch(0.55 0.15 145)",
};

export default function PressSection() {
  return (
    <section
      id="press"
      className="relative py-24"
      style={{ backgroundColor: "oklch(0.06 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Media Coverage
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            PRESS
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Press features */}
        <div className="space-y-4 mb-16">
          {PRESS_FEATURES.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border p-6 transition-all duration-200 group"
              style={{
                borderColor: "oklch(1 0 0 / 0.08)",
                backgroundColor: "oklch(0.10 0.006 285)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.4)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.08)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.10 0.006 285)";
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className="font-mono-tech text-xs tracking-widest uppercase px-2 py-0.5"
                      style={{
                        backgroundColor: `${TYPE_COLORS[item.type]}20`,
                        color: TYPE_COLORS[item.type],
                        border: `1px solid ${TYPE_COLORS[item.type]}40`,
                      }}
                    >
                      {item.type}
                    </span>
                    <span className="font-display text-sm" style={{ color: "oklch(0.65 0.015 285)" }}>
                      {item.publication}
                    </span>
                    <span className="font-mono-tech text-xs" style={{ color: "oklch(0.45 0.015 285)" }}>
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-display text-lg md:text-xl mb-2 group-hover:text-[oklch(0.87_0.02_80)] transition-colors duration-200" style={{ color: "oklch(0.80 0.015 80)" }}>
                    {item.headline}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.58 0.015 285)" }}>
                    "{item.excerpt}"
                  </p>
                </div>
                <ExternalLink
                  size={16}
                  className="flex-shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "oklch(0.52 0.24 25)" }}
                />
              </div>
            </a>
          ))}
        </div>

        {/* Press Kit CTA */}
        <div
          className="p-8 border text-center"
          style={{
            borderColor: "oklch(0.42 0.22 25 / 0.3)",
            backgroundColor: "oklch(0.42 0.22 25 / 0.04)",
          }}
        >
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ For Media
          </p>
          <h3 className="font-display text-2xl md:text-3xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            PRESS KIT
          </h3>
          <p className="font-body text-base mb-6 max-w-lg mx-auto" style={{ color: "oklch(0.65 0.015 285)" }}>
            For press photos, band bio, high-resolution artwork, and interview requests, contact us directly.
          </p>
          <a
            href="mailto:ksetravid@gmail.com?subject=Press%20Kit%20Request"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase border transition-all duration-200"
            style={{
              borderColor: "oklch(0.42 0.22 25 / 0.5)",
              color: "oklch(0.87 0.02 80)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            Request Press Kit
          </a>
        </div>
      </div>
    </section>
  );
}
