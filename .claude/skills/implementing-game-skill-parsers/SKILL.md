---
name: implementing-game-skill-parsers
description: Use when implementing skill data generation from HTML sources for game build planners - guides the parser-factory-generation pattern for extracting level-scaling values and tier/rank-scaling values for magnificent supports (project)
---

# Implementing Game Skill Parsers

## Overview

Skill data generation follows a **parser-factory-generation** pattern:
1. **Parser** extracts numeric values from HTML/data sources with **named keys**
2. **Factory** defines how to build Mod objects using those named values
3. **Generation script** combines parsed values into `levelValues` output

**Critical:** Parser keys MUST match factory key usage exactly.

## When to Use

- Adding new skills with level-scaling properties
- Extracting values from game data HTML pages

## Project File Locations

| Purpose | File Path |
|---------|-----------|
| Active factories | `src/tli/skills/active_factories.ts` |
| Support factories | `src/tli/skills/support_factories.ts` |
| Passive factories | `src/tli/skills/passive_factories.ts` |
| Factory types & helpers | `src/tli/skills/types.ts` |
| Active parsers | `src/scripts/skills/active_parsers.ts` |
| Support parsers | `src/scripts/skills/support_parsers.ts` |
| Passive parsers | `src/scripts/skills/passive_parsers.ts` |
| Parser registry | `src/scripts/skills/index.ts` |
| Generation script | `src/scripts/generate_skill_data.ts` |
| HTML data sources | `.garbage/tlidb/skill/{category}/{Skill_Name}.html` |

**Categories:** `active`, `support`, `passive`, `activation_medium`, `support_magnificent`, `support_noble`

## Implementation Checklist

### 1. Identify Data Source
- HTML file at `.garbage/tlidb/skill/{category}/{Skill_Name}.html`
- Find Progression /40 table - columns are: level, col0, col1, col2 (Descript)
- **Column indexing:** `values[0]` = first column after level, `values[2]` = Descript
- Input is clean text (HTML already stripped by `buildProgressionTableInput`)

### 2. Define Factory (structure + key names)
```typescript
// In active_factories.ts, support_factories.ts, or passive_factories.ts
import { v } from "./types";

"Ice Bond": (l, vals) => ({
  buffMods: [
    {
      type: "DmgPct",
      value: v(vals.coldDmgPctVsFrostbitten, l),  // Define key name here
      addn: true,
      modType: "cold",
      cond: "enemy_frostbitten",
    },
  ],
}),
```

**Factory return types:**
- **Active skills:** `{ offense?: SkillOffense[], mods?: Mod[], buffMods?: Mod[] }`
- **Support skills:** `Mod[]`
- **Passive skills:** `{ mods?: Mod[], buffMods?: Mod[] }`

The `v(arr, level)` helper safely accesses `arr[level - 1]` with bounds checking.

**Key naming conventions:**
- Use descriptive camelCase names
- Include context: `dmgPctPerProjectile` not just `dmgPct`

### 3. Create Parser (extract values for those keys)
```typescript
// In active_parsers.ts, support_parsers.ts, or passive_parsers.ts
import { findColumn, validateAllLevels } from "./progression_table";
import { template } from "./template-compiler";
import type { SupportLevelParser } from "./types";
import { createConstantLevels } from "./utils";

export const iceBondParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  // Find column by header (uses substring matching)
  const descriptCol = findColumn(progressionTable, "descript", skillName);
  const coldDmgPctVsFrostbitten: Record<number, number> = {};

  // Iterate over column rows (level → text)
  for (const [levelStr, text] of Object.entries(descriptCol.rows)) {
    const level = Number(levelStr);
    // Use template() for pattern matching - cleaner than regex
    const match = template("{value:dec%} additional cold damage").match(
      text,
      skillName,
    );
    coldDmgPctVsFrostbitten[level] = match.value;
  }

  validateAllLevels(coldDmgPctVsFrostbitten, skillName);

  // Return named keys matching factory expectations
  return { coldDmgPctVsFrostbitten };
};
```

**Template syntax for value extraction:**
- `{name:int}` - Integer (e.g., "5" → 5)
- `{name:dec}` - Decimal (e.g., "21.5" → 21.5)
- `{name:dec%}` - Percentage as decimal (e.g., "96%" → 96, NOT 0.96)
- `{name:int%}` - Percentage as integer (e.g., "-30%" → -30)

For constant values (same across all levels): use `createConstantLevels(value)`

### 4. Register Parser
```typescript
// In index.ts
{ skillName: "Ice Bond", categories: ["active"], parser: iceBondParser }
```

### 5. Regenerate & Verify
```bash
pnpm exec tsx src/scripts/generate_skill_data.ts
pnpm test
```

Check generated output for levels 1, 20, 40 against source HTML.

## Example: Complex Skill (Frost Spike)

**Parser** extracts multiple named values:
```typescript
export const frostSpikeParser: SupportLevelParser = (input) => {
  const weaponAtkDmgPct: Record<number, number> = {};
  const addedDmgEffPct: Record<number, number> = {};
  // ... extract from columns ...

  return {
    weaponAtkDmgPct,
    addedDmgEffPct,
    convertPhysicalToColdPct: createConstantLevels(convertValue),
    maxProjectile: createConstantLevels(maxProjValue),
    projectilePerFrostbiteRating: createConstantLevels(projPerRating),
    baseProjectile: createConstantLevels(baseProj),
    dmgPctPerProjectile: createConstantLevels(dmgPerProj),
  };
};
```

**Factory** uses those keys:
```typescript
"Frost Spike": (l, vals) => ({
  offense: [
    { type: "WeaponAtkDmgPct", value: v(vals.weaponAtkDmgPct, l) },
    { type: "AddedDmgEffPct", value: v(vals.addedDmgEffPct, l) },
  ],
  mods: [
    { type: "ConvertDmgPct", value: v(vals.convertPhysicalToColdPct, l), from: "physical", to: "cold" },
    { type: "MaxProjectile", value: v(vals.maxProjectile, l), override: true },
    { type: "Projectile", value: v(vals.projectilePerFrostbiteRating, l), per: { stackable: "frostbite_rating", amt: 35 } },
    { type: "Projectile", value: v(vals.baseProjectile, l) },
    { type: "DmgPct", value: v(vals.dmgPctPerProjectile, l), modType: "global", addn: true, per: { stackable: "projectile" } },
  ],
}),
```

**Generated output:**
```typescript
levelValues: {
  weaponAtkDmgPct: [1.49, 1.51, 1.54, ...],
  addedDmgEffPct: [1.49, 1.51, 1.54, ...],
  convertPhysicalToColdPct: [1, 1, 1, ...],
  maxProjectile: [5, 5, 5, ...],
  projectilePerFrostbiteRating: [1, 1, 1, ...],
  baseProjectile: [2, 2, 2, ...],
  dmgPctPerProjectile: [0.08, 0.08, 0.08, ...],
}
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using HTML regex on clean text | Input is already `.text().trim()` - no HTML tags |
| Parser key doesn't match factory key | Keys must match exactly: `vals.dmgPct` needs parser to return `{ dmgPct: ... }` |
| Forgetting parser registration | Add to SKILL_PARSERS array in `index.ts` |
| Missing factory | Must add factory in `*_factories.ts` for mods to be applied at runtime |
| `findColumn` substring collision | "damage" matches "Effectiveness of added damage" first - use exact matching (see below) |
| Missing levels 21-40 | Many skills only have data for levels 1-20; fill 21-40 with level 20 values |

## findColumn Gotcha: Substring Matching

`findColumn` uses template substring matching. If column headers share substrings, you may get the wrong column:

```typescript
// PROBLEM: "damage" is a substring of "Effectiveness of added damage"
// This returns the WRONG column!
const damageCol = findColumn(progressionTable, "damage", skillName);

// SOLUTION: Use exact header matching when there's a collision
const damageCol = progressionTable.find(
  (col) => col.header.toLowerCase() === "damage",
);
if (!damageCol) {
  throw new Error(`${skillName}: no "damage" column found`);
}
```

## Handling Levels 21-40 with Empty Data

Many skills only have progression data for levels 1-20. Fill levels 21-40 with level 20 values:

```typescript
// Extract levels 1-20
for (const [levelStr, text] of Object.entries(someCol.rows)) {
  const level = Number(levelStr);
  if (level <= 20 && text !== "") {
    values[level] = parseValue(text);
  }
}

// Fill levels 21-40 with level 20 value
const level20Value = values[20];
if (level20Value === undefined) {
  throw new Error(`${skillName}: level 20 value missing`);
}
for (let level = 21; level <= 40; level++) {
  values[level] = level20Value;
}
```

## Data Flow

```
HTML Source → buildProgressionTableInput (strips HTML)
           → Parser (extracts values with named keys)
           → Generation Script (converts to levelValues arrays)
           → Output TypeScript file
           ↓
Runtime: Factory + levelValues → Mod objects
```

## Benefits of Named Keys

1. **Self-documenting:** `vals.projectilePerFrostbiteRating` is clearer than `vals[4]`
2. **Order-independent:** Parser and factory don't need to agree on array order
3. **Extensible:** Adding new values doesn't shift existing indices
4. **Type-safe:** TypeScript can catch typos in key names

---

## Magnificent Support Skills

Magnificent support skills use **tier/rank/value** scaling instead of level scaling.

### Scaling Dimensions

| Dimension | Range | Description |
|-----------|-------|-------------|
| **Tier** | 0-2 | Lower is better (tier 0 = best values) |
| **Rank** | 1-5 | Higher is better (rank 5 = max) |
| **Value** | varies | Specific value within tier's min-max range |

### Affix Types

- **Tier-scaled**: Value ranges per tier from progression table (e.g., tier 0: 19-23%, tier 1: 16-18%). Passed as `value` parameter to factory.
- **Rank-scaled**: 5-element arrays indexed by rank (e.g., `[0, 5, 10, 15, 20]` for ranks 1-5). The `rankDmgPct` mod is auto-included by `getMagnificentSupportSkillMods`.
- **Constant**: Same value across all tiers/ranks (e.g., +25% Projectile Size). Passed as direct numbers in factory `vals`.

### File Locations

| Purpose | File Path |
|---------|-----------|
| Magnificent factories | `src/tli/skills/magnificent_support_factories.ts` |
| Magnificent mods | `src/tli/skills/magnificent_support_mods.ts` |
| Magnificent parsers | `src/scripts/skills/magnificent_support_parsers.ts` |
| Parser registry | `src/scripts/skills/index.ts` (MAGNIFICENT_SUPPORT_PARSERS) |
| HTML data sources | `.garbage/tlidb/skill/support_magnificent/{Skill_Name}.html` |

### Parser Structure

Parsers return `ParsedMagnificentValues`:

```typescript
export const burningCombustionParser: MagnificentLevelParser = (input) => {
  const { skillName, description, progressionTable } = input;

  // Parse tier ranges from progression table (3 rows, not 40)
  const dmgCol = progressionTable.find((col) => col.header.toLowerCase() === "name");
  const tierDmgPct: Record<number, TierRange> = {};
  for (const [tierStr, text] of Object.entries(dmgCol.rows)) {
    tierDmgPct[Number(tierStr)] = parseTierRange(text, skillName);
  }
  validateAllTiers(tierDmgPct, skillName);

  // Parse rank values from description (max value, then compute steps)
  const rankDmgMatch = template("+{value:int}% additional damage...").tryMatch(desc);
  const maxRankValue = rankDmgMatch.value; // e.g., 20
  const rankValues = { rankDmgPct: [0, 5, 10, 15, 20] }; // step = max/4

  // Parse constants from description
  const projMatch = template("+{value:int}% Projectile Size...").tryMatch(desc);
  const constantValues = { projectileSizePct: projMatch.value };

  return { tierValues, rankValues, constantValues };
};
```

### Factory Structure

Factory receives `(tier, value, vals)` where `vals` contains constants as direct numbers.
The rank-based damage mod (`rankDmgPct`) is **auto-included** by `getMagnificentSupportSkillMods`.

```typescript
"Burning Shot: Combustion (Magnificent)": (_tier, value, vals): Mod[] => [
  // Tier-scaled: use value parameter directly
  { type: "DmgPct", value, dmgModType: "global", addn: true },
  // rankDmgPct mod is auto-included by getMagnificentSupportSkillMods
  // Constants: access directly from vals
  { type: "ProjectileSizePct", value: vals.projectileSizePct },
  { type: "IgniteDurationPct", value: vals.igniteDurationPct },
  { type: "SkillEffDurationPct", value: vals.durationPct },
],
```

### Runtime Function

```typescript
getMagnificentSupportSkillMods(
  "Burning Shot: Combustion (Magnificent)",
  0,    // tier (0 = best)
  5,    // rank (5 = max)
  23,   // value within tier 0's range (19-23)
)
// Returns: DmgPct 20% (rank), DmgPct 23% (tier), ProjectileSizePct 25%, etc.
```

### Registration

```typescript
// In index.ts
export const MAGNIFICENT_SUPPORT_PARSERS: MagnificentSkillParserEntry[] = [
  { skillName: "Burning Shot: Combustion (Magnificent)", parser: burningCombustionParser },
];
```

### Key Differences from Regular Skills

| Aspect | Regular Skills | Magnificent Skills |
|--------|---------------|-------------------|
| Scaling | Level 1-40 | Tier 0-2, Rank 1-5, Value |
| Progression table | 40 rows | 3 rows (tiers) |
| Values array | 40 elements | 5 elements (ranks) for `rankValues` |
| Constants | `createConstantLevels(x)` → 40 elements | Direct numbers in factory `vals` |
| Factory signature | `(level, vals)` | `(tier, value, vals)` |
| Factory vals type | `Record<string, readonly number[]>` | `Record<string, number>` (constants only) |
| Rank damage mod | N/A | Auto-included by `getMagnificentSupportSkillMods` |
