"use client";

import { create } from "zustand";
import { DivinityGod, SlateShape, DivinityAffixType } from "../lib/save-data";
import { MAX_SLATE_AFFIXES } from "../lib/constants";

interface SelectedSlateAffix {
  effect: string;
  affixType: DivinityAffixType;
}

interface DivinityUIState {
  // Slate crafting state
  craftingGod: DivinityGod | undefined;
  craftingShape: SlateShape;
  craftingAffixes: SelectedSlateAffix[];

  // Dragging state
  draggingSlateId: string | undefined;
  previewPosition: { row: number; col: number } | undefined;

  // Actions
  setCraftingGod: (god: DivinityGod | undefined) => void;
  setCraftingShape: (shape: SlateShape) => void;
  addCraftingAffix: (affix: SelectedSlateAffix) => void;
  removeCraftingAffix: (index: number) => void;
  resetSlateCrafting: () => void;

  setDraggingSlateId: (id: string | undefined) => void;
  setPreviewPosition: (position: { row: number; col: number } | undefined) => void;
}

export const useDivinityUIStore = create<DivinityUIState>((set) => ({
  // Initial state
  craftingGod: undefined,
  craftingShape: "O",
  craftingAffixes: [],
  draggingSlateId: undefined,
  previewPosition: undefined,

  // Actions
  setCraftingGod: (god) =>
    set({
      craftingGod: god,
      craftingAffixes: [],
    }),

  setCraftingShape: (shape) => set({ craftingShape: shape }),

  addCraftingAffix: (affix) =>
    set((state) => {
      if (state.craftingAffixes.length >= MAX_SLATE_AFFIXES) return state;
      if (state.craftingAffixes.some((a) => a.effect === affix.effect))
        return state;
      return {
        craftingAffixes: [...state.craftingAffixes, affix],
      };
    }),

  removeCraftingAffix: (index) =>
    set((state) => ({
      craftingAffixes: state.craftingAffixes.filter((_, i) => i !== index),
    })),

  resetSlateCrafting: () =>
    set({
      craftingGod: undefined,
      craftingShape: "O",
      craftingAffixes: [],
    }),

  setDraggingSlateId: (id) => set({ draggingSlateId: id }),

  setPreviewPosition: (position) => set({ previewPosition: position }),
}));
