import type { SupportMod } from "../core";
import { spec, t } from "../mod_parser";

const GLOBAL = "global" as const;

const allSupportParsers = [
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
  t("{value:dec%} additional damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: GLOBAL,
      addn: true,
    }),
  ),
  t("{value:dec%} additional melee damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: "melee" as const,
      addn: true,
    }),
  ),
  t("{value:dec%} additional ailment damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: "ailment" as const,
      addn: true,
    }),
  ),
  t(
    "the supported skill deals more damage to enemies with more life, up to {value:int%} additional erosion damage",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: "erosion" as const,
    addn: true,
  })),
  t(
    "the supported skill deals {value:dec%} additional damage to cursed enemies",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: true,
    cond: "enemy_is_cursed" as const,
  })),
  t(
    "{value:dec%} additional damage for the supported skill when it lands a critical strike",
  ).output("CritDmgPct", (c) => ({
    value: c.value,
    addn: true,
    modType: GLOBAL,
  })),
  t(
    "{value:dec%} additional damage for the supported skill for every stack of buffs while standing still",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: false,
    per: { stackable: "willpower" as const },
  })),
  t("{value:dec%} attack speed for the supported skill").output(
    "AspdPct",
    (c) => ({
      value: c.value,
      addn: false,
    }),
  ),
  t(
    "{value:dec%} additional attack and cast speed for the supported skill",
  ).outputMany([
    spec("AspdPct", (c) => ({ value: c.value, addn: true })),
    spec("CspdPct", (c) => ({ value: c.value, addn: true })),
  ]),
  t("{value:dec%} critical strike rating for the supported skill").output(
    "CritRatingPct",
    (c) => ({
      value: c.value,
      modType: GLOBAL,
    }),
  ),
  t("{value:dec%} skill area for the supported skill").output(
    "SkillAreaPct",
    (c) => ({
      value: c.value,
      skillAreaModType: GLOBAL,
    }),
  ),
  t("{value:dec%} aura effect for the supported skill").output(
    "AuraEffPct",
    (c) => ({
      value: c.value,
    }),
  ),
  t("{value:dec%} duration for the supported skill").output(
    "SkillEffDurationPct",
    (c) => ({
      value: c.value,
    }),
  ),
  t(
    "the supported skill {value:dec%} effect every time it is cast, up to {_:int} time\\(s\\)",
  ).output("SkillEffPct", (c) => ({
    value: c.value,
    per: { stackable: "skill_use" as const },
  })),
  t(
    "{value:dec%} effect for the status provided by the skill per charge when you use the supported skill",
  ).output("SkillEffPct", (c) => ({
    value: c.value,
    per: { stackable: "skill_charges_on_use" as const },
  })),
  t("{value:int} shadow quantity for the supported skill").output(
    "ShadowQuant",
    (c) => ({
      value: c.value,
    }),
  ),
  t("stacks up to {value:int} time(s)").output("MaxWillpowerStacks", (c) => ({
    value: c.value,
  })),
  t(
    "when the supported skill deals damage over time, it inflicts {value:int} affliction on the enemy. effect cooldown: {_:int} s",
  ).output("AfflictionInflictedPerSec", (c) => ({
    value: c.value,
  })),
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
  t("{value:int%} chance to paralyze it").output(
    "InflictParalysisPct",
    (c) => ({
      value: c.value,
      cond: "enemy_is_cursed" as const,
    }),
  ),
  t("the supported skill cannot inflict wilt").output("CannotInflictWilt"),
  t(
    "every {_:int} time\\(s\\) the supported skill is used, gains a barrier if there's no barrier. interval: {_:int} s",
  ).output("GeneratesBarrier"),
  t("gains a barrier if there's no barrier").output("GeneratesBarrier"),
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
  t(
    "+{value:dec%} additional damage for this skill for every link less than maximum links",
  ).output("DmgPct", (c) => ({
    value: c.value,
    dmgModType: GLOBAL,
    addn: true,
    per: { stackable: "unused_mind_control_link" as const },
  })),
];

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
