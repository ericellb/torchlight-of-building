---
name: adding-support-skill-data
description: Use when adding level-based mod data for support skills in the torchlight-infinite-builder project - guides template creation, parser implementation, and verification workflow
---

# Adding Support Skill Data

## Overview

Add level-based mod data to support skills by creating a template (mod structure), parser (value extraction), and running generation.

## Quick Reference

| File | Purpose |
|------|---------|
| `.garbage/tlidb/skill/support/*.html` | Source HTML with progression tables |
| `src/tli/skills/support_templates.ts` | Mod templates (structure without values) |
| `src/scripts/skills/support_parsers.ts` | Parsers (extract values from HTML) |
| `src/scripts/skills/index.ts` | Parser registration |
| `src/data/skill/support.ts` | Generated output |
| `src/tli/mod.ts` | Mod type definitions |
| `src/tli/constants.ts` | Mod type constants (DmgModType, CritDmgModType, etc.) |

## Workflow

1. **Read HTML** - Check `.garbage/tlidb/skill/support/{Skill_Name}.html` for:
   - Skill description (first `div.explicitMod`)
   - Progression table (`table.DataTable`) with level values

2. **Identify mod type** - Check `src/tli/mod.ts` for matching mod. Common types:
   - `DmgPct` - damage percentage (requires `modType`, `addn`)
   - `CritDmgPct` - crit damage (requires `modType`, `addn`)
   - `CritRatingPct` - crit rating (requires `modType`, no `addn`)
   - `AspdPct`, `CspdPct`, `AspdAndCspdPct` - speed (requires `addn`)

3. **Add template** in `support_templates.ts`:
   ```typescript
   "Skill Name": {
     levelMods: [{ type: "ModType", /* required fields */ }],
   },
   ```

4. **Add parser** in `support_parsers.ts`:
   ```typescript
   export const skillNameParser: SupportLevelParser = (input) => {
     const { skillName, progressionTable } = input;
     const levels: Record<number, number> = {};
     for (const [levelStr, values] of Object.entries(progressionTable.values)) {
       const level = Number(levelStr);
       levels[level] = parseNumericValue(values[0], { asPercentage: true });
     }
     validateAllLevels(levels, skillName);
     return [levels]; // Array length must match template.levelMods.length
   };
   ```

5. **Register parser** in `index.ts`:
   ```typescript
   { skillName: "Skill Name", categories: ["support"], parser: skillNameParser },
   ```

6. **Generate & verify**:
   ```bash
   pnpm exec tsx src/scripts/generate_skill_data.ts
   pnpm test && pnpm check
   ```

## Value Sources

| Source | Parser Pattern | Example Skills |
|--------|---------------|----------------|
| Progression table column | `progressionTable.values[level][columnIndex]` | Critical Strike Damage Increase, Steamroll |
| Description text (static) | Regex on `description[0]`, use `createConstantLevels()` | Haunt (Shadow Quantity) |
| Description per level | `progressionTable.description[level]` with regex | Willpower (damage per stack) |

## Multi-Mod Skills

When a skill has multiple mods, template and parser must match in order:

```typescript
// Template
levelMods: [
  { type: "AspdPct", addn: false },           // index 0
  { type: "DmgPct", modType: "melee", addn: true },  // index 1
],

// Parser returns
return [aspdLevels, meleeDmgLevels];  // Same order!
```

## Edge Cases

- **Fraction notation**: Some HTML values use fractions like "31/2" (meaning 15.5). `parseNumericValue` handles this automatically.
- **Multiple columns**: If progression table has multiple value columns, access them as `values[0]`, `values[1]`, etc.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Wrong `addn` value | Check description: "additional" = `addn: true`, "increased" = `addn: false` |
| Missing `modType` | Most percentage mods need it - check mod definition in `mod.ts` |
| Parser array length mismatch | Return array must have same length as `template.levelMods` |
| Values not converted | Use `parseNumericValue(val, { asPercentage: true })` for percentages |
| Static value varies by level | Use `createConstantLevels(value)` for values that don't change |

## Verification Checklist

- [ ] Level 1 value matches HTML progression table
- [ ] Level 40 value matches HTML progression table
- [ ] Increment pattern is correct (e.g., +0.5% per level)
- [ ] All 40 levels present
- [ ] `pnpm test` passes
- [ ] `pnpm check` passes
