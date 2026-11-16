import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContactSection from "@/components/ContactSection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("exposes named fields and explains the email-app handoff before submission", () => {
  render(<ContactSection />);
  expect(screen.getByRole("textbox", { name: "Your name" })).toBeRequired();
  expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("type", "email");
  expect(screen.getByRole("textbox", { name: "A little about your project" })).toBeRequired();
  expect(screen.getByText(/nothing is submitted on this site/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Open email draft" })).toBeVisible();
});

it("reports a copied address only after the clipboard write succeeds", async () => {
  let finish: () => void;
  const writeText = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  render(<ContactSection />);
  fireEvent.click(screen.getByRole("button", { name: "Copy email" }));
  expect(screen.queryByText("Email address copied.")).not.toBeInTheDocument();

  await act(async () => finish());
  expect(screen.getByRole("status")).toHaveTextContent("Email address copied.");
  expect(writeText).toHaveBeenCalledOnce();
});

it("shows an actionable error instead of success when copying is denied", async () => {
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Permission denied")) } });
  render(<ContactSection />);
  fireEvent.click(screen.getByRole("button", { name: "Copy email" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Could not copy the address");
  expect(screen.queryByText("Email address copied.")).not.toBeInTheDocument();
});
