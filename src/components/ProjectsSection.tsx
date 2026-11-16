import { Github, Maximize2, Minimize2, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/profileContent";
import SectionBlock from "./SectionBlock";
import ResponsiveThumbnail from "./ResponsiveThumbnail";
import HarrTestFlow from "./HarrTestFlow";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import "@/styles/projects.css";

const actionClass = "accent-button flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-white text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
const selectedProjects = projects.filter(project => project.story);
const otherProjects = projects.filter(project => !project.story);

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const opener = useRef<HTMLButtonElement>(null);
  const [zoomed, setZoomed] = useState(false);

  return (
    <article
      id={`project-${project.id}`}
      tabIndex={-1}
      data-project={project.id}
      data-tone={(index + 2) % 5}
      className={`project-card ${project.kind === "skill" ? "project-card--skill" : ""} ${project.id === "hivo" ? "project-card--featured" : ""} group relative border-2 border-black p-5 flex flex-col transition-all duration-300 bg-white`}
    >
      {project.inProgress && <span className="project-building">In progress</span>}
      <div className="project-copy">
        <h3 className="text-xl font-black text-foreground break-words">{project.title}</h3>
        {project.highlight && <p className="project-highlight">{project.highlight}</p>}
        <p className="project-description body-text mt-4 text-sm font-normal">{project.description}</p>
        <div className="project-tags flex flex-wrap gap-2 mt-4">
          {project.tags.map((tag, tagIndex) => (
            <Badge key={tag} data-tone={(index + tagIndex) % 5} variant="secondary" className="palette-tag font-mono text-[10px] font-bold border border-black/10 px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {project.image ? (
        <Dialog onOpenChange={open => { if (!open) setZoomed(false); }}>
          <div className="project-media">
            <DialogTrigger asChild>
              <button className="project-image-trigger" onClick={event => { opener.current = event.currentTarget; }} aria-label={`Zoom in on ${project.title} screenshot`}>
                <ResponsiveThumbnail path={project.image} sizes="(min-width: 896px) 368px, (min-width: 768px) calc((100vw - 160px) / 2), calc(100vw - 92px)" alt={project.imageAlt} width="1920" height="1080" />
                <span className="project-image-hint" aria-hidden="true"><ZoomIn size={14} /> Take a closer look</span>
              </button>
            </DialogTrigger>
          </div>
          <div className="project-actions flex gap-3 border-t border-black/10">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label={`${project.title} source on GitHub`}>
              <Github className="w-3.5 h-3.5" aria-hidden="true" /> Source
            </a>
            <DialogTrigger asChild>
              <button className={actionClass} onClick={event => { opener.current = event.currentTarget; }} aria-label={`Zoom in ${project.title}`}>
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" /> Zoom in
              </button>
            </DialogTrigger>
          </div>
          <DialogContent className="project-preview-dialog" onCloseAutoFocus={event => {
            event.preventDefault();
            opener.current?.focus({ preventScroll: true });
            const rect = opener.current?.getBoundingClientRect();
            const navHeight = document.querySelector("nav")?.getBoundingClientRect().bottom ?? 80;
            if (rect && (rect.top < navHeight || rect.bottom > innerHeight)) {
              window.scrollTo({ top: scrollY + rect.top - navHeight - 16, behavior: "instant" });
            }
          }}>
            <DialogHeader>
              <DialogTitle>{project.title}</DialogTitle>
              <DialogDescription>{project.imageAlt}</DialogDescription>
            </DialogHeader>
            <div className="project-preview-toolbar">
              <button className="workshop-button workshop-button--outline" type="button" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>
                {zoomed ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                {zoomed ? "Fit image" : "Inspect full size"}
              </button>
              <span>{zoomed ? "Scroll inside the image to inspect the details." : "Open the original at full size for a closer look."}</span>
            </div>
            <div className="project-preview-viewport" data-zoomed={zoomed} tabIndex={zoomed ? 0 : undefined} role="region" aria-label={`${project.title} image${zoomed ? ", scroll to inspect" : ""}`}>
              <img src={`${import.meta.env.BASE_URL}${project.image}`} alt={project.imageAlt} width="1920" height="1080" />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <div className="project-media project-flow-media"><HarrTestFlow /></div>
          <div className="project-actions flex gap-3 border-t border-black/10">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label="Read the HarrTest skill on GitHub">
              <Github className="w-3.5 h-3.5" aria-hidden="true" /> Explore skill
            </a>
          </div>
        </>
      )}

      {project.story && (
        <details className="project-story">
          <summary>Behind the build <span aria-hidden="true">+</span></summary>
          <dl>
            <div><dt>The problem</dt><dd>{project.story.problem}</dd></div>
            <div><dt>The approach</dt><dd>{project.story.approach}</dd></div>
            <div><dt>What you can inspect</dt><dd>{project.story.evidence}</dd></div>
          </dl>
        </details>
      )}
    </article>
  );
}

const ProjectsSection = () => {
  const more = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const revealLinkedProject = () => {
      const id = window.location.hash.slice(1);
      if (otherProjects.some(project => id === `project-${project.id}`) && more.current) {
        more.current.open = true;
        document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    };
    revealLinkedProject();
    window.addEventListener("hashchange", revealLinkedProject);
    return () => window.removeEventListener("hashchange", revealLinkedProject);
  }, []);

  return (
    <SectionBlock id="projects" title="Selected work">
      <p className="section-intro">Two projects to start with. Real interfaces, public source, and the thinking behind the build.</p>
      <div className="project-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
      </div>
      <details ref={more} className="portfolio-more">
        <summary>More experiments & projects ({otherProjects.length})</summary>
        <div className="project-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index + selectedProjects.length} />)}
        </div>
      </details>
    </SectionBlock>
  );
};

export default ProjectsSection;
