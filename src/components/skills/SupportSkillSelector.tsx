import { useMemo } from "react";
import {
  SearchableSelect,
  type SearchableSelectOption,
  type SearchableSelectOptionGroup,
} from "@/src/components/ui/SearchableSelect";
import { Tooltip } from "@/src/components/ui/Tooltip";
import {
  ActivationMediumSkills,
  MagnificentSupportSkills,
  NobleSupportSkills,
  SupportSkills,
} from "@/src/data/skill";
import type {
  ActivationMediumSkillNmae,
  BaseActiveSkill,
  BaseMagnificentSupportSkill,
  BaseSkill,
  MagnificentSupportSkillName,
  NobleSupportSkillName,
  SupportSkillName,
} from "@/src/data/skill/types";
import type { BaseSupportSkillSlot } from "@/src/lib/save-data";
import { listAvailableSupports } from "@/src/lib/skill-utils";
import { OptionWithSkillTooltip } from "./OptionWithSkillTooltip";
import { SkillTooltipContent } from "./SkillTooltipContent";

interface SupportSkillSelectorProps {
  mainSkill: BaseActiveSkill | BaseSkill | undefined;
  selectedSlot: BaseSupportSkillSlot | undefined;
  excludedSkills: string[];
  onChange: (slot: BaseSupportSkillSlot | undefined) => void;
  slotIndex: number; // 1-indexed
}

const SKILL_LEVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `Lv. ${i + 1}`,
}));

const TIER_OPTIONS = [
  { value: 0 as const, label: "Tier 0" },
  { value: 1 as const, label: "Tier 1" },
  { value: 2 as const, label: "Tier 2" },
];

const RANK_OPTIONS = [
  { value: 1 as const, label: "Rank 1" },
  { value: 2 as const, label: "Rank 2" },
  { value: 3 as const, label: "Rank 3" },
  { value: 4 as const, label: "Rank 4" },
  { value: 5 as const, label: "Rank 5" },
];

type SupportSkillType =
  | "regular"
  | "magnificent"
  | "noble"
  | "activationMedium"
  | undefined;

const getSkillType = (skillName: string | undefined): SupportSkillType => {
  if (skillName === undefined) return undefined;
  if (SupportSkills.some((s) => s.name === skillName)) return "regular";
  if (MagnificentSupportSkills.some((s) => s.name === skillName))
    return "magnificent";
  if (NobleSupportSkills.some((s) => s.name === skillName)) return "noble";
  if (ActivationMediumSkills.some((s) => s.name === skillName))
    return "activationMedium";
  return undefined;
};

const getMagnificentSkill = (
  skillName: string,
): BaseMagnificentSupportSkill | undefined => {
  return MagnificentSupportSkills.find((s) => s.name === skillName);
};

const getValueOptions = (
  skill: BaseMagnificentSupportSkill,
  tier: 0 | 1 | 2,
): { value: number; label: string }[] => {
  if (skill.tierValues === undefined) return [];
  const firstKey = Object.keys(skill.tierValues)[0];
  if (firstKey === undefined) return [];
  const range = skill.tierValues[firstKey][tier];
  const options: { value: number; label: string }[] = [];
  for (let v = range.min; v <= range.max; v++) {
    options.push({ value: v, label: String(v) });
  }
  return options;
};

export const SupportSkillSelector: React.FC<SupportSkillSelectorProps> = ({
  mainSkill,
  selectedSlot,
  excludedSkills,
  onChange,
  slotIndex,
}) => {
  const selectedSkillName = selectedSlot?.name;
  const skillType = useMemo(
    () => getSkillType(selectedSkillName),
    [selectedSkillName],
  );

  const { options, groups } = useMemo(() => {
    // Combine all skill types for the flat options list
    const allSkills = [
      ...SupportSkills,
      ...ActivationMediumSkills,
      ...MagnificentSupportSkills,
      ...NobleSupportSkills,
    ];

    // Filter out excluded skills (but keep currently selected)
    const filteredSkills = allSkills.filter(
      (skill) =>
        skill.name === selectedSkillName ||
        !excludedSkills.includes(skill.name),
    );

    const opts: SearchableSelectOption<string>[] = filteredSkills.map(
      (skill) => ({
        value: skill.name,
        label: skill.name,
      }),
    );

    if (mainSkill === undefined) {
      return { options: opts, groups: undefined };
    }

    // Get available supports organized by category
    const available = listAvailableSupports(mainSkill, slotIndex);

    // Build groups, filtering by excludedSkills
    const grps: SearchableSelectOptionGroup<string>[] = [];

    // Helper to filter and create options
    const filterAndMap = (names: string[]): SearchableSelectOption<string>[] =>
      names
        .filter(
          (name) =>
            name === selectedSkillName || !excludedSkills.includes(name),
        )
        .map((name) => ({ value: name, label: name }));

    // Add groups only if they have options
    if (available.activationMedium.length > 0) {
      const filtered = filterAndMap(available.activationMedium);
      if (filtered.length > 0) {
        grps.push({ label: "Activation Medium", options: filtered });
      }
    }

    if (available.magnificent.length > 0) {
      const filtered = filterAndMap(available.magnificent);
      if (filtered.length > 0) {
        grps.push({ label: "Magnificent", options: filtered });
      }
    }

    if (available.noble.length > 0) {
      const filtered = filterAndMap(available.noble);
      if (filtered.length > 0) {
        grps.push({ label: "Noble", options: filtered });
      }
    }

    if (available.compatible.length > 0) {
      const filtered = filterAndMap(available.compatible);
      if (filtered.length > 0) {
        grps.push({ label: "Compatible", options: filtered });
      }
    }

    if (available.other.length > 0) {
      const filtered = filterAndMap(available.other);
      if (filtered.length > 0) {
        grps.push({ label: "Other", options: filtered });
      }
    }

    return { options: opts, groups: grps };
  }, [mainSkill, slotIndex, selectedSkillName, excludedSkills]);

  const skillsByName = useMemo(() => {
    const allSkills = [
      ...SupportSkills,
      ...ActivationMediumSkills,
      ...MagnificentSupportSkills,
      ...NobleSupportSkills,
    ];
    const map = new Map<string, BaseSkill>();
    for (const s of allSkills) {
      map.set(s.name, s);
    }
    return map;
  }, []);

  const handleSkillChange = (skillName: string | undefined): void => {
    if (skillName === undefined) {
      onChange(undefined);
      return;
    }

    const type = getSkillType(skillName);
    switch (type) {
      case "regular":
        onChange({ name: skillName as SupportSkillName, level: 20 });
        break;
      case "magnificent": {
        const magSkill = getMagnificentSkill(skillName);
        const valueOptions =
          magSkill !== undefined ? getValueOptions(magSkill, 0) : [];
        const defaultValue =
          valueOptions.length > 0
            ? valueOptions[valueOptions.length - 1].value
            : 0;
        onChange({
          name: skillName as MagnificentSupportSkillName,
          tier: 0,
          rank: 5,
          value: defaultValue,
        });
        break;
      }
      case "noble":
        onChange({ name: skillName as NobleSupportSkillName });
        break;
      case "activationMedium":
        onChange({ name: skillName as ActivationMediumSkillNmae });
        break;
      default:
        onChange(undefined);
    }
  };

  const handleLevelChange = (level: number): void => {
    if (
      selectedSlot === undefined ||
      skillType !== "regular" ||
      !("name" in selectedSlot)
    )
      return;
    // selectedSlot is SupportSkillSlot since skillType === "regular"
    onChange({
      name: selectedSlot.name as SupportSkillName,
      level,
    });
  };

  const handleTierChange = (tier: 0 | 1 | 2): void => {
    if (
      selectedSlot === undefined ||
      skillType !== "magnificent" ||
      !("tier" in selectedSlot)
    )
      return;
    const magSkill = getMagnificentSkill(selectedSlot.name);
    const valueOptions =
      magSkill !== undefined ? getValueOptions(magSkill, tier) : [];
    const newValue =
      valueOptions.length > 0
        ? valueOptions[valueOptions.length - 1].value
        : selectedSlot.value;
    onChange({
      name: selectedSlot.name as MagnificentSupportSkillName,
      tier,
      rank: selectedSlot.rank,
      value: newValue,
    });
  };

  const handleRankChange = (rank: 1 | 2 | 3 | 4 | 5): void => {
    if (
      selectedSlot === undefined ||
      skillType !== "magnificent" ||
      !("rank" in selectedSlot)
    )
      return;
    onChange({
      name: selectedSlot.name as MagnificentSupportSkillName,
      tier: selectedSlot.tier,
      rank,
      value: selectedSlot.value,
    });
  };

  const handleValueChange = (value: number): void => {
    if (
      selectedSlot === undefined ||
      skillType !== "magnificent" ||
      !("value" in selectedSlot)
    )
      return;
    onChange({
      name: selectedSlot.name as MagnificentSupportSkillName,
      tier: selectedSlot.tier,
      rank: selectedSlot.rank,
      value,
    });
  };

  const renderOption = (
    option: SearchableSelectOption<string>,
    { selected }: { active: boolean; selected: boolean },
  ): React.ReactNode => {
    const skillData = skillsByName.get(option.value);
    if (skillData === undefined) return <span>{option.label}</span>;
    return <OptionWithSkillTooltip skill={skillData} selected={selected} />;
  };

  const renderSelectedTooltip = (
    option: SearchableSelectOption<string>,
    triggerRect: DOMRect,
    tooltipHandlers: { onMouseEnter: () => void; onMouseLeave: () => void },
  ): React.ReactNode => {
    const skillData = skillsByName.get(option.value);
    if (skillData === undefined) return null;
    return (
      <Tooltip isVisible={true} triggerRect={triggerRect} {...tooltipHandlers}>
        <SkillTooltipContent skill={skillData} />
      </Tooltip>
    );
  };

  // Get magnificent skill data for value options
  const magnificentValueOptions = useMemo(() => {
    if (
      skillType !== "magnificent" ||
      selectedSlot === undefined ||
      !("tier" in selectedSlot)
    )
      return [];
    const magSkill = getMagnificentSkill(selectedSlot.name);
    if (magSkill === undefined) return [];
    return getValueOptions(magSkill, selectedSlot.tier);
  }, [skillType, selectedSlot]);

  return (
    <div className="flex items-center gap-2 flex-1">
      <SearchableSelect
        value={selectedSkillName}
        onChange={handleSkillChange}
        options={options}
        groups={groups}
        placeholder="<Empty slot>"
        size="sm"
        className="flex-1"
        renderOption={renderOption}
        renderSelectedTooltip={renderSelectedTooltip}
      />
      {skillType === "regular" && selectedSlot !== undefined && (
        <SearchableSelect
          value={"level" in selectedSlot ? (selectedSlot.level ?? 20) : 20}
          onChange={(val) => val !== undefined && handleLevelChange(val)}
          options={SKILL_LEVEL_OPTIONS}
          placeholder="Lv."
          size="sm"
          className="w-20"
        />
      )}
      {skillType === "magnificent" &&
        selectedSlot !== undefined &&
        "tier" in selectedSlot && (
          <>
            <SearchableSelect
              value={selectedSlot.tier}
              onChange={(val) => val !== undefined && handleTierChange(val)}
              options={TIER_OPTIONS}
              placeholder="Tier"
              size="sm"
              className="w-20"
            />
            <SearchableSelect
              value={selectedSlot.rank}
              onChange={(val) => val !== undefined && handleRankChange(val)}
              options={RANK_OPTIONS}
              placeholder="Rank"
              size="sm"
              className="w-20"
            />
            {magnificentValueOptions.length > 0 && (
              <SearchableSelect
                value={selectedSlot.value}
                onChange={(val) => val !== undefined && handleValueChange(val)}
                options={magnificentValueOptions}
                placeholder="Value"
                size="sm"
                className="w-16"
              />
            )}
          </>
        )}
    </div>
  );
};
