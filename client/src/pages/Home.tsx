/* =============================================================
   KSETRAVID — MAIN HOME PAGE
   Assembles all sections in order with smooth scroll
   Design: Cosmic Tech-Death Noir
   Sections: Hero → About → Music → Videos → Gallery → Tour → Themes → Merch → Press → Contact
   ============================================================= */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import MusicSection from "@/components/MusicSection";
import VideosSection from "@/components/VideosSection";
import GallerySection from "@/components/GallerySection";
import TourSection from "@/components/TourSection";
import LyricsThemesSection from "@/components/LyricsThemesSection";
import MerchSection from "@/components/MerchSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.08 0.005 285)", color: "oklch(0.87 0.02 80)" }}
    >
      <Navbar />
      <HeroSection />
      <AboutSection />
      <MusicSection />
      <VideosSection />
      <GallerySection />
      <TourSection />
      <LyricsThemesSection />
      <MerchSection />
      <PressSection />
      <ContactSection />
    </div>
  );
}
