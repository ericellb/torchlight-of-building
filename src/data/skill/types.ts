export const SKILL_TYPES = [
  "Activation Medium",
  "Active",
  "Passive",
  "Support",
  "Support (Magnificent)",
  "Support (Noble)",
] as const;

export type SkillType = (typeof SKILL_TYPES)[number];

export const SKILL_TAGS = [
  "Area",
  "Attack",
  "Aura",
  "Barrage",
  "Base Skill",
  "Beam",
  "Chain",
  "Channeled",
  "Cold",
  "Combo",
  "Curse",
  "Defensive",
  "Demolisher",
  "Dexterity",
  "Empower",
  "Enhanced Skill",
  "Erosion",
  "Fire",
  "Focus",
  "Horizontal",
  "Intelligence",
  "Lightning",
  "Melee",
  "Mobility",
  "Parabolic",
  "Persistent",
  "Physical",
  "Projectile",
  "Ranged",
  "Restoration",
  "Sentry",
  "Shadow Strike",
  "Slash-Strike",
  "Spell",
  "Spirit Magus",
  "Strength",
  "Summon",
  "Synthetic Troop",
  "Terra",
  "Ultimate",
  "Vertical",
  "Warcry",
] as const;

export type SkillTag = (typeof SKILL_TAGS)[number];

export interface BaseSkill {
  type: SkillType;
  name: string;
  tags: readonly SkillTag[];
  description: string[];
}

// Multiple skill tags means the target must have all specified tags
export type SupportTarget =
  | { tags: SkillTag[] }
  | { skillType: "active" | "passive" }
  | "any"
  | "deal_damage"
  | "dot"
  | "dot_and_ailment"
  | "hit_enemies"
  | "inflict_ailment"
  | "spell_burst"
  | "summon_minions"
  | "summon_spirit_magus"
  | "summon_synthetic_troops";

export interface SupportSkill extends BaseSkill {
  // support can target skill if any of the targets match
  supportTargets: SupportTarget[];
  // cannot support any of the matched targets (takes precedence over supportTargets)
  cannotSupportTargets: SupportTarget[];
}

export interface MagnificentSupportSkill extends BaseSkill {
  // name of skill that can be supported
  supportTarget: string;
}

export interface NobleSupportSkill extends BaseSkill {
  // name of skill that can be supported
  supportTarget: string;
}
