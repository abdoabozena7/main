import { honors } from "@/data/profileContent";
import CredentialList from "./CredentialList";
import SectionBlock from "./SectionBlock";

const HonorsSection = () => (
  <SectionBlock id="honors" title="Recognition">
    <CredentialList items={honors.slice(0, 3)} group="honors" />
    <details className="portfolio-more">
      <summary>More completed learning ({honors.length - 3})</summary>
      <CredentialList items={honors.slice(3)} group="honors" />
    </details>
  </SectionBlock>
);

export default HonorsSection;
