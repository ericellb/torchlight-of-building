import {
  Affix,
  Gear,
  GearPage,
  Loadout,
  RawGear,
  RawLoadout,
  RawTalentPage,
  RawTalentTree,
  TalentPage,
} from "./core";
import { parseMod } from "./mod_parser";
import { readFileSync } from "fs";
import { join } from "path";

// Map of tree names to their JSON filenames
const TREE_NAME_TO_FILE: Record<string, string> = {
  Alchemist: "alchemist_tree.json",
  Arcanist: "arcanist_tree.json",
  Artisan: "artisan_tree.json",
  Assassin: "assassin_tree.json",
  Bladerunner: "bladerunner_tree.json",
  Druid: "druid_tree.json",
  Elementalist: "elementalist_tree.json",
  God_of_Machines: "god_of_machines_tree.json",
  God_of_Might: "god_of_might_tree.json",
  God_of_War: "god_of_war_tree.json",
  Goddess_of_Deception: "goddess_of_deception_tree.json",
  Goddess_of_Hunting: "goddess_of_hunting_tree.json",
  Goddess_of_Knowledge: "goddess_of_knowledge_tree.json",
  Lich: "lich_tree.json",
  Machinist: "machinist_tree.json",
  Magister: "magister_tree.json",
  Marksman: "marksman_tree.json",
  Onslaughter: "onslaughter_tree.json",
  Prophet: "prophet_tree.json",
  Psychic: "psychic_tree.json",
  Ranger: "ranger_tree.json",
  Ronin: "ronin_tree.json",
  Sentinel: "sentinel_tree.json",
  Shadowdancer: "shadowdancer_tree.json",
  Shadowmaster: "shadowmaster_tree.json",
  Steel_Vanguard: "steel_vanguard_tree.json",
  The_Brave: "the_brave_tree.json",
  Warlock: "warlock_tree.json",
  Warlord: "warlord_tree.json",
  Warrior: "warrior_tree.json",
};

// TypeScript interface for the talent tree JSON structure
interface TalentTreeNode {
  nodeType: "micro" | "medium" | "legendary";
  rawAffix: string;
  position: {
    x: number;
    y: number;
  };
  prerequisite?: {
    x: number;
    y: number;
  };
  maxPoints: number;
}

interface TalentTreeData {
  name: string;
  nodes: TalentTreeNode[];
}

const parseAffixString = (affixString: string): Affix => {
  // Split by newline to handle multi-line affixes
  const lines = affixString.split("\n").map((line) => line.trim());

  // Parse each line as a separate mod
  const mods = lines
    .filter((line) => line.length > 0) // Skip empty lines
    .map((line) => parseMod(line))
    .filter((result) => typeof result !== "string"); // Filter out parse failures

  return {
    mods,
    raw: affixString,
  };
};

const parseGear = (rawGear: RawGear): Gear => {
  return {
    gearType: rawGear.gearType,
    affixes: rawGear.affixes.map(parseAffixString),
  };
};

const parseTalentTree = (rawTree: RawTalentTree): Affix[] => {
  // Check if tree name exists in our lookup map
  const treeFileName = TREE_NAME_TO_FILE[rawTree.name];
  if (!treeFileName) {
    throw new Error(`Unknown talent tree name: ${rawTree.name}`);
  }

  // Load the tree data from JSON file
  const treeFilePath = join(process.cwd(), "data", treeFileName);
  const treeData: TalentTreeData = JSON.parse(
    readFileSync(treeFilePath, "utf-8")
  );

  const affixes: Affix[] = [];

  // Parse each allocated node
  for (const allocatedNode of rawTree.allocatedNodes) {
    // Find the node at the specified coordinates
    const node = treeData.nodes.find(
      (n) =>
        n.position.x === allocatedNode.x && n.position.y === allocatedNode.y
    );

    if (!node) {
      throw new Error(
        `Node not found at (${allocatedNode.x}, ${allocatedNode.y}) in tree ${rawTree.name}`
      );
    }

    // Parse the node's affix string
    const baseAffix = parseAffixString(node.rawAffix);

    // Multiply mod values by the number of allocated points
    const scaledMods = baseAffix.mods.map((mod) => {
      // Handle different mod types that have scalable values
      if (mod.type === "CoreTalent") {
        // CoreTalent mods don't have numeric values to scale
        return mod;
      } else if (mod.type === "FlatGearDmg") {
        // FlatGearDmg has a DmgRange value
        return {
          ...mod,
          value: {
            min: mod.value.min * allocatedNode.points,
            max: mod.value.max * allocatedNode.points,
          },
        };
      } else {
        // All other mods have a numeric value property
        return {
          ...mod,
          value: mod.value * allocatedNode.points,
        };
      }
    });

    // Create the final affix with metadata
    const affix: Affix = {
      mods: scaledMods,
      raw: baseAffix.raw,
      src: `${rawTree.name} (${allocatedNode.x},${allocatedNode.y}) x${allocatedNode.points}`,
    };

    affixes.push(affix);
  }

  return affixes;
};

const parseTalentPage = (rawTalentPage: RawTalentPage): TalentPage => {
  // Parse all four talent trees and combine their affixes
  const allAffixes = [
    ...parseTalentTree(rawTalentPage.tree1),
    ...parseTalentTree(rawTalentPage.tree2),
    ...parseTalentTree(rawTalentPage.tree3),
    ...parseTalentTree(rawTalentPage.tree4),
  ];

  return {
    affixes: allAffixes,
  };
};

export const parse_loadout = (rawLoadout: RawLoadout): Loadout => {
  const gearPage: GearPage = {};

  // Parse each gear slot in the equipment page
  for (const [slot, rawGear] of Object.entries(rawLoadout.equipmentPage)) {
    if (rawGear) {
      gearPage[slot as keyof GearPage] = parseGear(rawGear);
    }
  }

  return {
    equipmentPage: gearPage,
    talentPage: parseTalentPage(rawLoadout.talentPage),
    divinityPage: { slates: [] },
    customConfiguration: [],
  };
};
