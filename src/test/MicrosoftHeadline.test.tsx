import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MicrosoftHeadline from "@/components/MicrosoftHeadline";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("offers the story without waiting for the removed construction animation", () => {
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
  render(<MicrosoftHeadline />);

  expect(screen.queryByText("Want the story?")).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1400));
  expect(screen.getByText("Want the story?")).toBeVisible();

  const badge = screen.getByRole("link", { name: /SWE Intern at Microsoft/ });
  fireEvent.keyDown(badge, { key: "Escape" });
  expect(screen.queryByText("Want the story?")).not.toBeInTheDocument();

  fireEvent.focus(badge);
  expect(screen.getByText("Want the story?")).toBeVisible();
});
