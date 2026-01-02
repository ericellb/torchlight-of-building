import { describe, expect, it } from "vitest";
import { getMagnificentSupportSkillMods } from "./magnificent_support_mods";

describe("getMagnificentSupportSkillMods", () => {
  it("should return mods for Burning Shot: Combustion at tier 0, rank 5, max value", () => {
    const mods = getMagnificentSupportSkillMods(
      "Burning Shot: Combustion (Magnificent)",
      0, // Best tier
      5, // Best rank
      23, // Max value for tier 0 (range is 19-23)
    );

    // Should have tier-scaled damage (23%)
    const tierDmg = mods.find(
      (m) => m.type === "DmgPct" && m.value === 23 && m.addn === true,
    );
    expect(tierDmg).toBeDefined();

    // Should have rank-scaled damage (20% at rank 5)
    const rankDmg = mods.find(
      (m) => m.type === "DmgPct" && m.value === 20 && m.addn === true,
    );
    expect(rankDmg).toBeDefined();

    // Should have projectile size mod
    const projSize = mods.find((m) => m.type === "ProjectileSizePct");
    expect(projSize).toBeDefined();
    expect(projSize?.value).toBe(25);

    // Should have ignite duration mod
    const igniteDur = mods.find((m) => m.type === "IgniteDurationPct");
    expect(igniteDur).toBeDefined();
    expect(igniteDur?.value).toBe(15);

    // Should have duration mod
    const duration = mods.find((m) => m.type === "SkillEffDurationPct");
    expect(duration).toBeDefined();
    expect(duration?.value).toBe(15);
  });

  it("should return mods for tier 2, rank 1, min value", () => {
    const mods = getMagnificentSupportSkillMods(
      "Burning Shot: Combustion (Magnificent)",
      2, // Worst tier
      1, // Worst rank
      12, // Min value for tier 2 (range is 12-14)
    );

    // Should have tier-scaled damage (12%)
    const tierDmg = mods.find(
      (m) => m.type === "DmgPct" && m.value === 12 && m.addn === true,
    );
    expect(tierDmg).toBeDefined();

    // Should have rank-scaled damage (0% at rank 1)
    const rankDmg = mods.find(
      (m) => m.type === "DmgPct" && m.value === 0 && m.addn === true,
    );
    expect(rankDmg).toBeDefined();
  });

  it("should throw error for value outside tier range", () => {
    expect(() => {
      getMagnificentSupportSkillMods(
        "Burning Shot: Combustion (Magnificent)",
        0,
        5,
        100, // Way outside tier 0's range of 19-23
      );
    }).toThrow("out of range");
  });

  it("should return empty array for skill without factory or rankValues", () => {
    // Use a magnificent support skill that doesn't have a factory or rankValues
    const mods = getMagnificentSupportSkillMods(
      "Burning Shot: Fiery Blast (Magnificent)",
      0,
      5,
      20,
    );
    expect(mods).toEqual([]);
  });
});
