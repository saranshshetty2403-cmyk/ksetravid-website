/* =============================================================
   FAQ SECTION — SEO & AEO OPTIMIZED
   Targets: "who is Ksetravid", "Indian death metal bands",
   "Bangalore metal band", "progressive death metal India"
   Matches the JSON-LD FAQPage schema in index.html
   ============================================================= */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Ksetravid?",
    a: "Ksetravid is a progressive death metal and technical death metal band from Bangalore, India, formed in 2020. Their music blends fast-paced riffs, complex rhythms, and intense vocals, rooted in Upanishadic philosophy and exploring themes of consciousness, societal collapse, and the darker side of human existence.",
  },
  {
    q: "What does the name Ksetravid mean?",
    a: "Ksetravid is derived from the Sanskrit word 'Kshetrajna', meaning 'the knower of the field'. The name reflects the band's conceptual roots in the Upanishads and the Bhagavad Gita's concept of self-inquiry — how one learns about themselves by seeking what lies within and what society reflects upon them.",
  },
  {
    q: "What genre is Ksetravid?",
    a: "Ksetravid plays progressive death metal and technical death metal (tech-death), with elements of deathcore. They are part of India's extreme metal scene, based in Bangalore, Karnataka.",
  },
  {
    q: "Where is Ksetravid from?",
    a: "Ksetravid is from Bangalore (Bengaluru), Karnataka, India. The band formed in 2020 when musicians scattered across India connected online during the pandemic, united by a shared obsession with technical death metal.",
  },
  {
    q: "What are Ksetravid's most popular songs?",
    a: "Ksetravid's singles include 'Anamnesis' (2024), 'The Third Eye' (2024), 'Static Belief System' (2022), and 'Man-made Crisis' (2021). Their debut full-length album 'God Playing Dice' is currently in production.",
  },
  {
    q: "Who are the members of Ksetravid?",
    a: "Ksetravid's current lineup includes Pritam Middey (guitars and vocals, founding member), Arunav Bhattacharjee (bass and backing vocals), and Saurav (drums). The band is also currently looking for a lead guitarist to complete the lineup.",
  },
  {
    q: "Is Ksetravid on Spotify?",
    a: "Yes, Ksetravid is available on Spotify, Apple Music, Bandcamp, and YouTube. Search 'Ksetravid' on any major streaming platform to find their singles including Anamnesis, The Third Eye, Static Belief System, and Man-made Crisis.",
  },
  {
    q: "How can I book Ksetravid for a show?",
    a: "To book Ksetravid for a live show, festival slot, or event, contact them directly at ksetravid@gmail.com or via Instagram @ksetravid. You can also use the booking enquiry form in the Contact section of this website.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions about Ksetravid"
      style={{
        backgroundColor: "oklch(0.06 0.005 285)",
        borderTop: "1px solid oklch(0.18 0.01 285)",
        borderBottom: "1px solid oklch(0.18 0.01 285)",
      }}
      className="py-20 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section heading — keyword-rich for SEO */}
        <header className="mb-12 text-center">
          <p
            className="text-xs font-mono uppercase tracking-[0.3em] mb-3"
            style={{ color: "oklch(0.55 0.12 80)" }}
          >
            Know More
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-wider"
            style={{ fontFamily: "Oswald, sans-serif", color: "oklch(0.87 0.02 80)" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="mt-4 text-sm md:text-base max-w-xl mx-auto"
            style={{ color: "oklch(0.60 0.01 285)" }}
          >
            Everything you need to know about Ksetravid — progressive death metal from Bangalore, India.
          </p>
        </header>

        {/* FAQ accordion */}
        <dl className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: isOpen ? "oklch(0.10 0.008 285)" : "oklch(0.09 0.005 285)",
                  border: `1px solid ${isOpen ? "oklch(0.55 0.12 80)" : "oklch(0.16 0.01 285)"}`,
                  borderRadius: "4px",
                  transition: "border-color 0.2s",
                }}
              >
                <dt>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="text-sm md:text-base font-semibold pr-4"
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        color: isOpen ? "oklch(0.75 0.12 80)" : "oklch(0.87 0.02 80)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: "oklch(0.55 0.12 80)",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>
                </dt>
                {isOpen && (
                  <dd
                    className="px-5 pb-5 text-sm md:text-base leading-relaxed"
                    style={{ color: "oklch(0.65 0.01 285)" }}
                  >
                    {faq.a}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>

        {/* Hidden keyword-rich paragraph for crawlers — visually subtle */}
        <p
          className="mt-10 text-xs text-center leading-relaxed"
          style={{ color: "oklch(0.35 0.005 285)" }}
        >
          Ksetravid is one of India's leading progressive death metal and technical death metal bands,
          based in Bangalore, Karnataka. Part of the Indian extreme metal scene alongside bands like
          Demonic Resurrection, Gutslit, and Godless. Stream on Spotify, Apple Music, and Bandcamp.
        </p>
      </div>
    </section>
  );
}
