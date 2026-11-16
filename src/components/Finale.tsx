import { Github, Linkedin, Mail, Heart, ArrowDownToLine } from "lucide-react";

import { profileContent } from "@/data/profileContent";

const Finale = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/abdoabozena7",
      label: "GitHub",
    },
    {
      icon: Linkedin,
      href: profileContent.linkedinUrl,
      label: "LinkedIn",
    },
    {
      icon: Mail,
      href: "mailto:boodyabozena@gmail.com",
      label: "Email",
    },
    {
      icon: ArrowDownToLine,
      href: `${import.meta.env.BASE_URL}resume.pdf`,
      label: "CV",
      download: "Abdelrahman_Abozena_CV.pdf",
    },
  ];

  return (
    <section data-construction-section className="finale relative w-full bg-white border-t-8 border-black pt-20 overflow-hidden">
      <div className="finale-banner">A clear brief. A thoughtful build. Something you can inspect.</div>

      <div className="finale-content max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        <div className="finale-heading relative mb-20 text-center">
          <div aria-hidden="true" className="text-[12vw] md:text-[8vw] font-black uppercase leading-none tracking-tighter text-black/5 absolute -top-1/2 left-1/2 -translate-x-1/2 select-none pointer-events-none">
            THANK YOU
          </div>
          <p className="text-xl md:text-3xl font-black uppercase tracking-tight italic z-10 relative">
            Let's build something{" "}
            <span className="text-white bg-black px-4 py-1 not-italic">
              impactful
            </span>{" "}
            together.
          </p>
        </div>

        <div className="finale-socials grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-24">
          {socialLinks.map((link, index) => (
            <a
              key={link.label}
              data-tone={index % 5}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              download={"download" in link ? link.download : undefined}
              className="accent-button group flex flex-col items-center justify-center p-8 border-2 border-black bg-white transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              <link.icon className="w-8 h-8 transition-colors duration-300" />
              <span className="mt-4 font-mono text-xs uppercase tracking-widest font-black">
                {link.label}
              </span>
            </a>
          ))}
        </div>

        <div className="finale-note flex flex-col md:flex-row items-center gap-4 text-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#faecb6] border border-black">
            <span className="text-[10px] font-black uppercase tracking-widest text-black">
              {profileContent.headline}
            </span>
          </div>
          <p className="text-xs font-mono text-black/70 uppercase tracking-widest leading-loose max-w-sm">
            {profileContent.footerNote}
          </p>
        </div>
      </div>

      <div className="finale-footer w-full bg-white pt-10 pb-24 md:pb-10 px-6 mt-auto border-t border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 opacity-70">
          <p className="text-[10px] md:text-[11px] font-mono text-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-center md:text-left">
            (c) {currentYear} Abdelrahman Abozena
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] md:text-[11px] font-mono text-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-center md:text-right font-medium">
            <span className="whitespace-nowrap">Designed and Engineered</span>
            <span className="flex items-center gap-2">
              <span>with</span>
              <Heart className="w-3.5 h-3.5 text-black fill-black inline-block" aria-hidden="true" />
              <span>by Abdelrahman</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Finale;
