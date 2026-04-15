/* =============================================================
   KSETRAVID VIDEOS — YouTube embeds grid
   ============================================================= */
import { useState } from "react";
import { Play, ExternalLink, X } from "lucide-react";

const VIDEOS = [
  {
    id: "v1",
    title: "Anamnesis",
    subtitle: "Official Lyric Visualiser",
    year: "2024",
    youtubeId: "54oXZuvPpaI",
    thumbnail: "https://img.youtube.com/vi/54oXZuvPpaI/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/54oXZuvPpaI",
    watchUrl: "https://www.youtube.com/watch?v=54oXZuvPpaI",
    description: "The official lyric visualiser for Anamnesis — a journey through fractured memory and metaphysical recollection.",
  },
  {
    id: "v2",
    title: "The Third Eye",
    subtitle: "Official Animated Video",
    year: "2024",
    youtubeId: "72yigqf3jE4",
    thumbnail: "https://img.youtube.com/vi/72yigqf3jE4/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/72yigqf3jE4",
    watchUrl: "https://www.youtube.com/watch?v=72yigqf3jE4",
    description: "An animated visual exploration of the Ajna chakra — the awakening of the third eye and higher consciousness.",
  },
  {
    id: "v3",
    title: "Static Belief System",
    subtitle: "Official Music Video",
    year: "2022",
    youtubeId: "W4nXoQZfRK0",
    thumbnail: "https://img.youtube.com/vi/W4nXoQZfRK0/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/W4nXoQZfRK0",
    watchUrl: "https://www.youtube.com/watch?v=W4nXoQZfRK0",
    description: "The first official music video featuring all band members. A visceral critique of organized religion and dogmatic systems.",
  },
  {
    id: "v4",
    title: "Man-made Crisis",
    subtitle: "Official Lyric Video",
    year: "2021",
    youtubeId: "Vnlm04RF5Mo",
    thumbnail: "https://img.youtube.com/vi/Vnlm04RF5Mo/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/Vnlm04RF5Mo",
    watchUrl: "https://www.youtube.com/watch?v=Vnlm04RF5Mo",
    description: "The debut lyric video. Intricate occult artwork animates the themes of societal illness and human-made catastrophe.",
  },
];

export default function VideosSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [featuredPlaying, setFeaturedPlaying] = useState(false);

  return (
    <section
      id="videos"
      className="relative py-14 md:py-24"
      style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
    >
      <div className="container">
        {/* Section header */}
        <div className="mb-10 md:mb-16">
          <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
            ◆ Visual Content
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
            VIDEOS
          </h2>
          <div className="crimson-rule" />
        </div>

        {/* Featured video (first) */}
        <div className="mb-12">
          <div
            className="relative overflow-hidden border"
            style={{ borderColor: "oklch(0.42 0.22 25 / 0.3)" }}
          >
            {featuredPlaying ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${VIDEOS[0].youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={VIDEOS[0].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="relative aspect-video cursor-pointer group"
                onClick={() => setFeaturedPlaying(true)}
              >
                <img
                  src={VIDEOS[0].thumbnail}
                  alt={VIDEOS[0].title}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.55) saturate(0.7)" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${VIDEOS[0].youtubeId}/hqdefault.jpg`; }}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{
                    background: "linear-gradient(to top, oklch(0.06 0.005 285 / 0.9) 0%, transparent 60%)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: "oklch(0.42 0.22 25)",
                      boxShadow: "0 0 30px oklch(0.42 0.22 25 / 0.5)",
                    }}
                  >
                    <Play size={24} style={{ color: "white", marginLeft: "3px" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.24 25)" }}>
                      {VIDEOS[0].subtitle}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl" style={{ color: "oklch(0.93 0.015 80)" }}>
                      {VIDEOS[0].title}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {VIDEOS.slice(1).map((video) => (
            <div
              key={video.id}
              className="card-hover-crimson border overflow-hidden"
              style={{
                borderColor: "oklch(1 0 0 / 0.08)",
                backgroundColor: "oklch(0.10 0.006 285)",
              }}
            >
              {/* Thumbnail / Embed toggle */}
              <div className="relative aspect-video overflow-hidden">
                {activeVideo === video.id ? (
                  <>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.9)" }}
                    >
                      <X size={12} style={{ color: "oklch(0.87 0.02 80)" }} />
                    </button>
                  </>
                ) : (
                  <div
                    className="absolute inset-0 cursor-pointer group"
                    onClick={() => setActiveVideo(video.id)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "brightness(0.6) saturate(0.75)" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`; }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "oklch(0.06 0.005 285 / 0.25)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                        style={{ backgroundColor: "oklch(0.42 0.22 25 / 0.9)", boxShadow: "0 0 20px oklch(0.42 0.22 25 / 0.4)" }}
                      >
                        <Play size={14} style={{ color: "white", marginLeft: "2px" }} />
                      </div>
                    </div>
                    <span
                      className="absolute top-2 right-2 font-mono-tech text-xs px-2 py-0.5"
                      style={{ backgroundColor: "oklch(0.06 0.005 285 / 0.9)", color: "oklch(0.55 0.015 285)" }}
                    >
                      {video.year}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-mono-tech text-xs tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.24 25)" }}>
                  {video.subtitle}
                </p>
                <h4 className="font-display text-lg mb-2" style={{ color: "oklch(0.87 0.02 80)" }}>
                  {video.title}
                </h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.55 0.015 285)" }}>
                  {video.description}
                </p>
                <a
                  href={video.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 font-mono-tech text-xs tracking-widest uppercase transition-colors duration-200"
                  style={{ color: "oklch(0.52 0.24 25)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.24 25)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.52 0.24 25)"; }}
                >
                  <ExternalLink size={10} />
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* YouTube channel CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@ksetravidmusic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono-tech text-sm tracking-widest uppercase border transition-all duration-200"
            style={{
              borderColor: "oklch(0.42 0.22 25 / 0.5)",
              color: "oklch(0.87 0.02 80)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25 / 0.1)";
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.24 25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.5)";
            }}
          >
            <ExternalLink size={14} />
            View All Videos on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
