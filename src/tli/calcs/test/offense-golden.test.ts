import { describe, expect, it } from "vitest";
import type { SaveData } from "@/src/lib/save-data";
import type { Configuration } from "../../core";
import { loadSave } from "../../storage/load-save";
import { calculateOffense } from "../offense";
import mcTheaGolden from "./mc-thea-3-golden-1.json";
import rosaGolden from "./rosa-2-golden.json";

describe("offense golden tests", () => {
  it("rosa-2-golden: Frost Spike should calculate ~12.40 trillion DPS", () => {
    const saveData = rosaGolden as unknown as SaveData;
    const loadout = loadSave(saveData);
    const config = saveData.configurationPage as Configuration;

    const results = calculateOffense({ loadout, configuration: config });

    const frostSpike = results.skills["Frost Spike"];
    if (frostSpike === undefined) {
      throw new Error("Frost Spike skill not found in results");
    }

    const avgDps = frostSpike.attackHitSummary?.avgDps;
    const expectedDps = 12.4e12; // ~12.40 trillion
    const tolerance = 0.01; // 1% tolerance

    expect(avgDps).toBeGreaterThan(expectedDps * (1 - tolerance));
    expect(avgDps).toBeLessThan(expectedDps * (1 + tolerance));

    // Resistance checks
    const { defenses } = results;
    expect(defenses.coldRes).toEqual({ max: 60, potential: 58, actual: 58 });
    expect(defenses.lightningRes).toEqual({
      max: 60,
      potential: 55,
      actual: 55,
    });
    expect(defenses.fireRes).toEqual({ max: 60, potential: 57, actual: 57 });
    expect(defenses.erosionRes).toEqual({ max: 63, potential: 61, actual: 61 });
  });

  it("mc-thea-3-golden-1: Mind Control should calculate expected DOT/Reap values", () => {
    const saveData = mcTheaGolden as unknown as SaveData;
    const loadout = loadSave(saveData);
    const config = saveData.configurationPage as Configuration;

    const results = calculateOffense({ loadout, configuration: config });

    const mindControl = results.skills["Mind Control"];
    if (mindControl === undefined) {
      throw new Error("Mind Control skill not found in results");
    }

    const tolerance = 0.01; // 1% tolerance

    // DOT DPS: ~16.30 billion
    const dotDps = mindControl.persistentDpsSummary?.total;
    const expectedDotDps = 16.3e9;
    expect(dotDps).toBeGreaterThan(expectedDotDps * (1 - tolerance));
    expect(dotDps).toBeLessThan(expectedDotDps * (1 + tolerance));

    // DOT Duration: 2.28s
    const dotDuration = mindControl.persistentDpsSummary?.duration;
    expect(dotDuration).toBeCloseTo(2.28, 2);

    // Reap DPS: ~172.12 billion
    const reapDps = mindControl.totalReapDpsSummary?.totalReapDps;
    const expectedReapDps = 172.12e9;
    expect(reapDps).toBeGreaterThan(expectedReapDps * (1 - tolerance));
    expect(reapDps).toBeLessThan(expectedReapDps * (1 + tolerance));

    // Reap CDR Bonus: 2.36 (136% increased)
    const reapCdr = mindControl.totalReapDpsSummary?.reapCdrBonus;
    expect(reapCdr).toBeCloseTo(2.36, 2);

    // Reap Duration Bonus: 1.82 (82% increased)
    const reapDuration = mindControl.totalReapDpsSummary?.reapDurationBonus;
    expect(reapDuration).toBeCloseTo(1.82, 2);

    // Total DPS: ~188.42 billion
    const totalDps = mindControl.totalDps;
    const expectedTotalDps = 188.42e9;
    expect(totalDps).toBeGreaterThan(expectedTotalDps * (1 - tolerance));
    expect(totalDps).toBeLessThan(expectedTotalDps * (1 + tolerance));
  });
});
