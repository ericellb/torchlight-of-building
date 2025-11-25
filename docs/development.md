# Development Guide

This document covers development workflows, scripts, and common tasks.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Run a single test file
pnpm test src/tli/offense.test.ts
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **React**: Version 19.2 (client components with hooks)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS 4 (uses @tailwindcss/postcss plugin)
- **Testing**: Vitest
- **Utilities**:
  - `remeda`: Functional programming utilities (like lodash)
  - `ts-pattern`: Pattern matching for TypeScript

## TypeScript Configuration

- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Module resolution: bundler (required for Next.js 16)

## Code Conventions

### General Style

- **Use const arrow functions** instead of function declarations:

  ```typescript
  // ✓ Good
  const parseMod = (input: string): Mod | undefined => {
    // ...
  };

  // ✗ Avoid
  function parseMod(input: string): Mod | undefined {
    // ...
  }
  ```

- **Single source of truth for types**: Derive types from const arrays using `as const` and `(typeof ARRAY)[number]`:

  ```typescript
  // ✓ Good - only update the array to add new types
  export const DMG_MOD_TYPES = ["global", "fire", "cold", ...] as const;
  export type DmgModType = (typeof DMG_MOD_TYPES)[number];

  // ✗ Avoid - duplication requiring updates in multiple places
  export const DMG_MOD_TYPES = ["global", "fire", "cold", ...];
  export type DmgModType = "global" | "fire" | "cold" | ...;
  ```

### Data Persistence

- **No backwards compatibility required**: When adding new fields to `RawLoadout` or other localStorage-persisted types, backwards compatibility is NOT required
- Old saves can be cleared/invalidated when the schema changes
- Do not add migration logic in `loadFromStorage()` functions

## Talent Tree Data System

Talent tree data is stored as TypeScript files in [src/tli/talent_data/](../src/tli/talent_data/), providing type safety and bundling with the application.

### Key Files

- **[src/tli/talent_tree_types.ts](../src/tli/talent_tree_types.ts)** - Tree name constants and `TreeName` type
- **[src/tli/core.ts](../src/tli/core.ts)** - Core type definitions including `TalentTreeData` and `TalentNodeData`
- **[src/tli/talent_data/](../src/tli/talent_data/)** - Individual talent tree files (e.g., `warrior.ts`, `god_of_war.ts`)
- **[src/tli/talent_data/index.ts](../src/tli/talent_data/index.ts)** - Exports `TALENT_TREES` mapping and `getTalentTree()` helper
- **[src/tli/talent_tree.ts](../src/tli/talent_tree.ts)** - Utility functions for talent tree logic

### Updating Talent Trees

To scrape and update talent tree data from tlidb.com:

```bash
tsx src/scripts/save_all_profession_trees.ts
```

This script:

1. Fetches talent tree data for all professions and god/goddess trees from tlidb.com
2. Generates TypeScript files in [src/tli/talent_data/](../src/tli/talent_data/)
3. Each tree is exported as a const object with type `TalentTreeData`

### Scraping Scripts

- **[src/scripts/scrape_profession_tree.ts](../src/scripts/scrape_profession_tree.ts)** - Scrapes a single profession tree
- **[src/scripts/save_all_profession_trees.ts](../src/scripts/save_all_profession_trees.ts)** - Scrapes all profession and god/goddess trees
- **[src/scripts/extract_crafting_data.ts](../src/scripts/extract_crafting_data.ts)** - Extracts crafting affix data from HTML

For detailed information about talent tree data structures, see [data-models.md](data-models.md#talent-tree-data).

## Data Extraction Scripts

The project uses cheerio for HTML parsing and data extraction. All extraction scripts are located in [src/scripts/](../src/scripts/).

### Running Data Extraction Scripts

```bash
# Extract crafting affix data
npx tsx src/scripts/extract_crafting_data.ts

# Update talent tree data from tlidb.com
npx tsx src/scripts/save_all_profession_trees.ts
```

### Common Patterns for HTML Parsing

When creating new data extraction scripts, follow these patterns:

#### 1. Handle Malformed HTML

HTML fragments (like `<tbody>` outside of `<table>`) need to be fixed before parsing:

```typescript
// Fix malformed HTML structure
const fixedHtml = html
  .replace('<tbody>', '<table><tbody>')
  .replace('</tbody>', '</tbody></table>');

const $ = cheerio.load(fixedHtml, { xml: false });
```

#### 2. Process Value Ranges

Convert HTML spans with value ranges to backtick-wrapped strings:

```typescript
// Before: <span class="val">+(17–24)</span>
// After: `+(17-24)`

clone.find('span.val').each((_, elem) => {
  const text = $(elem).text().replace(/–/g, '-'); // en-dash to hyphen
  $(elem).replaceWith(`\`${text}\``);
});
```

#### 3. Remove Tooltips but Keep Content

Strip tooltip spans while preserving their text:

```typescript
clone.find('span.tooltip').each((_, elem) => {
  const text = $(elem).text();
  $(elem).replaceWith(text);
});
```

#### 4. Handle Line Breaks vs HTML Formatting

Use marker replacement to distinguish semantic line breaks (`<br>`) from HTML formatting newlines:

```typescript
// Replace <br> with a unique marker
let html = clone.html() || '';
html = html.replace(/<br\s*\/?>/gi, '<<BR>>');

// Normalize all whitespace (including HTML formatting)
const processed = cheerio.load(html);
let text = processed.text();
text = text.replace(/\s+/g, ' ').trim();

// Restore semantic line breaks
text = text.replace(/<<BR>>/g, '\n');
```

#### 5. Select Elements with Multiple Classes

For elements with varying class combinations (e.g., `"thing"` and `"thing contrast"`):

```typescript
// Use attribute contains selector
const rows = $('tr[class*="thing"]');
```

### Data Storage

- **JSON files**: Use `data/` directory for extracted JSON data (e.g., `data/crafting_data.json`)
- **TypeScript files**: Use `src/tli/talent_data/` for generated TypeScript data (talent trees)
- Create directories with `mkdir -p` before writing files

## Project Structure

```
src/
├── app/                    # Next.js app directory (UI)
│   ├── page.tsx           # Main build planner page
│   └── ...
├── tli/                   # Game logic and calculations
│   ├── core.ts           # Core type definitions
│   ├── mod.ts            # Modifier type definitions
│   ├── mod_parser.ts     # Parser for affix strings
│   ├── offense.ts        # Calculation engine
│   ├── talent_tree_types.ts  # Talent tree name constants
│   ├── talent_tree.ts    # Talent tree utilities
│   └── talent_data/      # Generated talent tree data
│       ├── index.ts      # Exports TALENT_TREES mapping
│       ├── warrior.ts    # Warrior profession tree
│       └── ...
├── scripts/              # Data extraction scripts
│   ├── scrape_profession_tree.ts
│   ├── save_all_profession_trees.ts
│   └── extract_crafting_data.ts
└── ...
data/                      # Extracted JSON data
├── crafting_data.json    # Crafting affix data
└── ...
.garbage/                 # Temporary working directory
├── crafting/             # HTML sources for crafting data
└── trees/                # HTML sources for talent trees
```

## Common Tasks

### Adding a New Mod Type

See [mod-parser.md](mod-parser.md) and [calculation-engine.md](calculation-engine.md).

### Working on UI Components

See [ui-patterns.md](ui-patterns.md).

### Understanding Data Models

See [data-models.md](data-models.md).
