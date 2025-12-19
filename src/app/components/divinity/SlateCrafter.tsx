"use client";

import { useMemo, useState } from "react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/src/app/components/ui/SearchableSelect";
import { MAX_SLATE_AFFIXES } from "@/src/app/lib/constants";
import {
  type DivinityAffix,
  GOD_BORDER_COLORS,
  GOD_COLORS,
  getDivinityAffixes,
} from "@/src/app/lib/divinity-utils";
import { generateItemId } from "@/src/app/lib/storage";
import {
  type Affix,
  DIVINITY_GODS,
  type DivinityGod,
  type DivinitySlate,
  ROTATIONS,
  type Rotation,
  SLATE_SHAPES,
  type SlateShape,
} from "@/src/tli/core";
import { SlatePreview } from "./SlatePreview";

const createMinimalAffix = (text: string): Affix => ({
  affixLines: text.split(/\n/).map((line) => ({ text: line })),
});

interface SlateCrafterProps {
  onSave: (slate: DivinitySlate) => void;
}

export const SlateCrafter: React.FC<SlateCrafterProps> = ({ onSave }) => {
  const [god, setGod] = useState<DivinityGod>("Hunting");
  const [shape, setShape] = useState<SlateShape>("O");
  const [rotation, setRotation] = useState<Rotation>(0);
  const [flippedH, setFlippedH] = useState(false);
  const [flippedV, setFlippedV] = useState(false);
  const [selectedAffixes, setSelectedAffixes] = useState<DivinityAffix[]>([]);

  const availableAffixes = getDivinityAffixes(god);

  const affixOptions = useMemo((): SearchableSelectOption<string>[] => {
    return availableAffixes
      .filter(
        (affix) => !selectedAffixes.some((a) => a.effect === affix.effect),
      )
      .map((affix) => ({
        value: affix.effect,
        label: affix.effect.split("\n")[0],
        sublabel: affix.type === "Legendary Medium" ? "Legendary" : "Medium",
      }));
  }, [availableAffixes, selectedAffixes]);

  const handleGodChange = (newGod: DivinityGod) => {
    setGod(newGod);
    setSelectedAffixes([]);
  };

  const handleRotate = () => {
    const currentIndex = ROTATIONS.indexOf(rotation);
    const nextIndex = (currentIndex + 1) % ROTATIONS.length;
    setRotation(ROTATIONS[nextIndex]);
  };

  const handleAddAffix = (effectValue: string | undefined) => {
    if (!effectValue) return;
    if (selectedAffixes.length >= MAX_SLATE_AFFIXES) return;
    const affix = availableAffixes.find((a) => a.effect === effectValue);
    if (!affix) return;
    if (selectedAffixes.some((a) => a.effect === affix.effect)) return;
    setSelectedAffixes([...selectedAffixes, affix]);
  };

  const handleRemoveAffix = (index: number) => {
    setSelectedAffixes(selectedAffixes.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const slate: DivinitySlate = {
      id: generateItemId(),
      god,
      shape,
      rotation,
      flippedH,
      flippedV,
      affixes: selectedAffixes.map((a) => createMinimalAffix(a.effect)),
    };
    onSave(slate);

    setSelectedAffixes([]);
    setRotation(0);
    setFlippedH(false);
    setFlippedV(false);
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
      <h3 className="mb-4 text-lg font-medium text-zinc-200">Craft Slate</h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-zinc-400">God</label>
        <div className="flex flex-wrap gap-2">
          {DIVINITY_GODS.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => handleGodChange(g)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                god === g
                  ? `${GOD_COLORS[g]} text-white`
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-zinc-400">
          Shape & Orientation
        </label>
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-2">
            {SLATE_SHAPES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setShape(s)}
                className={`flex h-12 w-12 items-center justify-center rounded border-2 transition-colors ${
                  shape === s
                    ? `${GOD_BORDER_COLORS[god]} ${GOD_COLORS[god]}`
                    : "border-zinc-600 bg-zinc-700 hover:border-zinc-500"
                }`}
              >
                <SlatePreview shape={s} god={god} size="small" />
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded border border-zinc-600 bg-zinc-900">
              <SlatePreview
                shape={shape}
                god={god}
                rotation={rotation}
                flippedH={flippedH}
                flippedV={flippedV}
                size="large"
              />
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleRotate}
                className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-600"
                title="Rotate 90°"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={() => setFlippedH((v) => !v)}
                className={`rounded px-2 py-1 text-xs ${
                  flippedH
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                }`}
                title="Flip Horizontal"
              >
                ↔
              </button>
              <button
                type="button"
                onClick={() => setFlippedV((v) => !v)}
                className={`rounded px-2 py-1 text-xs ${
                  flippedV
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                }`}
                title="Flip Vertical"
              >
                ↕
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-zinc-400">
          Selected Affixes ({selectedAffixes.length}/{MAX_SLATE_AFFIXES})
        </label>
        <div className="mb-2 flex flex-col gap-1">
          {selectedAffixes.map((affix, index) => (
            <div
              key={affix.effect}
              className="flex items-center gap-2 rounded bg-zinc-700 px-2 py-1"
            >
              <span
                className={`h-3 w-3 rounded-sm ${
                  affix.type === "Legendary Medium"
                    ? "bg-orange-500"
                    : "bg-purple-500"
                }`}
              />
              <span className="flex-1 text-sm text-zinc-200 truncate">
                {affix.effect.split("\n")[0]}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveAffix(index)}
                className="text-zinc-400 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
          {selectedAffixes.length === 0 && (
            <p className="text-sm text-zinc-500">No affixes selected</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-zinc-400">Add Affix</label>
        <SearchableSelect
          value={undefined}
          onChange={handleAddAffix}
          options={affixOptions}
          placeholder={
            selectedAffixes.length >= MAX_SLATE_AFFIXES
              ? "Max affixes reached"
              : "Search affixes..."
          }
          disabled={selectedAffixes.length >= MAX_SLATE_AFFIXES}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={selectedAffixes.length === 0}
        className="w-full rounded bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-500 disabled:bg-zinc-600 disabled:cursor-not-allowed"
      >
        Save to Inventory
      </button>
    </div>
  );
};
