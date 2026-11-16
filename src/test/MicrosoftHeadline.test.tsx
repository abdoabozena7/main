import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MicrosoftHeadline from "@/components/MicrosoftHeadline";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps the story available inline without an automatic overlapping tooltip", () => {
  vi.useFakeTimers();
  render(<MicrosoftHeadline />);

  expect(screen.getByRole("link", { name: /SWE Intern at Microsoft/ })).toBeVisible();
  expect(screen.queryByText("Want the story?")).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1400));
  expect(screen.queryByText("Want the story?")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /SWE Intern at Microsoft/ })).toBeVisible();
});
