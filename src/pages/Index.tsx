import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EducationSection from "@/components/EducationSection";
import HonorsSection from "@/components/HonorsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import Terminal from "@/components/Terminal";
import Finale from "@/components/Finale";
import WorkshopSection from "@/components/WorkshopSection";
import "@/styles/palette.css";
import "@/styles/portfolio.css";

const Index = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const navigation = new AbortController();
    const cancel = () => navigation.abort();
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown", "hashchange", "popstate"]) {
      window.addEventListener(event, cancel, { once: true, passive: true, signal: navigation.signal });
    }
    // Initial fragments used to be resolved by the animation director.
    void document.fonts.ready.then(() => {
      if (!navigation.signal.aborted && window.location.hash === hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
      }
      navigation.abort();
    });
    return cancel;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <WorkshopSection />
      <ExperienceSection />
      <HonorsSection />
      <EducationSection />
      <AboutSection />
      <ContactSection />
      <Finale />
      <Terminal />
    </div>
  );
};

export default Index;
