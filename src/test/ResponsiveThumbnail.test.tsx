import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ResponsiveThumbnail from "@/components/ResponsiveThumbnail";

afterEach(cleanup);

it("offers responsive thumbnails on desktop as well as mobile", () => {
  const { container } = render(
    <ResponsiveThumbnail path="images/projects/hivo.png" sizes="368px" alt="Project screenshot" />,
  );
  const source = container.querySelector("source");
  expect(source).toBeInTheDocument();
  expect(source).not.toHaveAttribute("media");
  expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
});

it("falls back to the original and reports a failure if that also fails", () => {
  const onError = vi.fn();
  const { container } = render(
    <ResponsiveThumbnail path="images/projects/hivo.png" sizes="368px" alt="Project screenshot" onError={onError} />,
  );
  const image = screen.getByRole<HTMLImageElement>("img");
  const original = image.src;
  Object.defineProperty(image, "currentSrc", { value: original.replace(".png", "-720.webp") });
  fireEvent.error(image);

  expect(container.querySelector("source")).not.toBeInTheDocument();
  expect(image.src).toBe(original);
  expect(onError).not.toHaveBeenCalled();

  fireEvent.error(image);
  expect(onError).toHaveBeenCalledOnce();
});

it("offers the full-resolution WebP in a preview with the original as fallback", () => {
  const { container } = render(<ResponsiveThumbnail fullResolution path="images/projects/hivo.png" alt="Project screenshot" />);
  expect(container.querySelector("source")?.getAttribute("srcset")).toMatch(/hivo-1920\.webp$/);
  expect(screen.getByRole("img").getAttribute("src")).toMatch(/hivo\.png$/);
  expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
});
