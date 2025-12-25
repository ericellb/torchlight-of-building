# Documentation for generate_skill_data.ts

## Overview

`src/scripts/generate_skill_data.ts` is a code generation script that reads skill HTML files from the tlidb database and generates typed TypeScript files containing skill data for the application.

**Run command:** `pnpm exec tsx src/scripts/generate_skill_data.ts`

## Data Flow

```
.garbage/tlidb/skill/{category}/*.html
        ↓
   extractSkillFromTlidbHtml() - parses HTML with cheerio
        ↓
   RawSkill (intermediate format with parsedLevelModValues)
        ↓
   Skill-type-specific processing:
   - Active → classifyWithRegex() for kinds, factory for levelValues
   - Support → parseSupportTargets(), factory for levelValues
   - Magnificent/Noble → parseSkillSupportTarget() for specific skill name
   - Passive → mainStats extraction, factory for levelValues
        ↓
   src/data/skill/{type}.ts (generated TypeScript)
```

## Input Source

Reads HTML files from `.garbage/tlidb/skill/` organized by category:
- `active/` → Active skills
- `passive/` → Passive skills
- `support/` → Generic support skills
- `magnificent_support/` → Magnificent support skills (enhance specific skills)
- `noble_support/` → Noble support skills (enhance specific skills)
- `activation_medium/` → Activation medium skills

Each HTML file contains skill cards with season versions. The script prioritizes "SS10Season" (current season) data.

## Output Files

Generates TypeScript files in `src/data/skill/`:
- `active.ts` - `ActiveSkills` const array
- `passive.ts` - `PassiveSkills` const array
- `support.ts` - `SupportSkills` const array
- `support_magnificent.ts` - `MagnificentSupportSkills` const array
- `support_noble.ts` - `NobleSupportSkills` const array
- `activation_medium.ts` - `ActivationMediumSkills` const array

## Key Functions

### HTML Parsing

**`extractSkillFromTlidbHtml(file: TlidbSkillFile): RawSkill`**
- Loads HTML with cheerio
- Finds the current season card (SS10Season or first non-previousItem)
- Extracts: name, tags, description, mainStats
- If a parser is registered for this skill, also extracts `parsedLevelModValues` from progression table

### Tag Parsing

**`parseTagsFromString(tagString, skillName): SkillTag[]`**
- Handles compound tags with spaces (e.g., "Base Skill", "Spirit Magus")
- Maps edge cases like "Slash Strike" → "Slash-Strike"
- Validates all tags against `SKILL_TAGS` constant

### Support Target Parsing

**`parseSupportTargets(description, skillName): ParsedSupportTargets`**
- Parses first description line for support targeting rules
- Handles special patterns like:
  - "Supports DoT Skills and skills that can inflict Ailment"
  - "Supports Spell Skills that deal damage"
  - "Supports Attack and Spell Skills"
- Also parses "Cannot support" exclusion rules
- Returns `{ supportTargets, cannotSupportTargets }`

**`parseSkillSupportTarget(description): string`**
- For Magnificent/Noble supports, extracts the specific skill name from "Supports \<SkillName\>."

### Skill Kind Classification

Uses `classifyWithRegex()` from `skill_kind_patterns.ts` to infer what an active skill does:
- `deal_damage` - Skills that deal damage
- `dot` - Damage over time skills
- `hit_enemies` - Skills that hit enemies
- `inflict_ailment` - Skills that can apply ailments
- `summon_minions`, `summon_spirit_magus`, `summon_synthetic_troops`

### Level-Scaling Mod Parsing

For skills with registered parsers in `src/scripts/skills/index.ts`:
1. Looks up parser by skill name and category
2. Extracts progression table from HTML (levels 1-40)
3. Parser extracts numeric values per level, returning **named keys**
4. Values are converted to arrays and stored in `levelValues`

## Parser-Factory System

The system uses **parsers** and **factories** (not templates):

### Parsers (src/scripts/skills/)
Parsers extract values from HTML and return **named key-value objects**:
```typescript
export const frostSpikeParser: SupportLevelParser = (input) => {
  // Extract values...
  return {
    weaponAtkDmgPct,           // Record<number, number>
    addedDmgEffPct,            // Record<number, number>
    convertPhysicalToColdPct,  // from createConstantLevels()
    maxProjectile,
    // ...
  };
};
```

### Factories (src/tli/skills/)
Factories define how to build Mod objects from the parsed values:
```typescript
"Frost Spike": (l, vals) => ({
  offense: [
    { type: "WeaponAtkDmgPct", value: v(vals.weaponAtkDmgPct, l) },
    { type: "AddedDmgEffPct", value: v(vals.addedDmgEffPct, l) },
  ],
  mods: [
    { type: "ConvertDmgPct", value: v(vals.convertPhysicalToColdPct, l), from: "physical", to: "cold" },
    // ...
  ],
})
```

### Generated Output
The script generates `levelValues` as named objects:
```typescript
levelValues: {
  weaponAtkDmgPct: [1.49, 1.51, 1.54, ...],  // 40 values
  addedDmgEffPct: [1.49, 1.51, 1.54, ...],
  convertPhysicalToColdPct: [1, 1, 1, ...],
  // ...
}
```

## Adding New Skills with Level Scaling

1. **Add parser** in `src/scripts/skills/` that extracts values with named keys
2. **Register parser** in `src/scripts/skills/index.ts` with skill name and category
3. **Add factory** in appropriate factory file (`active_factories.ts`, `support_factories.ts`, `passive_factories.ts`)
4. **Re-run script** to regenerate data files

## Validation

The script validates:
- All tags are known (throws on unknown tags)
- All support skills have parseable support targets
- All 40 levels present in parsed data

## Test Skill

A `[Test] Simple Attack` skill is automatically added to active skills for testing purposes (see `createTestActiveSkill()`).
