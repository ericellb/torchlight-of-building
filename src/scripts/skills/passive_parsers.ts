import { template } from "../../lib/template-compiler";
import { validateAllLevels } from "./progression_table";
import type { SupportLevelParser } from "./types";

export const preciseCrueltyParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const attackDmgPct: Record<number, number> = {};
  const auraEffPctPerCrueltyStack: Record<number, number> = {};

  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const descript = values[0];

    if (descript !== undefined && descript !== "") {
      // Match "+12.5% additional Attack Damage" or "12.5% additional Attack Damage"
      const dmgMatch = template("{value:dec%} additional attack damage").match(
        descript,
      );
      if (dmgMatch !== undefined) {
        attackDmgPct[level] = dmgMatch.value;
      }

      // Match "2.5% additional Aura Effect per stack of the buff"
      const auraEffMatch = template(
        "{value:dec%} additional aura effect per stack",
      ).match(descript);
      if (auraEffMatch !== undefined) {
        auraEffPctPerCrueltyStack[level] = auraEffMatch.value;
      }
    }
  }

  validateAllLevels(attackDmgPct, skillName);
  validateAllLevels(auraEffPctPerCrueltyStack, skillName);

  return {
    attackDmgPct,
    auraEffPctPerCrueltyStack,
  };
};
