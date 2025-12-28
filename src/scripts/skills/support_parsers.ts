import { template } from "../../lib/template-compiler";
import { parseNumericValue, validateAllLevels } from "./progression_table";
import type { SupportLevelParser } from "./types";
import { createConstantLevels } from "./utils";

export const hauntParser: SupportLevelParser = (input) => {
  const { skillName, description, progressionTable } = input;

  const firstDescription = description[0];
  if (firstDescription === undefined) {
    throw new Error(`${skillName}: no description found`);
  }

  // Extract Shadow Quantity from description text
  const shadowQuantMatch = template("{value:int} shadow quantity").match(
    firstDescription,
  );
  if (shadowQuantMatch === undefined) {
    throw new Error(`${skillName}: could not find Shadow Quantity value`);
  }
  const shadowQuant = shadowQuantMatch.value;

  // Extract DmgPct from progression table values
  const dmgPct: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const dmgValue = values[0];
    if (dmgValue === undefined) {
      throw new Error(`${skillName} level ${level}: missing damage value`);
    }

    dmgPct[level] = parseNumericValue(dmgValue);
  }

  validateAllLevels(dmgPct, skillName);

  return {
    shadowQuant: createConstantLevels(shadowQuant),
    dmgPct,
  };
};

export const steamrollParser: SupportLevelParser = (input) => {
  const { skillName, description, progressionTable } = input;

  const firstDescription = description[0];
  if (firstDescription === undefined) {
    throw new Error(`${skillName}: no description found`);
  }

  // Extract Attack Speed from description text
  const aspdMatch = template("{value:dec%} attack speed").match(
    firstDescription,
  );
  if (aspdMatch === undefined) {
    throw new Error(`${skillName}: could not find Attack Speed value`);
  }
  const aspdPctValue = aspdMatch.value;

  // Extract melee and ailment damage from progression table
  const meleeDmgPct: Record<number, number> = {};
  const ailmentDmgPct: Record<number, number> = {};

  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const meleeDmgValue = values[0];
    const ailmentDmgValue = values[1];

    if (meleeDmgValue === undefined) {
      throw new Error(
        `${skillName} level ${level}: missing melee damage value`,
      );
    }
    if (ailmentDmgValue === undefined) {
      throw new Error(
        `${skillName} level ${level}: missing ailment damage value`,
      );
    }

    meleeDmgPct[level] = parseNumericValue(meleeDmgValue);
    ailmentDmgPct[level] = parseNumericValue(ailmentDmgValue);
  }

  validateAllLevels(meleeDmgPct, skillName);
  validateAllLevels(ailmentDmgPct, skillName);

  return {
    aspdPct: createConstantLevels(aspdPctValue),
    meleeDmgPct,
    ailmentDmgPct,
  };
};

export const quickDecisionParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  // Extract Attack and Cast Speed from progression table values
  const aspdAndCspdPct: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const speedValue = values[0];
    if (speedValue === undefined) {
      throw new Error(`${skillName} level ${level}: missing speed value`);
    }

    aspdAndCspdPct[level] = parseNumericValue(speedValue);
  }

  validateAllLevels(aspdAndCspdPct, skillName);

  return { aspdAndCspdPct };
};

export const willpowerParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  // Extract max stacks from first row description text
  const firstRowDesc = progressionTable.description[1];
  if (firstRowDesc === undefined) {
    throw new Error(`${skillName}: no description found for level 1`);
  }

  const stacksMatch = template("stacks up to {value:int} time").match(
    firstRowDesc,
  );
  if (stacksMatch === undefined) {
    throw new Error(`${skillName}: could not find max stacks value`);
  }
  const maxStacksValue = stacksMatch.value;

  // Extract damage percentage from each row's description
  const dmgPctPerWillpower: Record<number, number> = {};
  for (const [levelStr, desc] of Object.entries(progressionTable.description)) {
    const level = Number(levelStr);

    const dmgMatch = template("{value:dec%} additional damage").match(desc);
    if (dmgMatch === undefined) {
      throw new Error(
        `${skillName} level ${level}: could not find damage percentage`,
      );
    }

    dmgPctPerWillpower[level] = dmgMatch.value;
  }

  validateAllLevels(dmgPctPerWillpower, skillName);

  return {
    maxWillpowerStacks: createConstantLevels(maxStacksValue),
    dmgPctPerWillpower,
  };
};

export const criticalStrikeDamageIncreaseParser: SupportLevelParser = (
  input,
) => {
  const { skillName, progressionTable } = input;

  // Extract crit damage from progression table values
  const critDmgPct: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const critDmgValue = values[0];
    if (critDmgValue === undefined) {
      throw new Error(`${skillName} level ${level}: missing crit damage value`);
    }

    critDmgPct[level] = parseNumericValue(critDmgValue);
  }

  validateAllLevels(critDmgPct, skillName);

  return { critDmgPct };
};

export const criticalStrikeRatingIncreaseParser: SupportLevelParser = (
  input,
) => {
  const { skillName, progressionTable } = input;

  // Extract crit rating from progression table values
  const critRatingPct: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const critRatingValue = values[0];
    if (critRatingValue === undefined) {
      throw new Error(`${skillName} level ${level}: missing crit rating value`);
    }

    critRatingPct[level] = parseNumericValue(critRatingValue);
  }

  validateAllLevels(critRatingPct, skillName);

  return { critRatingPct };
};

export const enhancedAilmentParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  // Extract ailment damage from progression table values
  const ailmentDmgPct: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const ailmentDmgValue = values[0];
    if (ailmentDmgValue === undefined) {
      throw new Error(
        `${skillName} level ${level}: missing ailment damage value`,
      );
    }

    ailmentDmgPct[level] = parseNumericValue(ailmentDmgValue);
  }

  validateAllLevels(ailmentDmgPct, skillName);

  return { ailmentDmgPct };
};

export const wellFoughtBattleParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const skillEffPctPerSkillUse: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const skillEffValue = values[0];
    if (skillEffValue === undefined) {
      throw new Error(
        `${skillName} level ${level}: missing skill effect value`,
      );
    }

    skillEffPctPerSkillUse[level] = parseNumericValue(skillEffValue);
  }

  validateAllLevels(skillEffPctPerSkillUse, skillName);

  return { skillEffPctPerSkillUse };
};

export const massEffectParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const skillEffPctPerCharges: Record<number, number> = {};
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const skillEffValue = values[0];
    if (skillEffValue === undefined) {
      throw new Error(
        `${skillName} level ${level}: missing skill effect value`,
      );
    }

    skillEffPctPerCharges[level] = parseNumericValue(skillEffValue);
  }

  validateAllLevels(skillEffPctPerCharges, skillName);

  return { skillEffPctPerCharges };
};
