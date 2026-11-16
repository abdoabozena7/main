import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import WorkshopSection from "@/components/WorkshopSection";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("counts explicit evidence selections once per brief, including replay and switching briefs", () => {
  render(<WorkshopSection />);
  const trail = screen.getByLabelText("Optional discovery trail");
  expect(trail).toHaveTextContent("0 / 2");
  expect(screen.getByRole("region", { name: "A bigger idea. A finite coding budget." })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: /Ask for testing evidence/ }));
  expect(trail).toHaveTextContent("0 / 2");
  fireEvent.click(screen.getByRole("button", { name: "See the build" }));
  expect(screen.getByRole("region", { name: "Turn a confident answer into an evidence loop." })).toBeVisible();
  expect(trail).toHaveTextContent("0 / 2");
  fireEvent.click(screen.getByRole("button", { name: "Show the evidence" }));
  expect(trail).toHaveTextContent("1 / 2");

  fireEvent.click(screen.getByRole("button", { name: "Replay this brief" }));
  fireEvent.click(screen.getByRole("button", { name: "The evidence" }));
  expect(trail).toHaveTextContent("1 / 2");
  fireEvent.click(screen.getByRole("button", { name: /Build with local models/ }));
  fireEvent.click(screen.getByRole("button", { name: "The evidence" }));
  expect(trail).toHaveTextContent("2 / 2");
  expect(within(trail).getByText("The common thread?")).toBeVisible();
  expect(screen.getByRole("link", { name: "Skip to work" })).toHaveAttribute("href", "#projects");
});

it("shows the complete static story for reduced motion without pretending it was explored", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<WorkshopSection />);

  expect(screen.getByRole("region", { name: "A bigger idea. A finite coding budget." })).toBeVisible();
  expect(screen.getByRole("region", { name: "Give the work a shape before giving it to agents." })).toBeVisible();
  expect(screen.getByRole("region", { name: "Hivo Studio" })).toBeVisible();
  expect(screen.getByLabelText("Optional discovery trail")).toHaveTextContent("0 / 2");
  expect(screen.getByRole("link", { name: "Inspect Hivo Studio" })).toHaveAttribute("href", "#project-hivo");
});
