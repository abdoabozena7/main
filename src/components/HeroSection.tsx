import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, Github, Linkedin } from "lucide-react";
import MicrosoftHeadline from "./MicrosoftHeadline";
import { profileContent } from "@/data/profileContent";

const HeroSection = () => (
  <section id="hero" data-construction-section className="portfolio-hero">
    <div className="hero-layout">
      <div className="hero-intro">
        <MicrosoftHeadline />
        <h1 className="hero-name">
          Abdelrahman
          <br />
          <span>Abozena.</span>
        </h1>
        <p className="hero-promise">AI ideas. Working software.</p>
        <p className="hero-description">
          I build AI agents and backend systems that turn complex workflows into
          useful software. Start with the work, or step inside the process.
        </p>
        <div className="hero-actions">
          <a className="workshop-button" href="#projects">
            Explore my work <ArrowDown size={17} aria-hidden="true" />
          </a>
          <a className="workshop-button workshop-button--outline" href="#contact">
            Discuss your project <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-secondary">
          <a href={`${import.meta.env.BASE_URL}resume.pdf`} download="Abdelrahman_Abozena_CV.pdf">
            <ArrowDownToLine size={15} aria-hidden="true" /> Download CV
          </a>
          <a href={profileContent.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github size={15} aria-hidden="true" /> GitHub
          </a>
          <a href={profileContent.linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin size={15} aria-hidden="true" /> LinkedIn
          </a>
        </div>
      </div>

      <a className="hero-workbench" href="#workshop" aria-label="See how I build: open the AI workshop">
        <div className="workbench-caption">
          <span>Inside the workshop</span>
          <span aria-hidden="true">01 / 03</span>
        </div>
        <div className="workbench-brief">
          <span className="workbench-label">The brief</span>
          <strong>A big idea.<br />A smaller first step.</strong>
          <span className="workbench-corner" aria-hidden="true" />
        </div>
        <div className="workbench-route" aria-hidden="true">
          <span>Plan</span><ArrowRight size={18} /><span>Build</span><ArrowRight size={18} /><span>Verify</span>
        </div>
        <div className="workbench-result">
          <span className="workbench-stamp" aria-hidden="true">?</span>
          <div><strong>But does it actually work?</strong><span>That is the interesting part.</span></div>
        </div>
        <div className="workbench-invitation">
          <span>See how I build</span><ArrowUpRight size={22} aria-hidden="true" />
        </div>
      </a>
    </div>
    <div className="hero-footnote">
      <span>{profileContent.location}</span>
      <span>AI agents / Python / Backend systems</span>
      <a href="#projects">Start with the work <ArrowDown size={14} aria-hidden="true" /></a>
    </div>
  </section>
);

export default HeroSection;
