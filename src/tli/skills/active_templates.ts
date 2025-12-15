import type { ActiveSkillName, SkillOffenseTemplate } from "@/src/data/skill";
import type { ModWithoutValue } from "./support_templates";

export type ActiveSkillTemplate = {
  levelOffense?: SkillOffenseTemplate[];
  levelMods?: ModWithoutValue[];
};

export const activeSkillTemplates: Partial<
  Record<ActiveSkillName, ActiveSkillTemplate>
> = {
  "Frost Spike": {
    levelOffense: [{ type: "WeaponAtkDmgPct" }, { type: "AddedDmgEffPct" }],
    levelMods: [
      { type: "ConvertDmgPct", from: "physical", to: "cold" },
      { type: "MaxProjectile", override: true },
      { type: "Projectile", per: { stackable: "frostbite_rating", amt: 35 } },
      { type: "Projectile" },
      {
        type: "DmgPct",
        modType: "global",
        addn: true,
        per: { stackable: "projectile" },
      },
    ],
  },
};
