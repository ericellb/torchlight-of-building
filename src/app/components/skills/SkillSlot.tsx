"use client";

import { useMemo, useState } from "react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/src/app/components/ui/SearchableSelect";
import type { SkillWithSupports, SupportSkills } from "@/src/app/lib/save-data";
import type { BaseActiveSkill, BaseSkill } from "@/src/data/skill/types";
import { SupportSkillSelector } from "./SupportSkillSelector";

type SupportSkillKey = keyof SupportSkills;

const SUPPORT_SKILL_KEYS: SupportSkillKey[] = [
  "supportSkill1",
  "supportSkill2",
  "supportSkill3",
  "supportSkill4",
  "supportSkill5",
];

interface SkillSlotProps {
  slotLabel: string;
  skill: SkillWithSupports | undefined;
  availableSkills: readonly (BaseActiveSkill | BaseSkill)[];
  excludedSkillNames: string[];
  onSkillChange: (skillName: string | undefined) => void;
  onToggle: () => void;
  onUpdateSupport: (
    supportKey: SupportSkillKey,
    supportName: string | undefined,
  ) => void;
}

export const SkillSlot: React.FC<SkillSlotProps> = ({
  slotLabel,
  skill,
  availableSkills,
  excludedSkillNames,
  onSkillChange,
  onToggle,
  onUpdateSupport,
}) => {
  const [expanded, setExpanded] = useState(false);

  const mainSkill = useMemo(
    () => availableSkills.find((s) => s.name === skill?.skillName),
    [availableSkills, skill?.skillName],
  );

  const selectedSupports = skill
    ? SUPPORT_SKILL_KEYS.map((key) => skill.supportSkills[key]).filter(
        (s): s is string => s !== undefined,
      )
    : [];

  const supportCount = selectedSupports.length;
  const hasSkill = skill !== undefined;

  // Filter available skills to exclude already-selected ones (but keep current selection)
  const filteredSkills = availableSkills.filter(
    (s) => s.name === skill?.skillName || !excludedSkillNames.includes(s.name),
  );

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-700">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={skill?.enabled ?? false}
            onChange={onToggle}
            disabled={!hasSkill}
            className="w-5 h-5 disabled:opacity-50 accent-amber-500"
          />
          <span className="text-xs text-zinc-500 w-16">{slotLabel}</span>
          <SearchableSelect
            value={skill?.skillName}
            onChange={onSkillChange}
            options={filteredSkills.map(
              (s): SearchableSelectOption<string> => ({
                value: s.name,
                label: s.name,
              }),
            )}
            placeholder="<Empty slot>"
            size="sm"
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasSkill && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-amber-500 rounded text-sm text-zinc-400"
            >
              {expanded ? "Hide" : "Supports"} ({supportCount}/5)
            </button>
          )}
        </div>
      </div>

      {expanded && skill && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
          <div className="space-y-2">
            {SUPPORT_SKILL_KEYS.map((key, index) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-6">{index + 1}.</span>
                <SupportSkillSelector
                  mainSkill={mainSkill}
                  selectedSkill={skill.supportSkills[key]}
                  excludedSkills={selectedSupports.filter(
                    (s) => s !== skill.supportSkills[key],
                  )}
                  onChange={(supportName) => onUpdateSupport(key, supportName)}
                  slotIndex={index + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
