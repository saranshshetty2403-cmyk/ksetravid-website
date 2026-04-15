/* =============================================================
   KSETRAVID MUSIC — Discography with embedded Spotify/Bandcamp
   Magazine-style album art grid + streaming links
   ============================================================= */
import { useState } from "react";
import { ExternalLink, Music, Play } from "lucide-react";

const RELEASES = [
  {
    id: "anamnesis",
    title: "Anamnesis",
    type: "Single",
    year: "2024",
    artwork: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_anamnesis_ecc6e99c.jpg",
    description: "The fourth and most recent single from Ksetravid. A journey into twisted realities, metaphysical recollection, and the fractured nature of memory. The artwork — a stone figure with a shattered, glowing head — embodies the theme of consciousness torn between worlds.",
    spotify: "https://open.spotify.com/track/4F6v1MYsJjBSjPBgkFHcAl",
    bandcamp: "https://ksetravid.bandcamp.com/track/anamnesis",
    youtube: "https://www.youtube.com/watch?v=ksetravid-anamnesis",
    spotifyEmbed: "4F6v1MYsJjBSjPBgkFHcAl",
    themes: ["Twisted Reality", "Metaphysics", "Memory", "Consciousness"],
  },
  {
    id: "thirdeye",
    title: "The Third Eye",
    type: "Single",
    year: "2024",
    artwork: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_thirdeye_8b380d53.jpg",
    description: "Released May 3, 2024. An exploration of intuition, higher consciousness, and the awakening of the third eye — the Ajna chakra. The artwork, a massive eye with a yin-yang pupil, visualizes the duality of sight: what we see and what we perceive beyond the physical.",
    spotify: "https://open.spotify.com/track/ksetravid-thirdeye",
    bandcamp: "https://ksetravid.bandcamp.com/track/the-third-eye",
    youtube: "https://www.youtube.com/watch?v=ksetravid-thirdeye",
    themes: ["Consciousness", "Mysticism", "Intuition", "Awakening"],
  },
  {
    id: "staticbelief",
    title: "Static Belief System",
    type: "Single",
    year: "2022",
    artwork: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_staticbelief_31fffd1f.png",
    description: "The second single, featuring an official music video with all band members. An acerbic examination of organized religion and the failings of dogmatic belief systems. Rolling Stone India praised vocalist Sunneith Revankar's aggressive delivery, aided by Ezra Helios on bass and Jerry Nelson on drums.",
    spotify: "https://open.spotify.com/track/ksetravid-staticbelief",
    bandcamp: "https://ksetravid.bandcamp.com/track/static-belief-system",
    youtube: "https://www.youtube.com/watch?v=ksetravid-staticbelief",
    themes: ["Religion", "Dogma", "False Belief", "Critique"],
  },
  {
    id: "manmadecrisis",
    title: "Man-made Crisis",
    type: "Single",
    year: "2021",
    artwork: "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/single_manmadecrisis_864cae4e.jpg",
    description: "The debut single. A catharsis born from deep-seated illness — both personal and societal. Conceptually rooted in the Upanishads, the music covers realism to portray the darker side of human life. The intricate occult artwork sets the visual tone for everything that followed.",
    spotify: "https://open.spotify.com/track/ksetravid-manmadecrisis",
    bandcamp: "https://ksetravid.bandcamp.com/track/man-made-crisis",
    youtube: "https://www.youtube.com/watch?v=ksetravid-manmadecrisis",
    themes: ["Illness", "Society", "Upanishads", "Human Darkness"],
  },
];

const UPCOMING_ALBUM = {
  title: "God Playing Dice",
  type: "Debut Album",
  status: "In Production",
  description: "Ksetravid's debut full-length album. A culmination of years of writing, refining, and raging. The title references Einstein's famous quote — 'God does not play dice' — inverted as a challenge to determinism and the illusion of control.",
};

export default function MusicSection() {
  const [activeRelease, setActiveRelease] = useState(RELEASES[0]);

  return (
    <section
      id="music"
      className="relative py-24"
      style={{ backgroundColor: "oklch(0.06 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Discography
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            MUSIC
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Upcoming Album Banner */}
        <div
          className="mb-16 p-6 md:p-8 border relative overflow-hidden"
          style={{
            borderColor: "oklch(0.62 0.18 60 / 0.4)",
            backgroundColor: "oklch(0.62 0.18 60 / 0.05)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, oklch(0.62 0.18 60), transparent)" }}
          />
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="font-mono-tech text-xs tracking-widest uppercase mb-2" style={{ color: "oklch(0.62 0.18 60)" }}>
                ⚡ {UPCOMING_ALBUM.type} — {UPCOMING_ALBUM.status}
              </p>
              <h3 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "oklch(0.93 0.015 80)" }}>
                {UPCOMING_ALBUM.title}
              </h3>
              <p className="font-body text-base leading-relaxed" style={{ color: "oklch(0.65 0.015 285)" }}>
                {UPCOMING_ALBUM.description}
              </p>
            </div>
            <div
              className="flex-shrink-0 px-6 py-3 border font-mono-tech text-sm tracking-widest uppercase text-center"
              style={{
                borderColor: "oklch(0.62 0.18 60 / 0.5)",
                color: "oklch(0.62 0.18 60)",
              }}
            >
              Coming Soon
            </div>
          </div>
        </div>

        {/* Main discography layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Release list — left sidebar */}
          <div className="lg:col-span-2 space-y-2">
            {RELEASES.map((release) => (
              <button
                key={release.id}
                onClick={() => setActiveRelease(release)}
                className="w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border"
                style={{
                  borderColor: activeRelease.id === release.id
                    ? "oklch(0.42 0.22 25 / 0.5)"
                    : "oklch(1 0 0 / 0.06)",
                  backgroundColor: activeRelease.id === release.id
                    ? "oklch(0.42 0.22 25 / 0.1)"
                    : "oklch(0.10 0.006 285)",
                }}
              >
                <img
                  src={release.artwork}
                  alt={release.title}
                  className="w-14 h-14 object-cover flex-shrink-0"
                  style={{
                    filter: activeRelease.id === release.id ? "none" : "grayscale(60%) brightness(0.7)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base truncate" style={{ color: "oklch(0.87 0.02 80)" }}>
                    {release.title}
                  </p>
                  <p className="font-mono-tech text-xs" style={{ color: "oklch(0.55 0.015 285)" }}>
                    {release.type} · {release.year}
                  </p>
                </div>
                {activeRelease.id === release.id && (
                  <Play size={14} style={{ color: "oklch(0.52 0.24 25)", flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Active release detail — right */}
          <div className="lg:col-span-3">
            <div
              className="border p-6 md:p-8 h-full"
              style={{
                borderColor: "oklch(1 0 0 / 0.08)",
                backgroundColor: "oklch(0.10 0.006 285)",
              }}
            >
              {/* Artwork + title */}
              <div className="flex gap-6 mb-6">
                <img
                  src={activeRelease.artwork}
                  alt={activeRelease.title}
                  className="w-28 h-28 md:w-36 md:h-36 object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-mono-tech text-xs tracking-widest uppercase mb-2" style={{ color: "oklch(0.52 0.24 25)" }}>
                    {activeRelease.type} · {activeRelease.year}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.93 0.015 80)" }}>
                    {activeRelease.title}
                  </h3>
                  {/* Theme tags */}
                  <div className="flex flex-wrap gap-2">
                    {activeRelease.themes.map((theme) => (
                      <span
                        key={theme}
                        className="font-mono-tech text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: "oklch(0.15 0.008 285)",
                          color: "oklch(0.55 0.015 285)",
                        }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "oklch(0.68 0.015 80)" }}>
                {activeRelease.description}
              </p>

              {/* Spotify Embed */}
              {activeRelease.id === "anamnesis" && (
                <div className="mb-6">
                  <iframe
                    src="https://open.spotify.com/embed/track/4F6v1MYsJjBSjPBgkFHcAl?utm_source=generator&theme=0"
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Anamnesis on Spotify"
                    style={{ borderRadius: "2px" }}
                  />
                </div>
              )}

              {/* Streaming links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
                  style={{
                    backgroundColor: "oklch(0.45 0.18 145)",
                    color: "oklch(0.97 0.005 80)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <Music size={12} />
                  Spotify
                </a>
                <a
                  href={activeRelease.bandcamp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
                  style={{
                    backgroundColor: "oklch(0.50 0.15 200)",
                    color: "oklch(0.97 0.005 80)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <ExternalLink size={12} />
                  Bandcamp
                </a>
                <a
                  href="https://www.youtube.com/@ksetravidmusic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 font-mono-tech text-xs tracking-widest uppercase transition-all duration-200"
                  style={{
                    backgroundColor: "oklch(0.45 0.22 25)",
                    color: "oklch(0.97 0.005 80)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <Play size={12} />
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* All platforms */}
        <div
          className="mt-12 pt-8 border-t flex flex-wrap items-center gap-6"
          style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
        >
          <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.45 0.015 285)" }}>
            Stream on:
          </p>
          {[
            { name: "Spotify", url: "https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk" },
            { name: "Bandcamp", url: "https://ksetravid.bandcamp.com/" },
            { name: "YouTube", url: "https://www.youtube.com/@ksetravidmusic" },
            { name: "Apple Music", url: "https://music.apple.com/search?term=ksetravid" },
            { name: "Amazon Music", url: "https://music.amazon.com/search/ksetravid" },
          ].map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-tech text-xs tracking-widest uppercase transition-colors duration-200 nav-link-underline"
              style={{ color: "oklch(0.60 0.015 285)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.87 0.02 80)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.60 0.015 285)"; }}
            >
              {platform.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
