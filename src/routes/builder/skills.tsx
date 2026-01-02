import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ActiveSkills, PassiveSkills } from "@/src/data/skill";
import { SkillSlot } from "../../components/skills/SkillSlot";
import type { ActiveSkillSlots, PassiveSkillSlots } from "../../lib/save-data";
import { useBuilderActions, useLoadout } from "../../stores/builderStore";

export const Route = createFileRoute("/builder/skills")({
  component: SkillsPage,
});

type ActiveSkillSlotKey = 1 | 2 | 3 | 4 | 5;
type PassiveSkillSlotKey = 1 | 2 | 3 | 4;

const ACTIVE_SKILL_SLOT_KEYS: ActiveSkillSlotKey[] = [1, 2, 3, 4, 5];
const PASSIVE_SKILL_SLOT_KEYS: PassiveSkillSlotKey[] = [1, 2, 3, 4];

const getSelectedActiveSkillNames = (skills: ActiveSkillSlots): string[] => {
  return ACTIVE_SKILL_SLOT_KEYS.map((key) => skills[key]?.skillName).filter(
    (name): name is string => name !== undefined,
  );
};

const getSelectedPassiveSkillNames = (skills: PassiveSkillSlots): string[] => {
  return PASSIVE_SKILL_SLOT_KEYS.map((key) => skills[key]?.skillName).filter(
    (name): name is string => name !== undefined,
  );
};

function SkillsPage(): React.ReactNode {
  const loadout = useLoadout();
  const {
    setActiveSkill,
    setPassiveSkill,
    toggleSkillEnabled,
    setSkillLevel,
    setSupportSkill,
  } = useBuilderActions();

  const selectedActiveNames = useMemo(
    (): string[] => getSelectedActiveSkillNames(loadout.skillPage.activeSkills),
    [loadout.skillPage.activeSkills],
  );

  const selectedPassiveNames = useMemo(
    (): string[] =>
      getSelectedPassiveSkillNames(loadout.skillPage.passiveSkills),
    [loadout.skillPage.passiveSkills],
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-bold text-zinc-50">Active Skills</h2>

        <div className="space-y-3">
          {ACTIVE_SKILL_SLOT_KEYS.map((slotKey) => (
            <SkillSlot
              key={`active-${slotKey}`}
              slotLabel={`Active ${slotKey}`}
              skill={loadout.skillPage.activeSkills[slotKey]}
              availableSkills={ActiveSkills}
              excludedSkillNames={selectedActiveNames}
              onSkillChange={(skillName) => setActiveSkill(slotKey, skillName)}
              onToggle={() => toggleSkillEnabled("active", slotKey)}
              onLevelChange={(level) => setSkillLevel("active", slotKey, level)}
              onUpdateSupport={(supportKey, slot) =>
                setSupportSkill("active", slotKey, supportKey, slot)
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-zinc-50">Passive Skills</h2>

        <div className="space-y-3">
          {PASSIVE_SKILL_SLOT_KEYS.map((slotKey) => (
            <SkillSlot
              key={`passive-${slotKey}`}
              slotLabel={`Passive ${slotKey}`}
              skill={loadout.skillPage.passiveSkills[slotKey]}
              availableSkills={PassiveSkills}
              excludedSkillNames={selectedPassiveNames}
              onSkillChange={(skillName) => setPassiveSkill(slotKey, skillName)}
              onToggle={() => toggleSkillEnabled("passive", slotKey)}
              onLevelChange={(level) =>
                setSkillLevel("passive", slotKey, level)
              }
              onUpdateSupport={(supportKey, slot) =>
                setSupportSkill("passive", slotKey, supportKey, slot)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
