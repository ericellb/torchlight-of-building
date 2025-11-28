import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawDestiny {
  type: string;
  name: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface Destiny {
  type: string;
  name: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawDestiny[]): string => {
  return `import type { Destiny } from "./types";

export const Destinies = ${JSON.stringify(items, null, 2)} as const satisfies readonly Destiny[];

export type DestinyEntry = (typeof Destinies)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./destinies";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading destiny.json...");
  const jsonPath = join(process.cwd(), "src", "data", "destiny.json");
  const rawData: RawDestiny[] = JSON.parse(await readFile(jsonPath, "utf-8"));

  console.log(`Processing ${rawData.length} destinies...`);

  const outDir = join(process.cwd(), "src", "data", "destiny");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "destinies.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated destinies.ts (${rawData.length} items)`);

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

export { main as generateDestinyData };
