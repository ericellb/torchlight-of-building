import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawPactspirit {
  type: string;
  rarity: string;
  name: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface Pactspirit {
  type: string;
  rarity: string;
  name: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawPactspirit[]): string => {
  return `import type { Pactspirit } from "./types";

export const Pactspirits = ${JSON.stringify(items, null, 2)} as const satisfies readonly Pactspirit[];

export type PactspiritEntry = (typeof Pactspirits)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./pactspirits";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading pactspirit.json...");
  const jsonPath = join(process.cwd(), "src", "data", "pactspirit.json");
  const rawData: RawPactspirit[] = JSON.parse(
    await readFile(jsonPath, "utf-8"),
  );

  console.log(`Processing ${rawData.length} pactspirits...`);

  const outDir = join(process.cwd(), "src", "data", "pactspirit");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "pactspirits.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated pactspirits.ts (${rawData.length} items)`);

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

export { main as generatePactspiritData };
