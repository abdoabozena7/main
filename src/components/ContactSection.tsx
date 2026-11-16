import { useEffect, useRef, useState } from "react";
import SectionBlock from "./SectionBlock";
import { profileContent } from "@/data/profileContent";
import { Mail, MapPin, Copy, Check, Linkedin, Github, ArrowUpRight } from "lucide-react";
import "@/styles/contact.css";

const fieldClass = "peer w-full bg-transparent border-2 border-foreground/30 px-4 py-4 text-foreground focus:outline-none focus:border-black transition-colors";
const labelClass = "absolute left-4 top-4 text-foreground/70 text-sm transition-all duration-200 peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-black peer-focus:bg-background peer-focus:px-2 peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [draftRequested, setDraftRequested] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactEmail = profileContent.email;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio project brief from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    setDraftRequested(true);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const copyEmail = async () => {
    if (timer.current) clearTimeout(timer.current);
    if (!navigator.clipboard?.writeText) {
      setCopyState("error");
      return;
    }
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopyState("copied");
      timer.current = setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <SectionBlock id="contact" title="Get in touch">
      <div className="contact-layout grid md:grid-cols-2 gap-8 md:gap-20">
        <div className="contact-info space-y-8 md:space-y-10">
          <div className="contact-brief-intro">
            <span className="workbench-label">Your next brief</span>
            <p>What should we build?</p>
            <span>Tell me about the workflow, the problem, or the idea you cannot leave alone.</span>
          </div>
          <div className="contact-methods space-y-6">
            <div className="contact-method flex items-center gap-4 p-4 border border-foreground/20 bg-white/50">
              <div className="p-3 bg-black text-white self-start"><Mail className="w-5 h-5" aria-hidden="true" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-foreground/70 mb-1">Email</p>
                <a className="contact-email font-mono text-sm break-all" href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
              <button type="button" onClick={copyEmail} className="contact-copy" aria-label="Copy email">
                {copyState === "copied" ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              </button>
            </div>
            {copyState === "copied" && <p className="contact-feedback" role="status">Email address copied.</p>}
            {copyState === "error" && <p className="contact-feedback contact-feedback--error" role="alert">Could not copy the address. Select the email above to copy it manually, or open it in your email app.</p>}
            <div className="contact-method flex items-center gap-4 p-4 border border-foreground/20 bg-white/50">
              <div className="p-3 bg-black text-white self-start"><MapPin className="w-5 h-5" aria-hidden="true" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground/70 mb-1">Location</p>
                <p className="font-mono text-sm">{profileContent.location}</p>
              </div>
            </div>
          </div>
          <div className="contact-connect">
            <p className="text-xs uppercase tracking-widest text-foreground/70 mb-4">Elsewhere</p>
            <div className="flex flex-wrap gap-4">
              {[
                { Icon: Github, href: profileContent.githubUrl, label: "GitHub" },
                { Icon: Linkedin, href: profileContent.linkedinUrl, label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="contact-social" aria-label={label}>
                  <Icon size={18} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-brief-form space-y-6" aria-describedby="email-draft-help">
          <p id="email-draft-help" className="contact-draft-help">This opens your email app with a draft. You review it and send it there; nothing is submitted on this site.</p>
          <div className="group relative">
            <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder=" " value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className={fieldClass} />
            <label htmlFor="contact-name" className={labelClass}>Your name</label>
          </div>
          <div className="group relative">
            <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder=" " value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={fieldClass} />
            <label htmlFor="contact-email" className={labelClass}>Email address</label>
          </div>
          <div className="group relative">
            <textarea id="contact-message" name="message" required rows={5} placeholder=" " value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className={`${fieldClass} resize-y`} />
            <label htmlFor="contact-message" className={labelClass}>A little about your project</label>
          </div>
          <button type="submit" className="workshop-button w-full">Open email draft <Mail size={17} aria-hidden="true" /></button>
          {draftRequested && <p className="contact-feedback" role="status">Your email app should open with a draft. If nothing happens, use the email address or Copy email instead.</p>}
        </form>
      </div>
    </SectionBlock>
  );
};

export default ContactSection;
