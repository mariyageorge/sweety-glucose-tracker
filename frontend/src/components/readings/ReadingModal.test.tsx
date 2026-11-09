import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ReadingModal } from "./ReadingModal";

// Mock the API service
vi.mock("../../services/api", () => ({
  readingsApi: {
    createReading: vi.fn(),
    updateReading: vi.fn(),
  },
  getErrorMessage: (err: any) => err?.message || "An error occurred",
}));

describe("ReadingModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ReadingModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal header and form elements when isOpen is true", () => {
    render(
      <ReadingModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByText("Log Glucose Reading")).toBeInTheDocument();
    expect(screen.getByText("Measurement Slot")).toBeInTheDocument();
    expect(screen.getByText("Glucose Level")).toBeInTheDocument();
    expect(screen.getByText("Save Reading")).toBeInTheDocument();
  });

  it("displays error when glucose level is below 40 mg/dL", async () => {
    render(
      <ReadingModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const input = screen.getByPlaceholderText("e.g. 110");
    fireEvent.change(input, { target: { value: "35" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Blood glucose level must be between 40 and 600 mg/dL.")
      ).toBeInTheDocument();
    });
  });

  it("displays error when glucose level is above 600 mg/dL", async () => {
    render(
      <ReadingModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const input = screen.getByPlaceholderText("e.g. 110");
    fireEvent.change(input, { target: { value: "650" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Blood glucose level must be between 40 and 600 mg/dL.")
      ).toBeInTheDocument();
    });
  });

  it("displays error when glucose level is a decimal value", async () => {
    render(
      <ReadingModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const input = screen.getByPlaceholderText("e.g. 110");
    fireEvent.change(input, { target: { value: "115.5" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Blood glucose level must be a whole number (no decimals).")
      ).toBeInTheDocument();
    });
  });
});
