import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawHeroMemory {
  type: string;
  item: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface HeroMemory {
  type: string;
  item: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawHeroMemory[]): string => {
  return `import type { HeroMemory } from "./types";

export const HeroMemories = ${JSON.stringify(items, null, 2)} as const satisfies readonly HeroMemory[];

export type HeroMemoryEntry = (typeof HeroMemories)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./hero_memories";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading hero_memory.json...");
  const jsonPath = join(process.cwd(), "src", "data", "hero_memory.json");
  const rawData: RawHeroMemory[] = JSON.parse(
    await readFile(jsonPath, "utf-8"),
  );

  console.log(`Processing ${rawData.length} hero memories...`);

  const outDir = join(process.cwd(), "src", "data", "hero_memory");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "hero_memories.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated hero_memories.ts (${rawData.length} items)`);

  const indexPath = join(outDir, "index.ts");
  await writeFile(indexPath, generateIndexFile(), "utf-8");
  console.log(`Generated index.ts`);

  console.log("\nCode generation complete!");
};

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export { main as generateHeroMemoryData };
