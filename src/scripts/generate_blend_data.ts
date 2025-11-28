import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawBlend {
  type: string;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface Blend {
  type: string;
  effect: string;
}
`;
};

const generateDataFile = (items: RawBlend[]): string => {
  return `import type { Blend } from "./types";

export const Blends = ${JSON.stringify(items, null, 2)} as const satisfies readonly Blend[];

export type BlendEntry = (typeof Blends)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./blends";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading blend.json...");
  const jsonPath = join(process.cwd(), "src", "data", "blend.json");
  const rawData: RawBlend[] = JSON.parse(await readFile(jsonPath, "utf-8"));

  console.log(`Processing ${rawData.length} blends...`);

  const outDir = join(process.cwd(), "src", "data", "blend");
  await mkdir(outDir, { recursive: true });

  const typesPath = join(outDir, "types.ts");
  await writeFile(typesPath, generateTypesFile(), "utf-8");
  console.log(`Generated types.ts`);

  const dataPath = join(outDir, "blends.ts");
  await writeFile(dataPath, generateDataFile(rawData), "utf-8");
  console.log(`Generated blends.ts (${rawData.length} items)`);

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

export { main as generateBlendData };
