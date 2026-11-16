import { useRef, type CSSProperties } from "react";
import { useScrollConstruction } from "@/hooks/useScrollConstruction";
import { usePortfolioMediaPreload } from "@/hooks/usePortfolioMediaPreload";
import { constructionAgents as agents, compactAgentSlots } from "@/lib/agentConfig";
import "@/styles/construction.css";

const wideOnly = (index: number) => compactAgentSlots.has(index) ? undefined : "";

/** Keep content choreography and its worker slots without drawing cursor actors. */
export default function AgentConstruction() {
  const layer = useRef<HTMLDivElement>(null);
  usePortfolioMediaPreload();
  useScrollConstruction(layer);
  return (
    <div ref={layer} data-content-construction data-pointerless aria-hidden="true" className="agent-construction">
      <div className="scene-agent-layer" data-scene-layer />
      <svg className="construction-guides" width="100%" height="100%">
        {agents.map((agent, index) => (
          <g key={agent.name} data-guide={agent.task} data-wide-agent={wideOnly(index)} opacity="0" style={{ color: agent.color }}>
            <rect className="construction-selection" rx="0" pathLength="1" />
            <path className="construction-handles" />
          </g>
        ))}
      </svg>
      {agents.map((agent, index) => (
        <div key={agent.task} data-prop={agent.task} data-wide-agent={wideOnly(index)} className="construction-prop" style={{ "--agent-color": agent.color } as CSSProperties}>
          <div className="construction-prop-surface">
            <img className="prop-template" alt="" /><img className="prop-image" alt="" />
            <div className="prop-icon" />
            <span className="prop-template-label" /><span className="prop-label" />
          </div>
          <span className="prop-copy" /><span className="prop-handle" />
          <span className="prop-operation" />
        </div>
      ))}
      {agents.map((agent, index) => (
        <div key={agent.name} data-agent={agent.task} data-role={agent.role} className="construction-worker" hidden style={{ "--agent-color": agent.color } as CSSProperties}>
          <span className="agent-action" />
        </div>
      ))}
      {agents.map((agent, index) => <div key={agent.task} data-caret={agent.task} data-wide-agent={wideOnly(index)} className="construction-caret" style={{ background: agent.color }} />)}
    </div>
  );
}
