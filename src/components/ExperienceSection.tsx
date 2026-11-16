import { training, experiences, companyLogos, type ExperienceItem } from "@/data/profileContent";
import SectionBlock from "./SectionBlock";

function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <div className="experience-list">
      {items.map(item => (
        <article key={`${item.company}-${item.role}`} className="experience-item">
          <div className="experience-brand">
            <div className="company-logo">
              {companyLogos[item.company]
                ? <img src={`${import.meta.env.BASE_URL}${companyLogos[item.company].image}`} alt="" loading="lazy" decoding="async" width="48" height="48" />
                : <span className="font-mono text-xs" aria-hidden="true">{item.company.slice(0, 2)}</span>}
            </div>
            <div className="experience-copy">
              <h3 className="experience-company font-bold">{item.company}</h3>
              <p className="experience-role">{item.role}</p>
              <p className="experience-period">{item.period}{item.location && <span> / {item.location}</span>}</p>
              {item.description && <p className="experience-description">{item.description}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

const ExperienceSection = () => (
  <SectionBlock id="experience" title="Experience">
    <p className="section-intro">A little context behind the work.</p>
    <Timeline items={experiences.slice(0, 3)} />
    <details className="portfolio-more">
      <summary>Earlier roles & applied training</summary>
      <Timeline items={experiences.slice(3)} />
      <h3 className="experience-training-heading">Internships & applied training</h3>
      <Timeline items={training} />
    </details>
  </SectionBlock>
);

export default ExperienceSection;
