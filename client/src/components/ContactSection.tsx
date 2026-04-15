/* =============================================================
   KSETRAVID CONTACT + FOOTER
   Contact form + social links + footer
   ============================================================= */
import { useState } from "react";
import { Instagram, Youtube, Music, ExternalLink, Facebook } from "lucide-react";
import { toast } from "sonner";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    handle: "@ksetravid",
    url: "https://www.instagram.com/ksetravid/",
    icon: Instagram,
    color: "oklch(0.65 0.18 330)",
  },
  {
    name: "Facebook",
    handle: "Ksetravid",
    url: "https://www.facebook.com/ksetravid",
    icon: Facebook,
    color: "oklch(0.55 0.18 250)",
  },
  {
    name: "YouTube",
    handle: "@ksetravidmusic",
    url: "https://www.youtube.com/@ksetravidmusic",
    icon: Youtube,
    color: "oklch(0.52 0.24 25)",
  },
  {
    name: "Spotify",
    handle: "Ksetravid",
    url: "https://open.spotify.com/artist/7DAIDyITrD8jeb60tCWQLk",
    icon: Music,
    color: "oklch(0.65 0.18 145)",
  },
  {
    name: "Bandcamp",
    handle: "ksetravid",
    url: "https://ksetravid.bandcamp.com/",
    icon: ExternalLink,
    color: "oklch(0.55 0.15 200)",
  },
  {
    name: "Metal Archives",
    handle: "Ksetravid",
    url: "https://www.metal-archives.com/bands/Ksetravid/3540552358",
    icon: ExternalLink,
    color: "oklch(0.55 0.15 60)",
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate form submission
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.", {
        style: {
          backgroundColor: "oklch(0.10 0.006 285)",
          border: "1px solid oklch(0.42 0.22 25 / 0.5)",
          color: "oklch(0.87 0.02 80)",
        },
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  const inputStyle = {
    backgroundColor: "oklch(0.12 0.006 285)",
    border: "1px solid oklch(1 0 0 / 0.1)",
    color: "oklch(0.87 0.02 80)",
    padding: "12px 16px",
    width: "100%",
    fontFamily: "'Source Serif 4', serif",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      {/* Contact Section */}
      <section
        id="contact"
        className="relative py-14 md:py-24"
        style={{ backgroundColor: "oklch(0.08 0.005 285)" }}
      >
        <div className="container">
          {/* Section header */}
          <div className="mb-10 md:mb-16">
            <p className="font-mono-tech text-xs tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.24 25)" }}>
              ◆ Get in Touch
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4" style={{ color: "oklch(0.93 0.015 80)" }}>
              CONTACT
            </h2>
            <div className="crimson-rule" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Social + Info */}
            <div>
              <p className="font-body text-lg leading-relaxed mb-8" style={{ color: "oklch(0.68 0.015 80)" }}>
                For booking enquiries, press requests, collaborations, or just to connect with the band — reach out via the form or directly at{" "}
                <a
                  href="mailto:ksetravid@gmail.com"
                  className="nav-link-underline"
                  style={{ color: "oklch(0.52 0.24 25)" }}
                >
                  ksetravid@gmail.com
                </a>
              </p>

              {/* Social grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border transition-all duration-200 group"
                      style={{
                        borderColor: "oklch(1 0 0 / 0.08)",
                        backgroundColor: "oklch(0.10 0.006 285)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${social.color}`;
                        (e.currentTarget as HTMLElement).style.backgroundColor = `oklch(0.12 0.006 285)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.08)";
                        (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.10 0.006 285)";
                      }}
                    >
                      <Icon size={16} style={{ color: social.color, flexShrink: 0 }} />
                      <div className="min-w-0">
                        <p className="font-mono-tech text-xs tracking-widest uppercase" style={{ color: "oklch(0.55 0.015 285)" }}>
                          {social.name}
                        </p>
                        <p className="font-body text-sm truncate" style={{ color: "oklch(0.75 0.015 80)" }}>
                          {social.handle}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-tech text-xs tracking-widest uppercase block mb-2" style={{ color: "oklch(0.55 0.015 285)" }}>
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.6)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.1)"; }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs tracking-widest uppercase block mb-2" style={{ color: "oklch(0.55 0.015 285)" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.6)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.1)"; }}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono-tech text-xs tracking-widest uppercase block mb-2" style={{ color: "oklch(0.55 0.015 285)" }}>
                    Subject
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.6)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.1)"; }}
                  >
                    <option value="" disabled>Select subject</option>
                    <option value="booking">Booking Enquiry</option>
                    <option value="press">Press / Media</option>
                    <option value="collab">Collaboration</option>
                    <option value="vocalist">Vocalist Audition</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono-tech text-xs tracking-widest uppercase block mb-2" style={{ color: "oklch(0.55 0.015 285)" }}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(0.42 0.22 25 / 0.6)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.1)"; }}
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 font-mono-tech text-sm tracking-widest uppercase transition-all duration-200"
                  style={{
                    backgroundColor: sending ? "oklch(0.35 0.15 25)" : "oklch(0.42 0.22 25)",
                    color: "oklch(0.97 0.005 80)",
                    border: "1px solid oklch(0.52 0.24 25)",
                    cursor: sending ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)";
                  }}
                  onMouseLeave={(e) => {
                    if (!sending) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)";
                  }}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 border-t"
        style={{
          backgroundColor: "oklch(0.06 0.005 285)",
          borderColor: "oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            {/* Logo + name */}
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_new_14609d64.jpg"
                alt="Ksetravid"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display text-base tracking-widest" style={{ color: "oklch(0.55 0.015 285)" }}>
                KSETRAVID
              </span>
            </div>

            {/* Credits */}
            <div className="text-center">
              <p className="font-mono-tech text-xs" style={{ color: "oklch(0.40 0.01 285)" }}>
                Logo by Dipayan Das · Artwork by Shubham Sarkar (Just Ordinary Artwork)
              </p>
              <p className="font-mono-tech text-xs mt-1" style={{ color: "oklch(0.35 0.01 285)" }}>
                Mix/Master by Simone Pietroforte · VFX by Sonic Spawn Studios
              </p>
            </div>

            {/* Copyright */}
            <p className="font-mono-tech text-xs" style={{ color: "oklch(0.40 0.01 285)" }}>
              © 2026 Ksetravid. Bangalore, India.
            </p>
          </div>

          {/* Bottom divider + tagline */}
          <div
            className="mt-8 pt-6 border-t text-center"
            style={{ borderColor: "oklch(1 0 0 / 0.05)" }}
          >
            <p
              className="font-body text-sm italic"
              style={{ color: "oklch(0.35 0.01 285)" }}
            >
              "The knower of the field" — Rooted in the Upanishads. Forged in fury.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
