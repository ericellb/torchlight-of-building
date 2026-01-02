import type { MagnificentSupportSkillName } from "@/src/data/skill/types";
import type { Mod } from "../mod";
import type { MagnificentSupportSkillModFactory } from "./types";

/**
 * Factory functions for magnificent support skill mods.
 * Each factory receives (tier, value, vals) where:
 * - tier: 0-2 (lower is better)
 * - value: the actual value selected within the tier's range (used directly for tier-scaled mods)
 * - vals: constant values as direct numbers
 *
 * The rank-based damage mod is auto-included by getMagnificentSupportSkillMods.
 * The factory returns complete Mod[] with all fields populated.
 */
export const magnificentSupportSkillModFactories: Partial<
  Record<MagnificentSupportSkillName, MagnificentSupportSkillModFactory>
> = {
  "Burning Shot: Combustion (Magnificent)": (_tier, value, vals): Mod[] => [
    { type: "DmgPct", value, dmgModType: "global", addn: true },
    { type: "ProjectileSizePct", value: vals.projectileSizePct },
    { type: "IgniteDurationPct", value: vals.igniteDurationPct },
    { type: "SkillEffDurationPct", value: vals.durationPct },
  ],
  "Mind Control: Concentrate (Magnificent)": (_tier, value, _vals): Mod[] => [
    {
      type: "DmgPct",
      value,
      dmgModType: "global",
      addn: true,
      per: { stackable: "unused_mind_control_link" },
    },
  ],
};
