import { template } from "../../lib/template-compiler";
import { parseNumericValue, validateAllLevels } from "./progression_table";
import type { SupportLevelParser } from "./types";
import { createConstantLevels } from "./utils";

export const iceBondParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const coldDmgPctVsFrostbitten: Record<number, number> = {};

  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const descript = values[2];

    if (descript !== undefined && descript !== "") {
      // Match "23.5% additional Cold Damage" or "+24% additional Cold Damage"
      const match = template("{value:dec%} additional cold damage").match(
        descript,
      );
      if (match !== undefined) {
        coldDmgPctVsFrostbitten[level] = match.value;
      }
    }
  }

  validateAllLevels(coldDmgPctVsFrostbitten, skillName);

  return { coldDmgPctVsFrostbitten };
};

export const bullsRageParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const meleeDmgPct: Record<number, number> = {};

  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const descript = values[0];

    if (descript !== undefined && descript !== "") {
      // Match "17.5% additional Melee Skill Damage" or "+27% additional Melee Skill Damage"
      const match = template(
        "{value:dec%} additional melee skill damage",
      ).match(descript);
      if (match !== undefined) {
        meleeDmgPct[level] = match.value;
      }
    }
  }

  validateAllLevels(meleeDmgPct, skillName);

  return { meleeDmgPct };
};

export const frostSpikeParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  const weaponAtkDmgPct: Record<number, number> = {};
  const addedDmgEffPct: Record<number, number> = {};

  // Constant mods from Descript column (values[2])
  let convertPhysicalToColdPct: number | undefined;
  let maxProjectile: number | undefined;
  let projectilePerFrostbiteRating: number | undefined;
  let baseProjectile: number | undefined;
  let dmgPctPerProjectile: number | undefined;

  // First pass: extract values from dedicated columns (levels 1-20 typically have data)
  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);

    // values[0] = "Effectiveness of added damage" (e.g., "149%")
    // values[1] = "damage" (e.g., "Deals 149.0% weapon Attack Damage")
    const addedDmgEffValue = values[0];
    const damageValue = values[1];

    // Try dedicated columns
    if (addedDmgEffValue !== undefined && addedDmgEffValue !== "") {
      addedDmgEffPct[level] = parseNumericValue(addedDmgEffValue);
    }

    if (damageValue !== undefined && damageValue !== "") {
      const dmgMatch = template("{value:dec%}").match(damageValue);
      if (dmgMatch !== undefined) {
        weaponAtkDmgPct[level] = dmgMatch.value;
      }
    }
  }

  // Second pass: fill in missing levels 21-40 with level 20 values
  const level20WeaponDmg = weaponAtkDmgPct[20];
  const level20AddedDmgEff = addedDmgEffPct[20];

  if (level20WeaponDmg === undefined || level20AddedDmgEff === undefined) {
    throw new Error(
      `${skillName}: level 20 values missing, cannot fallback for levels 21-40`,
    );
  }

  for (let level = 21; level <= 40; level++) {
    if (weaponAtkDmgPct[level] === undefined) {
      weaponAtkDmgPct[level] = level20WeaponDmg;
    }
    if (addedDmgEffPct[level] === undefined) {
      addedDmgEffPct[level] = level20AddedDmgEff;
    }
  }

  // Extract constant mods from level 1 Descript
  const level1Values = progressionTable.values[1];
  const descript = level1Values?.[2];

  if (descript !== undefined) {
    // ConvertDmgPct: "Converts 100% of the skill's Physical Damage to Cold"
    const convertMatch = template(
      "converts {value:int%} of the skill's physical damage to cold",
    ).match(descript);
    if (convertMatch !== undefined) {
      convertPhysicalToColdPct = convertMatch.value;
    }

    // MaxProjectile: "max amount of Projectiles that can be fired by this skill is 5"
    const maxProjMatch = template(
      "max amount of projectiles that can be fired by this skill is {value:int}",
    ).match(descript);
    if (maxProjMatch !== undefined) {
      maxProjectile = maxProjMatch.value;
    }

    // Projectile per frostbite_rating: "+1 Projectile Quantity for every 35 Frostbite Rating"
    // The value stored is 1 (gains +1 projectile), the 35 is encoded in the template's per.amt
    const projPerRatingMatch = template(
      "{value:int} projectile quantity for every",
    ).match(descript);
    if (projPerRatingMatch !== undefined) {
      projectilePerFrostbiteRating = projPerRatingMatch.value;
    }

    // Base Projectile: "fires 2 Projectiles in its base state"
    const baseProjMatch = template("fires {value:int} projectile").match(
      descript,
    );
    if (baseProjMatch !== undefined) {
      baseProjectile = baseProjMatch.value;
    }

    // DmgPct per projectile: "+8% additional Damage for every +1 Projectile"
    const dmgPctMatch = template(
      "{value:int%} additional damage for every +1 projectile",
    ).match(descript);
    if (dmgPctMatch !== undefined) {
      dmgPctPerProjectile = dmgPctMatch.value;
    }
  }

  // Validate we found all required values
  if (convertPhysicalToColdPct === undefined) {
    throw new Error(`${skillName}: could not find ConvertDmgPct value`);
  }
  if (maxProjectile === undefined) {
    throw new Error(`${skillName}: could not find MaxProjectile value`);
  }
  if (projectilePerFrostbiteRating === undefined) {
    throw new Error(`${skillName}: could not find Projectile per rating value`);
  }
  if (baseProjectile === undefined) {
    throw new Error(`${skillName}: could not find base Projectile value`);
  }
  if (dmgPctPerProjectile === undefined) {
    throw new Error(`${skillName}: could not find DmgPct per projectile value`);
  }

  validateAllLevels(weaponAtkDmgPct, skillName);
  validateAllLevels(addedDmgEffPct, skillName);

  return {
    weaponAtkDmgPct,
    addedDmgEffPct,
    convertPhysicalToColdPct: createConstantLevels(convertPhysicalToColdPct),
    maxProjectile: createConstantLevels(maxProjectile),
    projectilePerFrostbiteRating: createConstantLevels(
      projectilePerFrostbiteRating,
    ),
    baseProjectile: createConstantLevels(baseProjectile),
    dmgPctPerProjectile: createConstantLevels(dmgPctPerProjectile),
  };
};
