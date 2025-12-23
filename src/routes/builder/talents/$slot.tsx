import {
  createFileRoute,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback } from "react";
import type { CraftedInverseImage, CraftedPrism } from "@/src/tli/core";
import {
  canPlaceInverseImage,
  canRemoveInverseImage,
  canRemovePrism,
  GOD_GODDESS_TREES,
  isGodGoddessTree,
  PROFESSION_TREES,
} from "@/src/tli/talent_tree";
import { CoreTalentSelector } from "../../../components/talents/CoreTalentSelector";
import { InverseImageSection } from "../../../components/talents/InverseImageSection";
import { PrismCoreTalentEffect } from "../../../components/talents/PrismCoreTalentEffect";
import { PrismSection } from "../../../components/talents/PrismSection";
import { TalentGrid } from "../../../components/talents/TalentGrid";
import { getPrismReplacedCoreTalent } from "../../../lib/prism-utils";
import { generateItemId } from "../../../lib/storage";
import {
  paramToTreeSlot,
  TALENT_SLOT_PARAMS,
  type TalentSlotParam,
  type TreeSlot,
  treeSlotToParam,
} from "../../../lib/types";
import {
  useBuilderActions,
  useLoadout,
  useTalentTree,
} from "../../../stores/builderStore";
import { useTalentsUIStore } from "../../../stores/talentsUIStore";

export const Route = createFileRoute("/builder/talents/$slot")({
  component: TalentsSlotPage,
  beforeLoad: ({ params, search }) => {
    if (
      !TALENT_SLOT_PARAMS.includes(
        params.slot as (typeof TALENT_SLOT_PARAMS)[number],
      )
    ) {
      throw redirect({
        to: "/builder/talents/$slot",
        params: { slot: "slot_1" },
        search,
      });
    }
  },
});

function TalentsSlotPage(): React.ReactNode {
  const { slot } = Route.useParams();
  const activeTreeSlot = paramToTreeSlot(slot as TalentSlotParam);

  // Router state for search params
  const routerState = useRouterState();
  const currentSearch = routerState.location.search as { id?: string };

  // Builder store - actions and loadout
  const loadout = useLoadout();
  const {
    updateSaveData,
    addPrismToInventory,
    deletePrism,
    addInverseImageToInventory,
    deleteInverseImage,
    placeInverseImage,
    removePlacedInverseImage,
    allocateReflectedNode,
    deallocateReflectedNode,
  } = useBuilderActions();

  // Talents UI store
  const selectedPrismId = useTalentsUIStore((state) => state.selectedPrismId);
  const setSelectedPrismId = useTalentsUIStore(
    (state) => state.setSelectedPrismId,
  );
  const selectedInverseImageId = useTalentsUIStore(
    (state) => state.selectedInverseImageId,
  );
  const setSelectedInverseImageId = useTalentsUIStore(
    (state) => state.setSelectedInverseImageId,
  );

  // Get the current talent tree from loadout
  const currentTalentTree = useTalentTree(activeTreeSlot);

  // Derived values from loadout
  const placedPrism = loadout.talentPage.talentTrees.placedPrism;
  const placedInverseImage = loadout.talentPage.talentTrees.placedInverseImage;
  const prismList = loadout.talentPage.inventory.prismList;
  const inverseImageList = loadout.talentPage.inventory.inverseImageList;

  const handleTreeChange = useCallback(
    (treeSlot: TreeSlot, newTreeName: string) => {
      const tree = loadout.talentPage.talentTrees[treeSlot];
      if (tree?.nodes.some((n) => n.points > 0)) return;

      if (newTreeName === "") {
        updateSaveData((prev) => {
          const newTalentPage = { ...prev.talentPage };
          delete newTalentPage[treeSlot];
          return { ...prev, talentPage: newTalentPage };
        });
        return;
      }

      if (treeSlot !== "tree1" && isGodGoddessTree(newTreeName)) return;
      if (treeSlot === "tree1" && !isGodGoddessTree(newTreeName)) return;

      updateSaveData((prev) => ({
        ...prev,
        talentPage: {
          ...prev.talentPage,
          [treeSlot]: { name: newTreeName, allocatedNodes: [] },
        },
      }));
    },
    [loadout.talentPage.talentTrees, updateSaveData],
  );

  const handleResetTree = useCallback(
    (treeSlot: TreeSlot) => {
      const tree = loadout.talentPage.talentTrees[treeSlot];
      if (!tree || !tree.nodes.some((n) => n.points > 0)) return;
      if (confirm("Reset all points in this tree? This cannot be undone.")) {
        updateSaveData((prev) => {
          const updatedTalentPage = {
            ...prev.talentPage,
            // biome-ignore lint/style/noNonNullAssertion: slot existence checked above
            [treeSlot]: { ...prev.talentPage[treeSlot]!, allocatedNodes: [] },
          };

          // Also clear reflected nodes if inverse image is placed on this tree
          if (prev.talentPage.placedInverseImage?.treeSlot === treeSlot) {
            updatedTalentPage.placedInverseImage = {
              ...prev.talentPage.placedInverseImage,
              reflectedAllocatedNodes: [],
            };
          }

          return { ...prev, talentPage: updatedTalentPage };
        });
      }
    },
    [loadout.talentPage.talentTrees, updateSaveData],
  );

  const handleAllocate = useCallback(
    (treeSlot: TreeSlot, x: number, y: number) => {
      updateSaveData((prev) => {
        const tree = prev.talentPage[treeSlot];
        if (!tree) return prev;
        const existing = tree.allocatedNodes.find(
          (n) => n.x === x && n.y === y,
        );

        // Find node max points from the current talent tree
        const talentTree = currentTalentTree;
        const nodeData = talentTree?.nodes.find(
          (n) => n.x === x && n.y === y && !n.isReflected,
        );
        if (!nodeData) return prev;

        if (existing) {
          if (existing.points >= nodeData.maxPoints) return prev;
          return {
            ...prev,
            talentPage: {
              ...prev.talentPage,
              [treeSlot]: {
                ...tree,
                allocatedNodes: tree.allocatedNodes.map((n) =>
                  n.x === x && n.y === y ? { ...n, points: n.points + 1 } : n,
                ),
              },
            },
          };
        }
        return {
          ...prev,
          talentPage: {
            ...prev.talentPage,
            [treeSlot]: {
              ...tree,
              allocatedNodes: [...tree.allocatedNodes, { x, y, points: 1 }],
            },
          },
        };
      });
    },
    [currentTalentTree, updateSaveData],
  );

  const handleDeallocate = useCallback(
    (treeSlot: TreeSlot, x: number, y: number) => {
      updateSaveData((prev) => {
        const tree = prev.talentPage[treeSlot];
        if (!tree) return prev;
        const existing = tree.allocatedNodes.find(
          (n) => n.x === x && n.y === y,
        );
        if (!existing) return prev;

        if (existing.points > 1) {
          return {
            ...prev,
            talentPage: {
              ...prev.talentPage,
              [treeSlot]: {
                ...tree,
                allocatedNodes: tree.allocatedNodes.map((n) =>
                  n.x === x && n.y === y ? { ...n, points: n.points - 1 } : n,
                ),
              },
            },
          };
        }
        return {
          ...prev,
          talentPage: {
            ...prev.talentPage,
            [treeSlot]: {
              ...tree,
              allocatedNodes: tree.allocatedNodes.filter(
                (n) => !(n.x === x && n.y === y),
              ),
            },
          },
        };
      });
    },
    [updateSaveData],
  );

  const handleSelectCoreTalent = useCallback(
    (treeSlot: TreeSlot, slotIndex: number, talentName: string | undefined) => {
      updateSaveData((prev) => {
        const tree = prev.talentPage[treeSlot];
        if (!tree) return prev;

        const newSelected = [...(tree.selectedCoreTalents ?? [])];
        if (talentName) {
          newSelected[slotIndex] = talentName;
        } else {
          newSelected.splice(slotIndex, 1);
        }

        return {
          ...prev,
          talentPage: {
            ...prev.talentPage,
            [treeSlot]: {
              ...tree,
              selectedCoreTalents: newSelected.filter(Boolean),
            },
          },
        };
      });
    },
    [updateSaveData],
  );

  const handleSavePrism = useCallback(
    (prism: CraftedPrism) => {
      addPrismToInventory(prism);
    },
    [addPrismToInventory],
  );

  const handleUpdatePrism = useCallback(
    (prism: CraftedPrism) => {
      updateSaveData((prev) => ({
        ...prev,
        prismList: prev.prismList.map((p) => (p.id === prism.id ? prism : p)),
      }));
    },
    [updateSaveData],
  );

  const handleCopyPrism = useCallback(
    (prism: CraftedPrism) => {
      const newPrism = { ...prism, id: generateItemId() };
      addPrismToInventory(newPrism);
    },
    [addPrismToInventory],
  );

  const handleDeletePrism = useCallback(
    (prismId: string) => {
      deletePrism(prismId);
      if (selectedPrismId === prismId) {
        setSelectedPrismId(undefined);
      }
    },
    [deletePrism, selectedPrismId, setSelectedPrismId],
  );

  const handlePlacePrism = useCallback(
    (treeSlot: TreeSlot, x: number, y: number) => {
      if (!selectedPrismId) return;

      // Only allow prisms on profession trees (slots 2-4), not god/goddess tree (slot 1)
      if (treeSlot === "tree1") return;

      const prism = prismList.find((p) => p.id === selectedPrismId);
      if (!prism) return;

      // Only allow one prism at a time
      if (placedPrism) return;

      // Verify node has 0 points allocated
      const tree = loadout.talentPage.talentTrees[treeSlot];
      if (!tree) return;
      const node = tree.nodes.find((n) => n.x === x && n.y === y);
      if (node && node.points > 0) return;

      // Check if this prism replaces core talents
      const replacesCoreTalent = getPrismReplacedCoreTalent(prism);

      updateSaveData((prev) => {
        const updatedTree = prev.talentPage[treeSlot];

        return {
          ...prev,
          // Remove prism from inventory
          prismList: prev.prismList.filter((p) => p.id !== selectedPrismId),
          // Place prism in talent page
          talentPage: {
            ...prev.talentPage,
            placedPrism: {
              prism,
              treeSlot,
              position: { x, y },
            },
            // Clear core talents if prism replaces them
            ...(replacesCoreTalent && updatedTree
              ? {
                  [treeSlot]: {
                    ...updatedTree,
                    selectedCoreTalents: [],
                  },
                }
              : {}),
          },
        };
      });

      // Clear selection after placing
      setSelectedPrismId(undefined);
    },
    [
      selectedPrismId,
      prismList,
      placedPrism,
      loadout.talentPage.talentTrees,
      updateSaveData,
      setSelectedPrismId,
    ],
  );

  const handleRemovePrism = useCallback(() => {
    if (!placedPrism || !currentTalentTree) return;

    if (!canRemovePrism(placedPrism, currentTalentTree.nodes)) {
      return;
    }

    updateSaveData((prev) => ({
      ...prev,
      // Return prism to inventory
      prismList: [...prev.prismList, placedPrism.prism],
      // Clear placement
      talentPage: {
        ...prev.talentPage,
        placedPrism: undefined,
      },
    }));
  }, [placedPrism, currentTalentTree, updateSaveData]);

  const handleSaveInverseImage = useCallback(
    (inverseImage: CraftedInverseImage) => {
      addInverseImageToInventory(inverseImage);
    },
    [addInverseImageToInventory],
  );

  const handleUpdateInverseImage = useCallback(
    (inverseImage: CraftedInverseImage) => {
      updateSaveData((prev) => ({
        ...prev,
        inverseImageList: prev.inverseImageList.map((ii) =>
          ii.id === inverseImage.id ? inverseImage : ii,
        ),
      }));
    },
    [updateSaveData],
  );

  const handleCopyInverseImage = useCallback(
    (inverseImage: CraftedInverseImage) => {
      const newInverseImage = { ...inverseImage, id: generateItemId() };
      addInverseImageToInventory(newInverseImage);
    },
    [addInverseImageToInventory],
  );

  const handleDeleteInverseImage = useCallback(
    (inverseImageId: string) => {
      deleteInverseImage(inverseImageId);
      if (selectedInverseImageId === inverseImageId) {
        setSelectedInverseImageId(undefined);
      }
    },
    [deleteInverseImage, selectedInverseImageId, setSelectedInverseImageId],
  );

  const handlePlaceInverseImage = useCallback(
    (treeSlot: TreeSlot, x: number, y: number) => {
      if (!selectedInverseImageId || !currentTalentTree) return;

      // Only allow inverse images on profession trees (slots 2-4)
      if (treeSlot === "tree1") return;

      const inverseImage = inverseImageList.find(
        (ii) => ii.id === selectedInverseImageId,
      );
      if (!inverseImage) return;

      const result = canPlaceInverseImage(
        x,
        treeSlot as "tree2" | "tree3" | "tree4",
        currentTalentTree.nodes,
        placedPrism,
        placedInverseImage,
      );

      if (!result.canPlace) {
        return;
      }

      placeInverseImage(inverseImage, treeSlot as "tree2" | "tree3" | "tree4", {
        x,
        y,
      });

      setSelectedInverseImageId(undefined);
    },
    [
      selectedInverseImageId,
      currentTalentTree,
      inverseImageList,
      placedPrism,
      placedInverseImage,
      placeInverseImage,
      setSelectedInverseImageId,
    ],
  );

  const handleRemoveInverseImage = useCallback(() => {
    if (!currentTalentTree || !placedInverseImage) return;

    if (!canRemoveInverseImage(currentTalentTree.nodes)) {
      return;
    }

    removePlacedInverseImage();
  }, [currentTalentTree, placedInverseImage, removePlacedInverseImage]);

  const currentTreeTotalPoints = currentTalentTree
    ? currentTalentTree.nodes.reduce((sum, node) => sum + node.points, 0)
    : 0;

  return (
    <>
      <div>
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-zinc-50">
            Tree Slots
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {(["tree1", "tree2", "tree3", "tree4"] as const).map((treeSlot) => {
              const tree = loadout.talentPage.talentTrees[treeSlot];
              const totalPoints = tree
                ? tree.nodes.reduce((sum, node) => sum + node.points, 0)
                : 0;

              return (
                <Link
                  key={treeSlot}
                  to="/builder/talents/$slot"
                  params={{ slot: treeSlotToParam(treeSlot) }}
                  search={{ id: currentSearch.id }}
                  className={`rounded-lg border px-4 py-3 font-medium transition-colors ${
                    activeTreeSlot === treeSlot
                      ? "border-amber-500 bg-amber-500 text-zinc-950"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <div className="font-semibold">
                    {treeSlot === "tree1"
                      ? "Slot 1 (God/Goddess)"
                      : `Slot ${treeSlot.slice(-1)}`}
                  </div>
                  <div className="mt-1 truncate text-sm">
                    {tree ? tree.name.replace(/_/g, " ") : "None"}
                  </div>
                  <div className="mt-1 text-xs">{totalPoints} points</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <label
            htmlFor="tree-select"
            className="mb-2 block text-sm font-medium text-zinc-400"
          >
            Select Tree for{" "}
            {activeTreeSlot === "tree1"
              ? "Slot 1"
              : `Slot ${activeTreeSlot.slice(-1)}`}
          </label>
          <div className="flex gap-2">
            <select
              id="tree-select"
              value={currentTalentTree?.name ?? ""}
              onChange={(e) => handleTreeChange(activeTreeSlot, e.target.value)}
              disabled={
                currentTalentTree?.nodes.some((n) => n.points > 0) ?? false
              }
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None</option>
              {activeTreeSlot === "tree1" ? (
                <optgroup label="God/Goddess Trees">
                  {GOD_GODDESS_TREES.map((tree) => (
                    <option key={tree} value={tree}>
                      {tree.replace(/_/g, " ")}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <optgroup label="Profession Trees">
                  {PROFESSION_TREES.map((tree) => (
                    <option key={tree} value={tree}>
                      {tree.replace(/_/g, " ")}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              type="button"
              onClick={() => handleResetTree(activeTreeSlot)}
              disabled={currentTreeTotalPoints === 0}
              className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              Reset
            </button>
          </div>
        </div>

        {currentTalentTree && (
          <CoreTalentSelector
            treeName={currentTalentTree.name}
            treeSlot={activeTreeSlot}
            pointsSpent={currentTreeTotalPoints}
            selectedCoreTalents={
              currentTalentTree.selectedCoreTalentNames ?? []
            }
            onSelectCoreTalent={(slotIndex, name) =>
              handleSelectCoreTalent(activeTreeSlot, slotIndex, name)
            }
            replacedByPrism={
              placedPrism?.treeSlot === activeTreeSlot
                ? getPrismReplacedCoreTalent(placedPrism.prism)
                : undefined
            }
          />
        )}

        <PrismCoreTalentEffect
          placedPrism={placedPrism}
          activeTreeSlot={activeTreeSlot}
        />

        {!currentTalentTree ? (
          <div className="py-12 text-center text-zinc-500">
            Select a tree to view
          </div>
        ) : currentTalentTree ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-zinc-50">
              {currentTalentTree.name.replace(/_/g, " ")} Tree
            </h2>

            <div className="mb-2 grid grid-cols-7 gap-2">
              {[0, 3, 6, 9, 12, 15, 18].map((points) => (
                <div
                  key={points}
                  className="text-center text-sm font-medium text-zinc-500"
                >
                  {points} pts
                </div>
              ))}
            </div>

            <TalentGrid
              nodes={currentTalentTree.nodes}
              onAllocate={(x, y) => handleAllocate(activeTreeSlot, x, y)}
              onDeallocate={(x, y) => handleDeallocate(activeTreeSlot, x, y)}
              treeSlot={activeTreeSlot}
              placedPrism={placedPrism}
              selectedPrism={
                // Prisms can only be placed on profession trees (slots 2-4)
                activeTreeSlot !== "tree1"
                  ? prismList.find((p) => p.id === selectedPrismId)
                  : undefined
              }
              onPlacePrism={(x, y) => handlePlacePrism(activeTreeSlot, x, y)}
              onRemovePrism={handleRemovePrism}
              placedInverseImage={placedInverseImage}
              selectedInverseImage={
                // Inverse images can only be placed on profession trees (slots 2-4)
                activeTreeSlot !== "tree1"
                  ? inverseImageList.find(
                      (ii) => ii.id === selectedInverseImageId,
                    )
                  : undefined
              }
              onPlaceInverseImage={(x, y) =>
                handlePlaceInverseImage(activeTreeSlot, x, y)
              }
              onRemoveInverseImage={handleRemoveInverseImage}
              onAllocateReflected={allocateReflectedNode}
              onDeallocateReflected={deallocateReflectedNode}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">Loading tree...</div>
        )}
      </div>

      <PrismSection
        prisms={prismList}
        onSave={handleSavePrism}
        onUpdate={handleUpdatePrism}
        onCopy={handleCopyPrism}
        onDelete={handleDeletePrism}
        selectedPrismId={selectedPrismId}
        onSelectPrism={setSelectedPrismId}
        hasPrismPlaced={!!placedPrism}
        isOnGodGoddessTree={activeTreeSlot === "tree1"}
      />

      <InverseImageSection
        inverseImages={inverseImageList}
        onSave={handleSaveInverseImage}
        onUpdate={handleUpdateInverseImage}
        onCopy={handleCopyInverseImage}
        onDelete={handleDeleteInverseImage}
        selectedInverseImageId={selectedInverseImageId}
        onSelectInverseImage={setSelectedInverseImageId}
        hasInverseImagePlaced={!!placedInverseImage}
        hasPrismPlaced={!!placedPrism}
        isOnGodGoddessTree={activeTreeSlot === "tree1"}
        treeHasPoints={currentTreeTotalPoints > 0}
      />
    </>
  );
}
