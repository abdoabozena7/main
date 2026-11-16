import { startScrollGuard } from "./lib/scrollGuard";

startScrollGuard();
void import("./renderApp").catch(error => {
  console.error("Unable to load the portfolio", error);
  const root = document.getElementById("root");
  if (root) root.textContent = "The portfolio could not load. Please reload the page to try again.";
});
