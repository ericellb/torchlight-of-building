import type { PassiveSkillName } from "@/src/data/skill";
import type { ModWithoutValue } from "./support_templates";

export type PassiveSkillTemplate = {
  levelBuffMods?: ModWithoutValue[];
  levelMods?: ModWithoutValue[];
};

export const passiveSkillTemplates: Partial<
  Record<PassiveSkillName, PassiveSkillTemplate>
> = {
  "Precise: Cruelty": {
    levelBuffMods: [{ type: "DmgPct", addn: true, modType: "attack" }],
    levelMods: [
      {
        type: "AuraEffPct",
        addn: true,
        per: { stackable: "cruelty_buff", limit: 40 },
        unscalable: true,
      },
    ],
  },
};
