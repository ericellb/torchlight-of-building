import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawTalentCodex {
  god: string;
  tree: string;
  type: string;
  name: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface TalentCodex {
  god: string;
  tree: string;
  type: string;
  name: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawTalentCodex[]): string => {
  return `import type { TalentCodex } from "./types";

export const TalentCodexEntries = ${JSON.stringify(items, null, 2)} as const satisfies readonly TalentCodex[];

export type TalentCodexEntry = (typeof TalentCodexEntries)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./talent_codex_entries";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading talent_codex.json...");
  const jsonPath = join(process.cwd(), "src", "data", "talent_codex.json");
  const rawData: RawTalentCodex[] = JSON.parse(
    await readFile(jsonPath, "utf-8"),
  );

  console.log(`Processing ${rawData.length} talents...`);

  const outDir = join(process.cwd(), "src", "data", "talent_codex");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "talent_codex_entries.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated talent_codex_entries.ts (${rawData.length} items)`);

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

export { main as generateTalentCodexData };
