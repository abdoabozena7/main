import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Work", href: "#projects" },
  { label: "The workshop", href: "#workshop" },
  { label: "About", href: "#about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <nav ref={root} className="portfolio-nav" aria-label="Main navigation">
      <div className="portfolio-nav-inner">
        <a className="portfolio-wordmark" href="#hero" aria-label="Abdelrahman Abozena, home" onClick={() => setOpen(false)}>
          AA<span aria-hidden="true">.</span>
        </a>
        <div className="portfolio-nav-desktop">
          {links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        </div>
        <div className="portfolio-nav-actions">
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>
            Let's talk <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            ref={trigger}
            className="portfolio-menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(value => !value)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open && (
          <div id="mobile-navigation" className="portfolio-nav-mobile">
            {links.map(link => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
            ))}
            <a href="#experience" onClick={() => setOpen(false)}>Experience & background</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
