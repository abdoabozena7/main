import { useEffect } from "react";

/** Keep the upcoming screen warm without promoting every image during mount. */
export function usePortfolioMediaPreload() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const nearby = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const image = entry.target as HTMLImageElement;
        if (image.loading === "lazy") {
          image.fetchPriority = "low";
          image.loading = "eager";
        }
        nearby.unobserve(image);
      }
    }, { rootMargin: "360px 0px" });

    document.querySelectorAll<HTMLImageElement>("section img[loading=lazy]").forEach(image => nearby.observe(image));
    return () => nearby.disconnect();
  }, []);
}
