import type { HeroTraitName } from "@/src/data/hero_trait";
import type { Mod } from "../mod";

type ModFactory = (levelIndex: number) => Mod;

const heroTraitModFactories: Partial<Record<HeroTraitName, ModFactory[]>> = {
  // Rosa 2
  "Unsullied Blade": [() => ({ type: "SpellDmgBonusAppliesToAtkDmg" })],
  "Baptism of Purity": [
    () => ({ type: "MaxManaPct", value: 0.2, addn: true }),
    (i) => ({
      type: "MercuryBaptism",
      value: [0.12, 0.2, 0.28, 0.36, 0.44][i],
    }),
  ],
  "Cleanse Filth": [
    (i) => ({
      type: "DmgPct",
      value: [0.03, 0.035, 0.4, 0.045, 0.05][i],
      modType: "elemental",
      addn: true,
      per: {
        stackable: "max_mana",
        valueLimit: [0.6, 0.7, 0.8, 0.9, 1][i],
        amt: 1000,
      },
    }),
    () => ({ type: "ManaBeforeLife", value: 0.25, cond: "realm_of_mercury" }),
  ],
  "Utmost Devotion": [
    (i) => ({
      type: "MaxMercuryPtsPct",
      value: 0.1,
      per: {
        stackable: "max_mana",
        valueLimit: [2, 2.5, 3, 3.5, 4][i],
        amt: 1000,
      },
    }),
    (i) => ({
      type: "DmgPct",
      value: [0.12, 0.16, 0.2, 0.24, 0.28][i],
      modType: "elemental",
      addn: true,
      per: { stackable: "mercury_pt" },
    }),
  ],
};

export const getHeroTraitMods = (name: HeroTraitName, level: number): Mod[] => {
  const mods = heroTraitModFactories[name]?.map((f) => f(level - 1)) ?? [];
  const modsWithSrc = mods.map((mod) => {
    return { ...mod, src: `HeroTrait: ${name} Lv.${level}` };
  });
  return modsWithSrc;
};
