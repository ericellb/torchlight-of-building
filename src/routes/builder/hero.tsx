import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { HeroTab } from "../../components/hero/HeroTab";
import { getBaseTraitForHero } from "../../lib/hero-utils";
import type { HeroMemory, HeroMemorySlot } from "../../lib/save-data";
import { createEmptyHeroPage } from "../../lib/storage";
import { useBuilderActions, useLoadout } from "../../stores/builderStore";

export const Route = createFileRoute("/builder/hero")({
  component: HeroPage,
});

function HeroPage(): React.ReactNode {
  const loadout = useLoadout();
  const actions = useBuilderActions();

  const handleHeroChange = useCallback(
    (hero: string | undefined) => {
      actions.updateSaveData((prev) => {
        if (!hero) {
          return {
            ...prev,
            heroPage: createEmptyHeroPage(),
          };
        }

        const baseTrait = getBaseTraitForHero(hero);

        return {
          ...prev,
          heroPage: {
            selectedHero: hero,
            traits: {
              level1: baseTrait?.name,
              level45: undefined,
              level60: undefined,
              level75: undefined,
            },
            memorySlots: {
              slot45: undefined,
              slot60: undefined,
              slot75: undefined,
            },
          },
        };
      });
    },
    [actions],
  );

  const handleTraitSelect = useCallback(
    (level: 45 | 60 | 75, traitName: string | undefined) => {
      const traitKey = `level${level}` as "level45" | "level60" | "level75";
      actions.setTrait(traitKey, traitName);
    },
    [actions],
  );

  const handleMemoryEquip = useCallback(
    (slot: HeroMemorySlot, memoryId: string | undefined) => {
      actions.updateSaveData((prev) => {
        const memory = memoryId
          ? prev.heroMemoryList.find((m) => m.id === memoryId)
          : undefined;

        return {
          ...prev,
          heroPage: {
            ...prev.heroPage,
            memorySlots: {
              ...prev.heroPage.memorySlots,
              [slot]: memory,
            },
          },
        };
      });
    },
    [actions],
  );

  const handleMemorySave = useCallback(
    (memory: HeroMemory) => {
      actions.addHeroMemory(memory);
    },
    [actions],
  );

  const handleMemoryCopy = useCallback(
    (memoryId: string) => {
      actions.copyHeroMemory(memoryId);
    },
    [actions],
  );

  const handleMemoryDelete = useCallback(
    (memoryId: string) => {
      actions.deleteHeroMemory(memoryId);
    },
    [actions],
  );

  return (
    <HeroTab
      heroPage={loadout.heroPage}
      heroMemoryList={loadout.heroPage.memoryInventory}
      onHeroChange={handleHeroChange}
      onTraitSelect={handleTraitSelect}
      onMemoryEquip={handleMemoryEquip}
      onMemorySave={handleMemorySave}
      onMemoryCopy={handleMemoryCopy}
      onMemoryDelete={handleMemoryDelete}
    />
  );
}
