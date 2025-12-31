import type { Mod, StatType } from "@/src/tli/mod";

export const STAT_CATEGORIES = [
  "damage",
  "critRating",
  "critDmg",
  "aspd",
  "other",
] as const;
export type StatCategory = (typeof STAT_CATEGORIES)[number];

export interface GroupedMods {
  damage: Mod[];
  critRating: Mod[];
  critDmg: Mod[];
  aspd: Mod[];
  other: Mod[];
}

export const getStatCategoryLabel = (category: StatCategory): string => {
  switch (category) {
    case "damage":
      return "Damage Modifiers";
    case "critRating":
      return "Critical Rating";
    case "critDmg":
      return "Critical Damage";
    case "aspd":
      return "Attack Speed";
    case "other":
      return "Other Modifiers";
  }
};

export const getStatCategoryDescription = (category: StatCategory): string => {
  switch (category) {
    case "damage":
      return "Mods that affect damage output directly";
    case "critRating":
      return "Mods that affect critical hit chance";
    case "critDmg":
      return "Mods that affect critical damage multiplier";
    case "aspd":
      return "Mods that affect attack speed";
    case "other":
      return "Mods with other effects";
  }
};

export const categorizeModType = (mod: Mod): StatCategory => {
  switch (mod.type) {
    case "DmgPct":
    case "FlatDmgToAtks":
    case "FlatDmgToSpells":
    case "AddsDmgAsPct":
    case "ConvertDmgPct":
    case "FlatGearDmg":
    case "GearPhysDmgPct":
    case "AddnMainHandDmgPct":
    case "SteepStrikeDmg":
    case "SweepSlashDmg":
    case "Stat":
    case "StatPct":
      return "damage";

    case "CritRatingPct":
    case "SteepStrikeChancePct":
      return "critRating";

    case "CritDmgPct":
      return "critDmg";

    case "AspdPct":
    case "GearAspdPct":
      return "aspd";

    case "FervorEffPct":
    case "Fervor":
    default:
      return "other";
  }
};

export const groupModsByEffect = (mods: Mod[]): GroupedMods => {
  const groups: GroupedMods = {
    damage: [],
    critRating: [],
    critDmg: [],
    aspd: [],
    other: [],
  };

  for (const mod of mods) {
    const category = categorizeModType(mod);
    groups[category].push(mod);
  }

  return groups;
};

export const formatModValue = (mod: Mod): string => {
  if ("value" in mod) {
    const value = mod.value;
    if (typeof value === "number") {
      if (mod.type.includes("Pct") || mod.type === "FervorEffPct") {
        return `${value.toFixed(1)}%`;
      }
      return value.toFixed(1);
    }
    if (typeof value === "object" && "min" in value && "max" in value) {
      return `${value.min.toFixed(0)}-${value.max.toFixed(0)}`;
    }
  }
  return "";
};

const getStatDisplayName = (statType: StatType): string => {
  switch (statType) {
    case "str":
      return "Strength";
    case "dex":
      return "Dexterity";
    case "int":
      return "Intelligence";
  }
};

export const getModDisplayName = (mod: Mod): string => {
  switch (mod.type) {
    case "DmgPct": {
      const prefix = mod.addn ? "More" : "Increased";
      return `${prefix} ${mod.dmgModType} damage`;
    }
    case "FlatDmgToAtks":
      return `Adds ${mod.dmgType} damage to attacks`;
    case "FlatDmgToSpells":
      return `Adds ${mod.dmgType} damage to spells`;
    case "CritRatingPct":
      return `${mod.modType} critical rating`;
    case "CritDmgPct": {
      const prefix = mod.addn ? "Additional" : "Increased";
      return `${prefix} ${mod.modType} critical damage`;
    }
    case "AspdPct": {
      const prefix = mod.addn ? "More" : "Increased";
      return `${prefix} attack speed`;
    }
    case "GearAspdPct":
      return "Gear attack speed";
    case "Stat":
      return getStatDisplayName(mod.statType);
    case "StatPct":
      return `Increased ${getStatDisplayName(mod.statType)}`;
    case "ConvertDmgPct":
      return `Convert ${mod.from} to ${mod.to}`;
    case "AddsDmgAsPct":
      return `Gain ${mod.from} damage as extra ${mod.to}`;
    case "FlatGearDmg":
      return `Weapon ${mod.modType} damage`;
    case "GearPhysDmgPct":
      return "Weapon physical damage";
    case "AddnMainHandDmgPct":
      return "Additional main hand damage";
    case "FervorEffPct":
      return "Fervor effectiveness";
    case "Fervor":
      return "Fervor";
    default:
      return mod.type;
  }
};

const formatLargeNumber = (val: number): string => {
  const absVal = Math.abs(val);
  const sign = val < 0 ? "-" : "";

  if (absVal >= 1_000_000_000_000) {
    return `${sign}${(absVal / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (absVal >= 1_000_000_000) {
    return `${sign}${(absVal / 1_000_000_000).toFixed(2)}B`;
  }
  if (absVal >= 1_000_000) {
    return `${sign}${(absVal / 1_000_000).toFixed(2)}M`;
  }
  if (absVal >= 1_000) {
    return `${sign}${(absVal / 1_000).toFixed(2)}K`;
  }
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatStatValue = {
  percentage: (val: number): string => `${(val * 100).toFixed(1)}%`,
  multiplier: (val: number): string => `${(val * 100).toFixed(0)}%`,
  aps: (val: number): string => `${val.toFixed(2)} APS`,
  damage: formatLargeNumber,
  dps: formatLargeNumber,
  integer: (val: number): string => Math.round(val).toLocaleString("en-US"),
  duration: (val: number): string => `${val.toFixed(1)}s`,
};
