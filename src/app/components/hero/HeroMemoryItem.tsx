"use client";

import { Tooltip, TooltipTitle } from "@/src/app/components/ui/Tooltip";
import { useTooltip } from "@/src/app/hooks/useTooltip";
import type { HeroMemory } from "@/src/app/lib/save-data";
import { formatCraftedMemoryAffixes } from "../../lib/hero-utils";

interface HeroMemoryItemProps {
  memory: HeroMemory;
  isEquipped: boolean;
  onCopy: (memory: HeroMemory) => void;
  onDelete: (id: string) => void;
}

export const HeroMemoryItem: React.FC<HeroMemoryItemProps> = ({
  memory,
  isEquipped,
  onCopy,
  onDelete,
}) => {
  const { isHovered, mousePos, handlers } = useTooltip();

  const craftedAffixes = formatCraftedMemoryAffixes(memory);

  return (
    <div
      className="group relative flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
      {...handlers}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-50 text-sm">
          {memory.memoryType}
        </span>
        <span className="text-xs text-zinc-500">
          ({craftedAffixes.length} affixes)
        </span>
        {isEquipped && (
          <span className="text-xs text-green-500 font-medium">Equipped</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(memory)}
          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded text-xs"
          title="Copy memory"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => onDelete(memory.id)}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
          title="Delete memory"
        >
          Delete
        </button>
      </div>

      <Tooltip isVisible={isHovered} mousePos={mousePos}>
        <TooltipTitle>{memory.memoryType}</TooltipTitle>
        {craftedAffixes.length > 0 ? (
          <ul className="space-y-1">
            {craftedAffixes.map((affix, idx) => (
              <li
                key={idx}
                className="text-xs text-zinc-400 whitespace-pre-wrap"
              >
                {affix}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500 italic">No affixes</p>
        )}
      </Tooltip>
    </div>
  );
};
