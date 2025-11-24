"use client";

import { useState, useEffect } from "react";
import { RawLoadout, RawGearPage, RawGear } from "@/src/tli/core";

type GearSlot = keyof RawGearPage;

const GEAR_SLOTS: { key: GearSlot; label: string }[] = [
  { key: "helmet", label: "Helmet" },
  { key: "chest", label: "Chest" },
  { key: "neck", label: "Neck" },
  { key: "gloves", label: "Gloves" },
  { key: "belt", label: "Belt" },
  { key: "boots", label: "Boots" },
  { key: "leftRing", label: "Left Ring" },
  { key: "rightRing", label: "Right Ring" },
  { key: "mainHand", label: "Main Hand" },
  { key: "offHand", label: "Off Hand" },
];

const STORAGE_KEY = "tli-planner-loadout";

const createEmptyLoadout = (): RawLoadout => ({
  equipmentPage: {},
  talentPage: {
    tree1: { name: "Warrior", allocatedNodes: [] },
    tree2: { name: "Warrior", allocatedNodes: [] },
    tree3: { name: "Warrior", allocatedNodes: [] },
    tree4: { name: "Warrior", allocatedNodes: [] },
  },
});

const loadFromStorage = (): RawLoadout => {
  if (typeof window === "undefined") return createEmptyLoadout();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyLoadout();
    return JSON.parse(stored) as RawLoadout;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return createEmptyLoadout();
  }
};

const saveToStorage = (loadout: RawLoadout): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadout));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

export default function Home() {
  const [loadout, setLoadout] = useState<RawLoadout>(createEmptyLoadout);
  const [selectedSlot, setSelectedSlot] = useState<GearSlot>("helmet");
  const [newAffix, setNewAffix] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoadout(loadFromStorage());
  }, []);

  const selectedGear = loadout.equipmentPage[selectedSlot];

  const getGearType = (slot: GearSlot): RawGear["gearType"] => {
    if (slot === "leftRing" || slot === "rightRing") return "ring";
    if (slot === "mainHand" || slot === "offHand") return "sword";
    return slot;
  };

  const handleAddAffix = () => {
    if (!newAffix.trim()) return;

    setLoadout((prev) => {
      const currentGear = prev.equipmentPage[selectedSlot];
      const updatedGear: RawGear = currentGear
        ? { ...currentGear, affixes: [...currentGear.affixes, newAffix.trim()] }
        : { gearType: getGearType(selectedSlot), affixes: [newAffix.trim()] };

      return {
        ...prev,
        equipmentPage: {
          ...prev.equipmentPage,
          [selectedSlot]: updatedGear,
        },
      };
    });

    setNewAffix("");
  };

  const handleDeleteAffix = (index: number) => {
    setLoadout((prev) => {
      const currentGear = prev.equipmentPage[selectedSlot];
      if (!currentGear) return prev;

      const updatedAffixes = currentGear.affixes.filter((_, i) => i !== index);

      if (updatedAffixes.length === 0) {
        const { [selectedSlot]: _, ...restEquipment } = prev.equipmentPage;
        return {
          ...prev,
          equipmentPage: restEquipment,
        };
      }

      return {
        ...prev,
        equipmentPage: {
          ...prev.equipmentPage,
          [selectedSlot]: { ...currentGear, affixes: updatedAffixes },
        },
      };
    });
  };

  const handleSave = () => {
    saveToStorage(loadout);
    alert("Loadout saved!");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">
          TLI Character Build Planner
        </h1>

        {/* Gear Slot Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
            Equipment Slots
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {GEAR_SLOTS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedSlot(key)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    selectedSlot === key
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Affix Manager */}
        <div className="mb-8 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
            Affixes for {GEAR_SLOTS.find((s) => s.key === selectedSlot)?.label}
          </h2>

          {/* Affix List */}
          <div className="mb-4">
            {!selectedGear || selectedGear.affixes.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 italic">
                No affixes yet. Add one below!
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedGear.affixes.map((affix, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-700 px-4 py-2 rounded"
                  >
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {affix}
                    </span>
                    <button
                      onClick={() => handleDeleteAffix(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Affix Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAffix}
              onChange={(e) => setNewAffix(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddAffix();
              }}
              placeholder="e.g., +10% fire damage"
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddAffix}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
          >
            Save to LocalStorage
          </button>
        </div>
      </div>
    </div>
  );
}
