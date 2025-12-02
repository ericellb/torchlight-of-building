"use client";

import { create } from "zustand";
import { HeroMemoryType } from "../lib/save-data";
import { DEFAULT_QUALITY } from "../lib/constants";

interface MemoryAffixSlotState {
  effectIndex: number | undefined;
  quality: number;
}

interface HeroUIState {
  // Memory crafting state
  craftingMemoryType: HeroMemoryType | undefined;
  craftingBaseStat: string | undefined;
  fixedAffixSlots: MemoryAffixSlotState[];
  randomAffixSlots: MemoryAffixSlotState[];

  // Actions
  setCraftingMemoryType: (type: HeroMemoryType | undefined) => void;
  setCraftingBaseStat: (stat: string | undefined) => void;
  setFixedAffixSlot: (index: number, update: Partial<MemoryAffixSlotState>) => void;
  setRandomAffixSlot: (index: number, update: Partial<MemoryAffixSlotState>) => void;
  resetMemoryCrafting: () => void;
}

const createEmptyAffixSlots = (count: number): MemoryAffixSlotState[] =>
  Array(count)
    .fill(null)
    .map(() => ({ effectIndex: undefined, quality: DEFAULT_QUALITY }));

export const useHeroUIStore = create<HeroUIState>((set) => ({
  // Initial state
  craftingMemoryType: undefined,
  craftingBaseStat: undefined,
  fixedAffixSlots: createEmptyAffixSlots(2),
  randomAffixSlots: createEmptyAffixSlots(4),

  // Actions
  setCraftingMemoryType: (type) =>
    set({
      craftingMemoryType: type,
      craftingBaseStat: undefined,
      fixedAffixSlots: createEmptyAffixSlots(2),
      randomAffixSlots: createEmptyAffixSlots(4),
    }),

  setCraftingBaseStat: (stat) => set({ craftingBaseStat: stat }),

  setFixedAffixSlot: (index, update) =>
    set((state) => ({
      fixedAffixSlots: state.fixedAffixSlots.map((slot, i) =>
        i === index ? { ...slot, ...update } : slot
      ),
    })),

  setRandomAffixSlot: (index, update) =>
    set((state) => ({
      randomAffixSlots: state.randomAffixSlots.map((slot, i) =>
        i === index ? { ...slot, ...update } : slot
      ),
    })),

  resetMemoryCrafting: () =>
    set({
      craftingMemoryType: undefined,
      craftingBaseStat: undefined,
      fixedAffixSlots: createEmptyAffixSlots(2),
      randomAffixSlots: createEmptyAffixSlots(4),
    }),
}));
