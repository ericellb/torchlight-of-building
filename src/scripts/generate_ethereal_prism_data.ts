import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawEtherealPrism {
  type: string;
  rarity: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface EtherealPrism {
  type: string;
  rarity: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawEtherealPrism[]): string => {
  return `import type { EtherealPrism } from "./types";

export const EtherealPrisms = ${JSON.stringify(items, null, 2)} as const satisfies readonly EtherealPrism[];

export type EtherealPrismEntry = (typeof EtherealPrisms)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./ethereal_prisms";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading ethereal_prism.json...");
  const jsonPath = join(process.cwd(), "src", "data", "ethereal_prism.json");
  const rawData: RawEtherealPrism[] = JSON.parse(
    await readFile(jsonPath, "utf-8"),
  );

  console.log(`Processing ${rawData.length} ethereal prisms...`);

  const outDir = join(process.cwd(), "src", "data", "ethereal_prism");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "ethereal_prisms.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated ethereal_prisms.ts (${rawData.length} items)`);

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

export { main as generateEtherealPrismData };
