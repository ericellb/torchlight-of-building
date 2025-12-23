import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import type { PactspiritPage as SaveDataPactspiritPage } from "@/src/lib/save-data";
import { PactspiritTab } from "../../components/pactspirit/PactspiritTab";
import { createEmptyPactspiritSlot } from "../../lib/storage";
import type {
  InstalledDestinyResult,
  PactspiritSlotIndex,
  RingSlotKey,
} from "../../lib/types";
import { useBuilderActions, useLoadout } from "../../stores/builderStore";

export const Route = createFileRoute("/builder/pactspirit")({
  component: PactspiritPage,
});

function PactspiritPage(): React.ReactNode {
  const loadout = useLoadout();
  const { updateSaveData } = useBuilderActions();

  const handlePactspiritSelect = useCallback(
    (slotIndex: PactspiritSlotIndex, pactspiritName: string | undefined) => {
      const slotKey = `slot${slotIndex}` as keyof SaveDataPactspiritPage;
      updateSaveData((prev) => ({
        ...prev,
        pactspiritPage: {
          ...prev.pactspiritPage,
          [slotKey]: {
            ...createEmptyPactspiritSlot(),
            pactspiritName,
          },
        },
      }));
    },
    [updateSaveData],
  );

  const handleLevelChange = useCallback(
    (slotIndex: PactspiritSlotIndex, level: number) => {
      const slotKey = `slot${slotIndex}` as keyof SaveDataPactspiritPage;
      updateSaveData((prev) => ({
        ...prev,
        pactspiritPage: {
          ...prev.pactspiritPage,
          [slotKey]: {
            ...prev.pactspiritPage[slotKey],
            level,
          },
        },
      }));
    },
    [updateSaveData],
  );

  const handleInstallDestiny = useCallback(
    (
      slotIndex: PactspiritSlotIndex,
      ringSlot: RingSlotKey,
      destiny: InstalledDestinyResult,
    ) => {
      const slotKey = `slot${slotIndex}` as keyof SaveDataPactspiritPage;
      updateSaveData((prev) => ({
        ...prev,
        pactspiritPage: {
          ...prev.pactspiritPage,
          [slotKey]: {
            ...prev.pactspiritPage[slotKey],
            rings: {
              ...prev.pactspiritPage[slotKey].rings,
              [ringSlot]: {
                installedDestiny: destiny,
              },
            },
          },
        },
      }));
    },
    [updateSaveData],
  );

  const handleRevertRing = useCallback(
    (slotIndex: PactspiritSlotIndex, ringSlot: RingSlotKey) => {
      const slotKey = `slot${slotIndex}` as keyof SaveDataPactspiritPage;
      updateSaveData((prev) => ({
        ...prev,
        pactspiritPage: {
          ...prev.pactspiritPage,
          [slotKey]: {
            ...prev.pactspiritPage[slotKey],
            rings: {
              ...prev.pactspiritPage[slotKey].rings,
              [ringSlot]: {},
            },
          },
        },
      }));
    },
    [updateSaveData],
  );

  return (
    <PactspiritTab
      pactspiritPage={loadout.pactspiritPage}
      onPactspiritSelect={handlePactspiritSelect}
      onLevelChange={handleLevelChange}
      onInstallDestiny={handleInstallDestiny}
      onRevertRing={handleRevertRing}
    />
  );
}
