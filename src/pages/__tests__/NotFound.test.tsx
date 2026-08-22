import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import NotFound from "../NotFound";

describe("NotFound", () => {
  it("renders 404 message", () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText(/page not found/i)).toBeDefined();
  });

  it("has a link back to home", () => {
    renderWithProviders(<NotFound />);
    // Redesigned 404: a "Go Back" (browser-history) button + a navigational link to /app (home).
    expect(screen.getByRole("button", { name: /go back/i })).toBeDefined();
    const homeLinks = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href") === "/app");
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
