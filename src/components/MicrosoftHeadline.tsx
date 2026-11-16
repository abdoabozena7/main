import { ArrowUpRight } from "lucide-react";
import { profileContent } from "@/data/profileContent";

export default function MicrosoftHeadline() {
  return (
    <a
      href={profileContent.microsoftStoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SWE Intern at Microsoft — read my story on LinkedIn"
      data-microsoft-headline
      className="microsoft-headline"
    >
      <img src={`${import.meta.env.BASE_URL}images/microsoft-symbol.svg`} width="16" height="16" alt="" />
      <span>{profileContent.headline}</span>
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}
