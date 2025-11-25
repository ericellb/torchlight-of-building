# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application built with React 19, TypeScript, and Tailwind CSS 4. It's a character build planner for "Torchlight Infinite" (TLI), a game with complex character builds involving equipment, talents, and divinity systems.

**Main Components:**
1. **Frontend UI** ([src/app/](src/app/)) - Interactive build planner interface
2. **Calculation Engine** ([src/tli/](src/tli/)) - Damage calculator that computes DPS and other offensive stats

## Documentation

- **[docs/development.md](docs/development.md)** - Development setup, commands, code conventions, and project structure
- **[docs/ui-patterns.md](docs/ui-patterns.md)** - Frontend UI patterns and React conventions
- **[docs/data-models.md](docs/data-models.md)** - Type definitions and data structures
- **[docs/calculation-engine.md](docs/calculation-engine.md)** - Damage calculation system and formulas
- **[docs/mod-parser.md](docs/mod-parser.md)** - Parser implementation and adding new mod types

## Quick Reference

| Task | Documentation |
|------|---------------|
| Setting up development | [docs/development.md](docs/development.md) |
| Working on UI ([src/app/](src/app/)) | [docs/ui-patterns.md](docs/ui-patterns.md), [docs/data-models.md](docs/data-models.md) |
| Working on calculations ([src/tli/stuff.ts](src/tli/stuff.ts)) | [docs/calculation-engine.md](docs/calculation-engine.md), [docs/data-models.md](docs/data-models.md) |
| Working on parsers ([src/tli/mod_parser.ts](src/tli/mod_parser.ts)) | [docs/mod-parser.md](docs/mod-parser.md) |
| Adding new mod types | [docs/mod-parser.md](docs/mod-parser.md), [docs/calculation-engine.md](docs/calculation-engine.md) |
| Updating talent trees | [docs/development.md#talent-tree-data-system](docs/development.md#talent-tree-data-system) |

## Documentation Guidelines

**Keep this file minimal.** When updating documentation:

- **This file (CLAUDE.md)** should only contain:
  - Brief project overview
  - Links to detailed documentation
  - Quick reference table

- **Detailed content belongs in [docs/](docs/)**:
  - Add new sections to appropriate existing doc files
  - Create new doc files for distinct topics
  - Update links in this file to point to the detailed docs

- **Follow the separation of concerns**:
  - [docs/development.md](docs/development.md) - Setup, commands, conventions, workflows
  - [docs/data-models.md](docs/data-models.md) - Type definitions and data structures
  - [docs/ui-patterns.md](docs/ui-patterns.md) - UI/React patterns and conventions
  - [docs/calculation-engine.md](docs/calculation-engine.md) - Calculation formulas and logic
  - [docs/mod-parser.md](docs/mod-parser.md) - Parser implementation and patterns
