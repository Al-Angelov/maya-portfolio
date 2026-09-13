// Component tests for ResumePage and Timeline (Req 6.1–6.9, 12.1, 12.3, 12.5).
//
// ResumePage obtains its timeline categories through
// `useCmsResource('timeline')` and resolves all copy via the i18n `t()`
// resolver. To exercise the page's layout, tabs, and the CMS-driven timeline
// states in isolation we mock `useCmsResource` and drive each state
// ({ status, data, error }) directly, then render through the real
// `I18nProvider` so the intro/tab/career strings resolve exactly as in the app.
//
// The seed dataset `timelineCategories` (src/data/timeline.ts) has the same
// shape the CMS mapper produces, so it stands in as the "CMS success data".
//
// Assertions use plain DOM APIs (no jest-dom matchers).

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { I18nProvider } from "../src/i18n/I18nProvider";
import { useCmsResource } from "../src/cms/useCmsResource";
import { timelineCategories } from "../src/data/timeline";
import { mockCareer } from "../src/cms/mockData";
import ResumePage from "../src/pages/ResumePage";
import Timeline from "../src/components/Timeline";

// Mock the CMS hook so we control the { status, data, error } state per test.
vi.mock("../src/cms/useCmsResource", () => ({
  useCmsResource: vi.fn(),
}));

const mockedUseCmsResource = vi.mocked(useCmsResource);

type CmsState = {
  status: "loading" | "success" | "error";
  data: typeof timelineCategories | null;
  error: Error | null;
};

/**
 * Point the mocked hook at a given TIMELINE state for the next render(s). The
 * page now also calls `useCmsResource("career", …)`, so the mock is
 * kind-aware: the timeline call gets the provided state, and the career call
 * resolves to the seeded mock career content (so the Career tab is populated).
 */
function setCmsState(state: CmsState) {
  mockedUseCmsResource.mockImplementation(
    ((kind: string) =>
      kind === "career"
        ? { status: "success", data: mockCareer, error: null }
        : state) as never,
  );
}

function renderResumePage() {
  return render(
    <I18nProvider>
      <ResumePage />
    </I18nProvider>,
  );
}

beforeEach(() => {
  mockedUseCmsResource.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ResumePage — layout & background (Req 6.1, 6.2)", () => {
  it("renders the root section on the Sweet_Pink background (Req 6.1)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.classList.contains("bg-sweetPink")).toBe(true);
  });

  it("places performer content inside a Warm_Ivory container (Req 6.2)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();

    const warmIvory = container.querySelector(".bg-warmIvory");
    expect(warmIvory).not.toBeNull();
  });
});

describe("ResumePage — intro copy (Req 6.3)", () => {
  it("shows the 'As a Performer' introduction copy (Req 6.3)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();

    const intro = container.querySelector("p.whitespace-pre-line");
    expect(intro).not.toBeNull();
    expect((intro?.textContent ?? "").trim().startsWith("As a Performer")).toBe(
      true,
    );
  });
});

describe("ResumePage — tabs (Req 6.4, 6.5)", () => {
  it("makes the Performer tab active by default and shows the Career/Business tab (Req 6.4)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    renderResumePage();

    const performerTab = screen.getByRole("tab", { name: "Performer" });
    const careerTab = screen.getByRole("tab", { name: "Career/Business" });

    expect(performerTab.getAttribute("aria-selected")).toBe("true");
    expect(careerTab.getAttribute("aria-selected")).toBe("false");
  });

  it("switches to the Career/Business tab and shows the populated CV sections (Req 6.5)", async () => {
    const user = userEvent.setup();
    setCmsState({ status: "success", data: timelineCategories, error: null });
    renderResumePage();

    await user.click(screen.getByRole("tab", { name: "Career/Business" }));

    const careerTab = screen.getByRole("tab", { name: "Career/Business" });
    expect(careerTab.getAttribute("aria-selected")).toBe("true");

    // The four editorial section headings are present.
    expect(screen.getByRole("heading", { name: "Experience" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Education" })).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Volunteering" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Skills & Languages" }),
    ).not.toBeNull();

    // The empty-state placeholder must be gone.
    expect(
      screen.queryByText("This content is not yet available."),
    ).toBeNull();

    // The performer timeline is no longer shown while the Career tab is active.
    expect(screen.queryByText("Theatre")).toBeNull();
  });

  it("renders the exact Career/Business content on the Career tab (Req 6.5)", async () => {
    const user = userEvent.setup();
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();

    await user.click(screen.getByRole("tab", { name: "Career/Business" }));
    const text = container.textContent ?? "";

    // A. Experience — Liikenneturva media planner.
    expect(text).toContain("Media Planner (Seasonal)");
    expect(text).toContain("Liikenneturva (Finnish Road Safety Council)");
    expect(text).toContain("Jun 2024 – Jul 2024");
    expect(text).toContain("Planned virtual traffic safety lessons");

    // B. Education — Ressu IB World School.
    expect(text).toContain("Ressu IB World School");
    expect(text).toContain("2023 – 2026");
    expect(text).toContain("Current Leader of The Coffee Club");

    // C. Volunteering — Pörssisäätiö.
    expect(text).toContain("Bourse Ambassador (Pörssilähettiläs)");
    expect(text).toContain(
      "Pörssisäätiö (Finnish Foundation for Share Promotion)",
    );
    expect(text).toContain("Aug 2023");

    // D. Skills & Languages — a couple of representative pills.
    expect(text).toContain("Scriptwriting");
    expect(text).toContain("Outsourcing");
    expect(text).toContain("Finnish (Native)");
    expect(text).toContain("Swedish");
  });

  it("switches back to the Performer tab and shows the timeline again (Req 6.4)", async () => {
    const user = userEvent.setup();
    setCmsState({ status: "success", data: timelineCategories, error: null });
    renderResumePage();

    await user.click(screen.getByRole("tab", { name: "Career/Business" }));
    await user.click(screen.getByRole("tab", { name: "Performer" }));

    expect(
      screen.getByRole("tab", { name: "Performer" }).getAttribute(
        "aria-selected",
      ),
    ).toBe("true");
    expect(screen.getByText("Theatre")).not.toBeNull();
  });
});

describe("ResumePage — timeline content on success (Req 6.6–6.9)", () => {
  it("renders the three category labels in order Theatre → TV & Film → Directing & Writing (Req 6.9)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();

    const headings = Array.from(container.querySelectorAll("h3")).map((h) =>
      (h.textContent ?? "").trim(),
    );
    expect(headings).toEqual(["Theatre", "TV & Film", "Directing & Writing"]);
  });

  it("renders exact Theatre entry fields (Req 6.6)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();
    const text = container.textContent ?? "";

    // Editorial format: production leads, role follows as "— {role}".
    expect(screen.getByText("— Pentti")).not.toBeNull();
    expect(text).toContain("Hölmöläisiä");
    expect(text).toContain("Mustasaaren kesäteatteri");
    expect(text).toContain("2019");
  });

  it("renders exact TV & Film entry fields (Req 6.7)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();
    const text = container.textContent ?? "";

    expect(text).toContain("Background Actor");
    expect(text).toContain("Taivaan kansalaiset");
    expect(text).toContain("Just Republic");
    expect(text).toContain("2026");
  });

  it("renders the Directing & Writing entry with its premiere date (Req 6.8)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    const { container } = renderResumePage();
    const text = container.textContent ?? "";

    expect(text).toContain("Director & Writer");
    expect(text).toContain("You Will Never Walk Alone");
    expect(text).toContain("Premiere: November 2026");
  });
});

describe("ResumePage — CMS states (Req 12.1, 12.3, 12.5)", () => {
  it("shows a loading indicator while the timeline is loading (Req 12.3)", () => {
    setCmsState({ status: "loading", data: null, error: null });
    renderResumePage();

    const status = screen.getByRole("status");
    expect(status).not.toBeNull();
    // No categories render while loading.
    expect(screen.queryByText("Theatre")).toBeNull();
  });

  it("renders mapped categories on success (Req 12.1)", () => {
    setCmsState({ status: "success", data: timelineCategories, error: null });
    renderResumePage();

    expect(screen.getByText("Theatre")).not.toBeNull();
    expect(screen.getByText("TV & Film")).not.toBeNull();
    expect(screen.getByText("Directing & Writing")).not.toBeNull();
  });

  it("on error with retained data, shows an alert AND still renders the categories (Req 12.5)", () => {
    setCmsState({
      status: "error",
      data: timelineCategories,
      error: new Error("network down"),
    });
    renderResumePage();

    expect(screen.getByRole("alert")).not.toBeNull();
    // Retained last-good categories still render.
    expect(screen.getByText("Theatre")).not.toBeNull();
    expect(screen.getByText("TV & Film")).not.toBeNull();
    expect(screen.getByText("Directing & Writing")).not.toBeNull();
  });

  it("on error with no prior data, shows the empty-timeline fallback and no categories (Req 12.5)", () => {
    setCmsState({
      status: "error",
      data: null,
      error: new Error("network down"),
    });
    renderResumePage();

    expect(screen.getByRole("alert")).not.toBeNull();
    expect(
      screen.getByText("No timeline entries are currently available."),
    ).not.toBeNull();
    expect(screen.queryByText("Theatre")).toBeNull();
  });
});

describe("Timeline (standalone) — ordering & fields (Req 6.6–6.9)", () => {
  it("renders the categories in the exact order provided (Req 6.9)", () => {
    const { container } = render(
      <Timeline categories={timelineCategories} />,
    );

    const headings = Array.from(container.querySelectorAll("h3")).map((h) =>
      (h.textContent ?? "").trim(),
    );
    expect(headings).toEqual(["Theatre", "TV & Film", "Directing & Writing"]);
  });

  it("omits the role prefix when a Theatre entry has no role (Req 6.6)", () => {
    const { container } = render(
      <Timeline categories={timelineCategories} />,
    );
    const text = container.textContent ?? "";

    // The first Theatre entry has an empty role, so its production shows
    // without a trailing "— {role}" suffix.
    expect(text).toContain("Ruma ankanpoikanen");
    expect(text).not.toContain("\"Ruma ankanpoikanen\" — ");
  });

  it("renders the premiere line only for the Directing & Writing entry (Req 6.8)", () => {
    const { container } = render(
      <Timeline categories={timelineCategories} />,
    );

    const premiereLines = Array.from(container.querySelectorAll("p")).filter(
      (p) => (p.textContent ?? "").includes("Premiere:"),
    );
    expect(premiereLines).toHaveLength(1);
    expect(premiereLines[0].textContent).toContain("Premiere: November 2026");
  });
});
