import { MagnificentSupportSkills } from "@/src/data/skill/support_magnificent";
import type {
  BaseMagnificentSupportSkill,
  MagnificentSupportSkillName,
} from "@/src/data/skill/types";
import type { Mod } from "../mod";
import { magnificentSupportSkillModFactories } from "./magnificent_support_factories";
import { v } from "./types";

/**
 * Get mods for a magnificent support skill at the specified tier, rank, and value.
 *
 * @param skillName - Name of the magnificent support skill
 * @param tier - Tier 0-2 (lower is better, tier 0 has best values)
 * @param rank - Rank 1-5 (higher is better, rank 5 is max)
 * @param value - Specific value within the tier's range (e.g., 23 for tier 0 range 19-23)
 * @returns Array of Mod objects
 */
export const getMagnificentSupportSkillMods = (
  skillName: MagnificentSupportSkillName,
  tier: 0 | 1 | 2,
  rank: 1 | 2 | 3 | 4 | 5,
  value: number,
): Mod[] => {
  // Get skill data from generated magnificent support skills
  const skill = MagnificentSupportSkills.find((s) => s.name === skillName) as
    | BaseMagnificentSupportSkill
    | undefined;
  if (skill === undefined) {
    throw new Error(`Magnificent support skill "${skillName}" not found`);
  }

  // Validate value is within tier's range if tierValues exists
  if (skill.tierValues !== undefined) {
    // Get the first tier value key to validate range
    const firstKey = Object.keys(skill.tierValues)[0];
    if (firstKey !== undefined) {
      const tierRanges = skill.tierValues[firstKey];
      const range = tierRanges[tier];
      if (value < range.min || value > range.max) {
        throw new Error(
          `Value ${value} out of range [${range.min}, ${range.max}] for tier ${tier} of "${skillName}"`,
        );
      }
    }
  }

  // Build constant values for factory (direct numbers, not arrays)
  const vals: Record<string, number> = {};
  if (skill.constantValues !== undefined) {
    for (const [key, num] of Object.entries(skill.constantValues)) {
      vals[key] = num;
    }
  }

  // Get factory mods (if factory exists)
  const factory = magnificentSupportSkillModFactories[skillName];
  const factoryMods = factory !== undefined ? factory(tier, value, vals) : [];

  // Always include rank-based damage mod (present in all magnificent supports)
  const rankDmgPct = skill.rankValues?.rankDmgPct;
  if (rankDmgPct !== undefined) {
    const rankDmgMod: Mod = {
      type: "DmgPct",
      value: v(rankDmgPct, rank),
      dmgModType: "global",
      addn: true,
    };
    return [rankDmgMod, ...factoryMods];
  }

  return factoryMods;
};
