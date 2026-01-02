import type {
  BaseMagnificentSupportSkill,
  MagnificentTierRange,
} from "@/src/data/skill/types";

/**
 * Get the number of decimal places in a number.
 */
const getDecimalPlaces = (num: number): number => {
  const str = num.toString();
  const decimalIndex = str.indexOf(".");
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

/**
 * Get the decimal places to use for a tier range.
 * Uses the maximum precision from min and max values.
 */
export const getRangeDecimalPlaces = (range: MagnificentTierRange): number => {
  return Math.max(getDecimalPlaces(range.min), getDecimalPlaces(range.max));
};

/**
 * Interpolate value from percentage within tier range.
 * Preserves decimal precision based on the range's min/max values.
 * @param range - The tier range with min and max values
 * @param percentage - Value from 0-100 representing quality
 * @returns The interpolated value with appropriate decimal precision
 */
export const interpolateMagnificentValue = (
  range: MagnificentTierRange,
  percentage: number,
): number => {
  const decimalPlaces = getRangeDecimalPlaces(range);
  const rawValue = range.min + (range.max - range.min) * (percentage / 100);
  const multiplier = 10 ** decimalPlaces;
  return Math.round(rawValue * multiplier) / multiplier;
};

/**
 * Calculate percentage from value within tier range.
 * @param range - The tier range with min and max values
 * @param value - The current value
 * @returns The percentage (0-100) representing where the value falls in the range
 */
export const getQualityPercentage = (
  range: MagnificentTierRange,
  value: number,
): number => {
  if (range.max === range.min) return 100;
  return Math.round(((value - range.min) / (range.max - range.min)) * 100);
};

/**
 * Get the tier range for a magnificent skill.
 * Uses the first tier value key if multiple exist.
 */
export const getTierRange = (
  skill: BaseMagnificentSupportSkill,
  tier: 0 | 1 | 2,
): MagnificentTierRange | undefined => {
  if (skill.tierValues === undefined) return undefined;
  const firstKey = Object.keys(skill.tierValues)[0];
  if (firstKey === undefined) return undefined;
  return skill.tierValues[firstKey][tier];
};

/**
 * Get the worst (lowest quality) defaults for a magnificent skill.
 * Defaults to tier 2, rank 1, and the minimum value for tier 2.
 */
export const getWorstMagnificentDefaults = (
  skill: BaseMagnificentSupportSkill,
): { tier: 0 | 1 | 2; rank: 1 | 2 | 3 | 4 | 5; value: number } => {
  const tier = 2 as const;
  const rank = 1 as const;
  const tierRange = getTierRange(skill, tier);
  const value = tierRange?.min ?? 0;
  return { tier, rank, value };
};
