import type { MagnificentSupportMod, NobleSupportMod } from "../core";
import { t } from "../mod_parser";

const GLOBAL = "global" as const;

/**
 * Generic template parsers for magnificent/noble support skill affixes.
 * Each template handles a specific affix pattern across all skills.
 */
const allMagnificentNobleParsers = [
  t("{value:int%} additional damage for the supported skill").output(
    "DmgPct",
    (c) => ({
      value: c.value,
      dmgModType: GLOBAL,
      addn: true,
    }),
  ),
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
 * Parse a single magnificent support affix text.
 * Returns undefined if no parser matches.
 */
const parseMagnificentSupportAffix = (
  text: string,
): MagnificentSupportMod[] | undefined => {
  const normalized = text.trim().toLowerCase();
  for (const parser of allMagnificentNobleParsers) {
    const mods = parser.parse(normalized);
    if (mods !== undefined) {
      return mods.map((mod) => ({ mod }));
    }
  }
  return undefined;
};

/**
 * Parse a single noble support affix text.
 * Returns undefined if no parser matches.
 */
const parseNobleSupportAffix = (
  text: string,
): NobleSupportMod[] | undefined => {
  const normalized = text.trim().toLowerCase();
  for (const parser of allMagnificentNobleParsers) {
    const mods = parser.parse(normalized);
    if (mods !== undefined) {
      return mods.map((mod) => ({ mod }));
    }
  }
  return undefined;
};

export const parseMagnificentSupportAffixes = (
  affixes: string[],
): MagnificentSupportMod[][] => {
  return affixes.map((text) => parseMagnificentSupportAffix(text) ?? []);
};

export const parseNobleSupportAffixes = (
  affixes: string[],
): NobleSupportMod[][] => {
  return affixes.map((text) => parseNobleSupportAffix(text) ?? []);
};
