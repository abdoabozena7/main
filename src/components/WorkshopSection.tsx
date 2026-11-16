import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCheck, Code2, FileText, RotateCcw, ScanEye } from "lucide-react";
import { projects } from "@/data/profileContent";
import SectionBlock from "./SectionBlock";
import ResponsiveThumbnail from "./ResponsiveThumbnail";
import HarrTestFlow from "./HarrTestFlow";

const briefs = {
  local: {
    label: "Build with local models",
    projectId: "hivo",
    title: "A bigger idea. A finite coding budget.",
    description: "You want help with a complex coding task without relying only on cloud-model credits.",
    constraints: ["Keep the project in view", "Use local models", "Coordinate the work"],
    buildTitle: "Give the work a shape before giving it to agents.",
    buildDescription: "This sketch shows a task moving from a scoped brief to coordinated work and an inspectable result.",
    roles: [
      { title: "Scope", detail: "Make the task concrete", Icon: FileText },
      { title: "Coordinate", detail: "Break down the work", Icon: Code2 },
      { title: "Build", detail: "Work in the project", Icon: Code2 },
      { title: "Inspect", detail: "Look at the result", Icon: ScanEye },
    ],
  },
  evidence: {
    label: "Ask for testing evidence",
    projectId: "harrtest",
    title: "'It works' is a claim. Show the evidence.",
    description: "Your coding agent says it tested the app. You want to know what it actually ran and observed.",
    constraints: ["Run the application", "Observe the behavior", "Report what happened"],
    buildTitle: "Turn a confident answer into an evidence loop.",
    buildDescription: "HarrTest describes a repeatable workflow. If a check fails, repair the issue and run the loop again.",
    roles: [
      { title: "Plan", detail: "Define the check", Icon: FileText },
      { title: "Build", detail: "Make the change", Icon: Code2 },
      { title: "Run & observe", detail: "Use the actual app", Icon: ScanEye },
      { title: "Verify", detail: "Show the evidence", Icon: CheckCheck },
    ],
  },
} as const;

type BriefId = keyof typeof briefs;
const briefIds: BriefId[] = ["local", "evidence"];
const steps = ["The brief", "The build", "The evidence"];

export default function WorkshopSection() {
  const [selected, setSelected] = useState<BriefId>("local");
  const [step, setStep] = useState(0);
  const [explored, setExplored] = useState<BriefId[]>([]);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const tour = useRef<HTMLDivElement>(null);
  const brief = briefs[selected];
  const project = projects.find(item => item.id === brief.projectId);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!project?.story) throw new Error(`Missing workshop evidence for ${brief.projectId}`);

  const goToStep = (next: number) => {
    setStep(next);
    if (next === 2) {
      setExplored(previous => previous.includes(selected) ? previous : [...previous, selected]);
    }
    requestAnimationFrame(() => {
      const target = reducedMotion ? document.getElementById(`workshop-scene-${next}`) : tour.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const navHeight = document.querySelector("nav")?.getBoundingClientRect().bottom ?? 80;
      if (rect.top < navHeight || rect.bottom > innerHeight) {
        target.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
      }
    });
  };

  return (
    <SectionBlock id="workshop" title="The workshop">
      <div className="workshop-intro">
        <p className="body-text">
          The interesting part is not the confident answer. It is what happens
          between the brief and something you can inspect.
        </p>
        <span className="workshop-demo-label">An illustrative tour, not a live AI session</span>
      </div>

      <div className="workshop-briefs" role="group" aria-label="Choose a workshop brief">
        {briefIds.map(id => (
          <button
            key={id}
            type="button"
            className="workshop-brief-choice"
            aria-pressed={selected === id}
            onClick={() => { setSelected(id); setStep(0); }}
          >
            <span>{briefs[id].label}</span>
            {explored.includes(id) ? <Check size={17} aria-label="Evidence opened" /> : <ArrowUpRight size={17} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div ref={tour} className="workshop-tour" data-workshop-step={step} data-reduced-motion={reducedMotion}>
        <div className="workshop-control-bar">
          <a className="workshop-skip" href="#projects">Skip to work <ArrowUpRight size={14} aria-hidden="true" /></a>
          <div className="workshop-controls">
            <button type="button" className="workshop-button workshop-button--outline" disabled={step === 0} onClick={() => goToStep(step - 1)}>
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </button>
            <button type="button" className="workshop-button" onClick={() => goToStep(step === 2 ? 0 : step + 1)}>
              {step === 0 ? "See the build" : step === 1 ? "Show the evidence" : "Replay this brief"}
              {step === 2 ? <RotateCcw size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <ol className="workshop-stepper" aria-label="Tour steps">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                aria-current={step === index ? "step" : undefined}
                aria-controls={`workshop-scene-${index}`}
                onClick={() => goToStep(index)}
              >
                <span aria-hidden="true">0{index + 1}</span>{label}
              </button>
            </li>
          ))}
        </ol>
        <p className="sr-only" role="status">{steps[step]} open. Evidence opened for {explored.length} of 2 briefs.</p>

        <div key={selected} className="workshop-stage">
          <section id="workshop-scene-0" className="workshop-scene workshop-scene--brief" hidden={!reducedMotion && step !== 0} aria-labelledby="workshop-brief-heading">
            <div className="workshop-paper">
              <span className="workbench-label">An example brief / 01</span>
              <h3 id="workshop-brief-heading">{brief.title}</h3>
              <p>{brief.description}</p>
              <span className="workshop-paper-fold" aria-hidden="true" />
            </div>
            <div className="workshop-constraints">
              <span className="workbench-label">What matters</span>
              <ul>{brief.constraints.map(constraint => <li key={constraint}><Check size={17} aria-hidden="true" />{constraint}</li>)}</ul>
              <p>No magic prompt. Start with a clear problem.</p>
            </div>
          </section>

          <section id="workshop-scene-1" className="workshop-scene workshop-scene--build" hidden={!reducedMotion && step !== 1} aria-labelledby="workshop-build-heading">
            <div className="workshop-scene-copy">
              <span className="workbench-label">The handoff / 02</span>
              <h3 id="workshop-build-heading">{brief.buildTitle}</h3>
              <p>{brief.buildDescription}</p>
            </div>
            <ol className="workshop-pipeline">
              {brief.roles.map(({ title, detail, Icon }, index) => (
                <li key={title} className="workshop-agent" data-agent-index={index}>
                  <span className="workshop-agent-number">0{index + 1}</span>
                  <Icon size={25} aria-hidden="true" />
                  <strong>{title}</strong>
                  <span>{detail}</span>
                  {index < brief.roles.length - 1 && <ArrowRight className="workshop-handoff" size={18} aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <p className="workshop-caption">A process sketch, not a claim that a task has just run.</p>
          </section>

          <section id="workshop-scene-2" className="workshop-scene workshop-scene--evidence" hidden={!reducedMotion && step !== 2} aria-labelledby="workshop-evidence-heading">
            <div className="workshop-scene-copy">
              <span className="workbench-label">Something you can inspect / 03</span>
              <h3 id="workshop-evidence-heading">{project.title}</h3>
              <p>{project.story.evidence}</p>
              <a className="workshop-button workshop-button--outline" href={`#project-${project.id}`}>
                Inspect {project.title} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className={`workshop-evidence-preview ${project.image ? "" : "workshop-evidence-preview--flow"}`}>
              {project.image ? (
                <ResponsiveThumbnail path={project.image} sizes="(min-width: 768px) 390px, calc(100vw - 96px)" alt={project.imageAlt} width="1920" height="1080" />
              ) : <HarrTestFlow />}
            </div>
          </section>
        </div>
      </div>

      <div className="workshop-discoveries" aria-label="Optional discovery trail">
        <div>
          <span className="workbench-label">Optional detours</span>
          <p>Evidence opened for <strong>{explored.length} / 2</strong> briefs.</p>
          <span className="workshop-caption">Counts your selections, not reading. Resets on reload; nothing is sent.</span>
        </div>
        {explored.length === 2 ? (
          <p className="workshop-build-note"><CheckCheck size={20} aria-hidden="true" /><span><strong>The common thread?</strong> A model's answer is not the evidence. The running product is.</span></p>
        ) : <p className="workshop-detour-hint">Two different briefs. The same question: can you show it?</p>}
      </div>
    </SectionBlock>
  );
}
