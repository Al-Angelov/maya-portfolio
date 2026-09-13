// Tests for the Career/Business CMS wiring: the language-filtered combined
// query builder and the `mapCareer` mapper that shapes the four document types
// into the `CareerContent` the Resume tab renders.

import { describe, it, expect } from "vitest";
import {
  buildCareerQuery,
  mapCareer,
  type SanityCareerResult,
} from "../src/cms/queries";

describe("buildCareerQuery — language filtering", () => {
  it("fetches all four document types in one projected query", () => {
    const q = buildCareerQuery(false);
    expect(q).toContain('_type == "workExperience"');
    expect(q).toContain('_type == "educationEntry"');
    expect(q).toContain('_type == "volunteeringEntry"');
    expect(q).toContain('_type == "skillsAndLanguages"');
    expect(q).toContain('"experience":');
    expect(q).toContain('"education":');
    expect(q).toContain('"volunteering":');
    expect(q).toContain('"skills":');
  });

  it("filters every collection by $language when a language is requested", () => {
    const q = buildCareerQuery(true);
    // One language clause per collection (4 total).
    const occurrences = q.match(/language == \$language/g) ?? [];
    expect(occurrences.length).toBe(4);
  });

  it("omits the language clause when language-agnostic", () => {
    expect(buildCareerQuery(false)).not.toContain("language == $language");
  });
});

describe("mapCareer — shaping the four document types", () => {
  const raw: SanityCareerResult = {
    experience: [
      {
        _id: "we-1",
        _type: "workExperience",
        jobTitle: "Media Planner (Seasonal)",
        company: "Liikenneturva",
        dateRange: "Jun 2024 – Jul 2024",
        location: "Finland",
        description: "Planned virtual traffic safety lessons.",
        language: "EN",
      },
    ],
    education: [
      {
        _id: "ed-1",
        _type: "educationEntry",
        school: "Ressu IB World School",
        degree: "Abitur",
        dateRange: "2023 – 2026",
        activities: "Leader of The Coffee Club.",
        language: "EN",
      },
    ],
    volunteering: [
      {
        _id: "vo-1",
        _type: "volunteeringEntry",
        role: "Bourse Ambassador",
        organization: "Pörssisäätiö",
        dateRange: "Aug 2023",
        description: "Held presentations for ninth graders.",
        language: "EN",
      },
    ],
    skills: [
      {
        _id: "sk-1",
        _type: "skillsAndLanguages",
        title: "Main Skills Profile",
        coreSkills: ["Scriptwriting", "Communication"],
        spokenLanguages: ["Finnish (Native)", "English"],
        language: "EN",
      },
    ],
  };

  it("maps each dated section with the correct fields and detail kind", () => {
    const content = mapCareer(raw);

    expect(content.experience).toHaveLength(1);
    expect(content.experience[0]).toMatchObject({
      id: "we-1",
      role: "Media Planner (Seasonal)",
      organization: "Liikenneturva",
      period: "Jun 2024 – Jul 2024",
      location: "Finland",
      detail: "Planned virtual traffic safety lessons.",
      detailKind: "description",
    });

    expect(content.education[0]).toMatchObject({
      role: "Ressu IB World School",
      organization: "Abitur",
      period: "2023 – 2026",
      detail: "Leader of The Coffee Club.",
      detailKind: "activities",
    });

    expect(content.volunteering[0]).toMatchObject({
      role: "Bourse Ambassador",
      organization: "Pörssisäätiö",
      period: "Aug 2023",
      detailKind: "description",
    });
  });

  it("uses the first skills document for the Skills & Languages block", () => {
    const content = mapCareer(raw);
    expect(content.skills).not.toBeNull();
    expect(content.skills!.coreSkills).toEqual([
      "Scriptwriting",
      "Communication",
    ]);
    expect(content.skills!.spokenLanguages).toEqual([
      "Finnish (Native)",
      "English",
    ]);
  });

  it("returns empty sections and null skills for an empty/missing result", () => {
    const content = mapCareer({});
    expect(content.experience).toEqual([]);
    expect(content.education).toEqual([]);
    expect(content.volunteering).toEqual([]);
    expect(content.skills).toBeNull();
  });

  it("omits the education detail line when there are no activities", () => {
    const content = mapCareer({
      education: [
        {
          _id: "ed-2",
          _type: "educationEntry",
          school: "Some School",
          degree: "Diploma",
          dateRange: "2020 – 2022",
          language: "EN",
        },
      ],
    });
    expect(content.education[0].detail).toBeUndefined();
  });
});
