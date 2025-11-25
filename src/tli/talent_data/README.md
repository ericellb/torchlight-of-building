# Talent Tree Data

This directory contains TypeScript files for all profession and god/goddess talent trees.

## Structure

Each file exports a single `TalentTreeData` object representing a complete talent tree:

```typescript
export const WARRIOR: TalentTreeData = {
  name: "Warrior",
  nodes: [
    {
      nodeType: "micro",
      rawAffix: "+10% physical damage",
      position: { x: 0, y: 0 },
      maxPoints: 3,
      iconName: "physical_damage_icon"
    },
    // ... more nodes
  ]
} as const;
```

## Files

- **Profession Trees**: `warrior.ts`, `warlord.ts`, `marksman.ts`, etc.
- **God/Goddess Trees**: `god_of_war.ts`, `goddess_of_hunting.ts`, etc.
- **[index.ts](index.ts)**: Exports `TALENT_TREES` mapping and `getTalentTree()` helper

## Updating

To regenerate all talent tree files from tlidb.com:

```bash
tsx src/scripts/save_all_profession_trees.ts
```

This script:
1. Fetches talent tree data for all professions and god/goddess trees
2. Generates/updates TypeScript files in this directory
3. Each tree is exported as a const object with type `TalentTreeData`

## Usage

```typescript
import { loadTalentTree } from "@/src/tli/talent_tree";

// Load a talent tree (synchronous)
const warriorTree = loadTalentTree("Warrior");

// Access tree data
console.log(warriorTree.name); // "Warrior"
console.log(warriorTree.nodes.length); // Number of nodes
```

## Type Definitions

- `TalentTreeData` - [src/tli/core.ts](../core.ts)
- `TalentNodeData` - [src/tli/core.ts](../core.ts)
- `TreeName` - [src/tli/talent_tree_types.ts](../talent_tree_types.ts)

See [docs/data-models.md](../../../docs/data-models.md#talent-tree-data) for complete documentation.
