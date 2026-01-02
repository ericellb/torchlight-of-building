import { useEffect, useState } from "react";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import type {
  BaseMagnificentSupportSkill,
  MagnificentSupportSkillName,
} from "@/src/data/skill/types";
import {
  getQualityPercentage,
  getTierRange,
  interpolateMagnificentValue,
} from "@/src/lib/magnificent-utils";
import type { MagnificentSupportSkillSlot } from "@/src/lib/save-data";
import {
  Modal,
  ModalActions,
  ModalButton,
  ModalDescription,
} from "../ui/Modal";

interface MagnificentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: BaseMagnificentSupportSkill;
  currentSlot: MagnificentSupportSkillSlot;
  onConfirm: (slot: MagnificentSupportSkillSlot) => void;
}

const TIER_OPTIONS = [
  { value: 0 as const, label: "Tier 0 (Best)" },
  { value: 1 as const, label: "Tier 1" },
  { value: 2 as const, label: "Tier 2 (Worst)" },
];

const RANK_OPTIONS = [
  { value: 1 as const, label: "Rank 1" },
  { value: 2 as const, label: "Rank 2" },
  { value: 3 as const, label: "Rank 3" },
  { value: 4 as const, label: "Rank 4" },
  { value: 5 as const, label: "Rank 5" },
];

export const MagnificentEditModal = ({
  isOpen,
  onClose,
  skill,
  currentSlot,
  onConfirm,
}: MagnificentEditModalProps): React.ReactNode => {
  const [tier, setTier] = useState<0 | 1 | 2>(currentSlot.tier);
  const [rank, setRank] = useState<1 | 2 | 3 | 4 | 5>(currentSlot.rank);
  const [percentage, setPercentage] = useState(0);

  // Get the tier range for the current tier
  const tierRange = getTierRange(skill, tier);
  const hasTierValues = tierRange !== undefined;

  // Calculate the value from percentage
  const value = hasTierValues
    ? interpolateMagnificentValue(tierRange, percentage)
    : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTier(currentSlot.tier);
      setRank(currentSlot.rank);
      // Calculate initial percentage from current value
      const range = getTierRange(skill, currentSlot.tier);
      if (range !== undefined) {
        setPercentage(getQualityPercentage(range, currentSlot.value));
      } else {
        setPercentage(0);
      }
    }
  }, [isOpen, currentSlot, skill]);

  // When tier changes, reset percentage to 0 (minimum value for new tier)
  const handleTierChange = (newTier: 0 | 1 | 2): void => {
    setTier(newTier);
    setPercentage(0);
  };

  const handleConfirm = (): void => {
    onConfirm({
      name: currentSlot.name as MagnificentSupportSkillName,
      tier,
      rank,
      value,
    });
    onClose();
  };

  // Build preview text from skill description
  const getPreviewText = (): string => {
    const lines: string[] = [];

    // Add tier-scaled value if applicable
    if (hasTierValues) {
      const tierValueKey = Object.keys(skill.tierValues ?? {})[0];
      if (tierValueKey !== undefined) {
        // Format value with sign (e.g., "+13%" or "-3%")
        const formattedValue = value >= 0 ? `+${value}%` : `${value}%`;
        lines.push(`${formattedValue} (${tierValueKey})`);
      }
    }

    // Add rank-scaled values
    if (skill.rankValues !== undefined) {
      for (const [key, values] of Object.entries(skill.rankValues)) {
        const rankValue = values[rank - 1];
        const formattedValue =
          rankValue >= 0 ? `+${rankValue}%` : `${rankValue}%`;
        lines.push(`${formattedValue} (${key})`);
      }
    }

    // Add constant values
    if (skill.constantValues !== undefined) {
      for (const [key, constValue] of Object.entries(skill.constantValues)) {
        const formattedValue =
          constValue >= 0 ? `+${constValue}%` : `${constValue}%`;
        lines.push(`${formattedValue} (${key})`);
      }
    }

    return lines.join("\n");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Magnificent Support"
      maxWidth="md"
    >
      <ModalDescription>{skill.name}</ModalDescription>

      <div className="space-y-4">
        {/* Tier selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tier</label>
          <SearchableSelect
            value={tier}
            onChange={(val) => val !== undefined && handleTierChange(val)}
            options={TIER_OPTIONS}
            placeholder="Select tier"
          />
        </div>

        {/* Rank selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Rank</label>
          <SearchableSelect
            value={rank}
            onChange={(val) => val !== undefined && setRank(val)}
            options={RANK_OPTIONS}
            placeholder="Select rank"
          />
        </div>

        {/* Quality slider (only if tier values exist) */}
        {hasTierValues && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-zinc-400">Quality</label>
              <span className="text-sm font-medium text-zinc-50">
                {percentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-xs text-zinc-500 mt-1">
              Value: {value} (Range: {tierRange.min} - {tierRange.max})
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Preview</div>
          <div className="text-sm text-amber-400 whitespace-pre-line">
            {getPreviewText()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ModalActions>
          <ModalButton onClick={handleConfirm} fullWidth>
            Confirm
          </ModalButton>
          <ModalButton onClick={onClose} variant="secondary">
            Cancel
          </ModalButton>
        </ModalActions>
      </div>
    </Modal>
  );
};
