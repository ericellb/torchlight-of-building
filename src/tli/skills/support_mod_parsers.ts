import type { SupportMod } from "../core";
import { spec, t } from "../mod_parser";

const GLOBAL = "global" as const;

/**
 * Generic template parsers for support skill affixes.
 * Handles all support skill types: regular, activation medium, magnificent, and noble.
 */
const allSupportParsers = [
  // ===== Activation medium parsers =====
  t("auto-used supported skills {value:int%} additional damage").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: GLOBAL,
      addn: true,
    }),
  ),
  t("manually used supported skills {value:int%} additional damage").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: GLOBAL,
      addn: true,
    }),
  ),
  t(
    "{value:int%} additional damage for minions summoned by the supported skill",
  ).output("MinionDmgPct", (c) => ({
    value: c.value,
    addn: true,
  })),

  // ===== General damage parsers =====
  // Generic additional damage (DmgPct global)
  t("{value:dec%} additional damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: GLOBAL,
      addn: true,
    }),
  ),
  // Melee damage (Steamroll)
  t("{value:dec%} additional melee damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: "melee" as const,
      addn: true,
    }),
  ),
  // Ailment damage (Steamroll, Enhanced Ailment)
  t("{value:dec%} additional ailment damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: "ailment" as const,
      addn: true,
    }),
  ),
  // Erosion damage (Passivation) - full pattern
  t(
    "the supported skill deals more damage to enemies with more life, up to {value:int%} additional erosion damage",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: "erosion" as const,
    addn: true,
  })),
  // Damage to cursed enemies (Grudge)
  t(
    "the supported skill deals {value:dec%} additional damage to cursed enemies",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: true,
    cond: "enemy_is_cursed" as const,
  })),
  // Critical strike damage (Critical Strike Damage Increase)
  t(
    "{value:dec%} additional damage for the supported skill when it lands a critical strike",
  ).output("CritDmgPct", (c) => ({
    value: c.value,
    addn: true,
    modType: GLOBAL,
  })),
  // Damage per willpower stack (Willpower)
  t(
    "{value:dec%} additional damage for the supported skill for every stack of buffs while standing still",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: false,
    per: { stackable: "willpower" as const },
  })),

  // ===== Speed parsers =====
  // Attack speed (Steamroll - negative)
  t("{value:dec%} attack speed for the supported skill").output(
    "AspdPct",
    (c) => ({
      value: c.value,
      addn: false,
    }),
  ),
  // Attack and Cast speed combined (Quick Decision)
  t(
    "{value:dec%} additional attack and cast speed for the supported skill",
  ).outputMany([
    spec("AspdPct", (c) => ({ value: c.value, addn: true })),
    spec("CspdPct", (c) => ({ value: c.value, addn: true })),
  ]),

  // ===== Critical strike parsers =====
  // Critical strike rating (Critical Strike Rating Increase, Control Spell)
  t("{value:dec%} critical strike rating for the supported skill").output(
    "CritRatingPct",
    (c) => ({
      value: c.value,
      modType: GLOBAL,
    }),
  ),

  // ===== Skill area and effect parsers =====
  // Skill area (Increased Area, Aura Amplification)
  t("{value:dec%} skill area for the supported skill").output(
    "SkillAreaPct",
    (c) => ({
      value: c.value,
      skillAreaModType: GLOBAL,
    }),
  ),
  // Aura effect (Aura Amplification)
  t("{value:dec%} aura effect for the supported skill").output(
    "AuraEffPct",
    (c) => ({
      value: c.value,
    }),
  ),
  // Duration (Extended Duration)
  t("{value:dec%} duration for the supported skill").output(
    "SkillEffDurationPct",
    (c) => ({
      value: c.value,
    }),
  ),
  // Skill effect per cast (Well-Fought Battle)
  t(
    "the supported skill {value:dec%} effect every time it is cast, up to {_:int} time\\(s\\)",
  ).output("SkillEffPct", (c) => ({
    value: c.value,
    per: { stackable: "skill_use" as const },
  })),
  // Skill effect per charge (Mass Effect)
  t(
    "{value:dec%} effect for the status provided by the skill per charge when you use the supported skill",
  ).output("SkillEffPct", (c) => ({
    value: c.value,
    per: { stackable: "skill_charges_on_use" as const },
  })),

  // ===== Shadow/minion parsers =====
  // Shadow quantity (Haunt)
  t("{value:int} shadow quantity for the supported skill").output(
    "ShadowQuant",
    (c) => ({
      value: c.value,
    }),
  ),

  // ===== Willpower parsers =====
  // Max willpower stacks (Willpower)
  t("stacks up to {value:int} time(s)").output("MaxWillpowerStacks", (c) => ({
    value: c.value,
  })),

  // ===== Affliction parsers (Cataclysm) =====
  // Full pattern with context
  t(
    "when the supported skill deals damage over time, it inflicts {value:int} affliction on the enemy. effect cooldown: {_:int} s",
  ).output("AfflictionInflictedPerSec", (c) => ({
    value: c.value,
  })),
  // Short pattern fallback
  t("it inflicts {value:int} affliction on the enemy").output(
    "AfflictionInflictedPerSec",
    (c) => ({
      value: c.value,
    }),
  ),
  t(
    "affliction grants an additional {value:dec%} effect to the supported skill",
  ).output("AfflictionEffectPct", (c) => ({
    value: c.value,
    addn: true,
    cond: "enemy_at_max_affliction" as const,
  })),

  // ===== Status effect parsers =====
  // Paralyze chance (Grudge)
  t("{value:int%} chance to paralyze it").output(
    "InflictParalysisPct",
    (c) => ({
      value: c.value,
      cond: "enemy_is_cursed" as const,
    }),
  ),

  // ===== Flag parsers (no value) =====
  // Cannot inflict wilt (Passivation)
  t("the supported skill cannot inflict wilt").output("CannotInflictWilt"),
  // Generates barrier (Guard) - full pattern
  t(
    "every {_:int} time\\(s\\) the supported skill is used, gains a barrier if there's no barrier. interval: {_:int} s",
  ).output("GeneratesBarrier"),
  // Generates barrier - short fallback
  t("gains a barrier if there's no barrier").output("GeneratesBarrier"),

  // ===== Magnificent/noble specific parsers =====
  t("{value:int%} projectile size for the supported skill").output(
    "ProjectileSizePct",
    (c) => ({
      value: c.value,
    }),
  ),
  t("{value:int%} additional ignite duration for the supported skill").output(
    "IgniteDurationPct",
    (c) => ({
      value: c.value,
    }),
  ),
  t("{value:int%} additional duration for the supported skill").output(
    "SkillEffDurationPct",
    (c) => ({
      value: c.value,
    }),
  ),
  // Mind Control: Concentrate specific parser
  t(
    "+{value:dec%} additional damage for this skill for every link less than maximum links",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: true,
    per: { stackable: "unused_mind_control_link" as const },
  })),
];

/**
 * Parse a single support affix text.
 * Returns undefined if no parser matches.
 */
const parseSupportAffix = (text: string): SupportMod[] | undefined => {
  const normalized = text.trim().toLowerCase();
  for (const parser of allSupportParsers) {
    const mods = parser.parse(normalized);
    if (mods !== undefined) {
      return mods.map((mod) => ({ mod }));
    }
  }
  return undefined;
};

export const parseSupportAffixes = (affixes: string[]): SupportMod[][] => {
  return affixes.map((text) => parseSupportAffix(text) ?? []);
};
