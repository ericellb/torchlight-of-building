import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import type { EtherealPrism } from "../data/ethereal_prism/types";

const cleanEffectText = (html: string): string => {
  // Replace <br> tags with placeholder to preserve intentional line breaks
  const BR_PLACEHOLDER = "\x00";
  let text = html.replace(/<br\s*\/?>/gi, BR_PLACEHOLDER);
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // Fix mojibake dash: UTF-8 en-dash bytes misinterpreted as Windows-1252
  text = text.replace(/\u00e2\u20ac\u201c/g, "-");
  // Decode common HTML entities
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Normalize all whitespace (including source newlines) to single spaces
  text = text.replace(/\s+/g, " ");
  // Restore intentional line breaks from <br> tags
  text = text.replace(new RegExp(BR_PLACEHOLDER, "g"), "\n");
  // Clean up: trim each line and remove empty lines
  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  return text.trim();
};

const extractEtherealPrismData = (html: string): EtherealPrism[] => {
  const $ = cheerio.load(html);
  const items: EtherealPrism[] = [];

  const rows = $('#etherealPrism tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} ethereal prism rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 3) {
      console.warn(`Skipping row with ${tds.length} columns (expected 3)`);
      return;
    }

    const item: EtherealPrism = {
      type: $(tds[0]).text().trim(),
      rarity: $(tds[1]).text().trim(),
      effect: cleanEffectText($(tds[2]).html() || ""),
    };

    items.push(item);
  });

  return items;
};

const generateDataFile = (items: EtherealPrism[]): string => {
  return `import type { EtherealPrism } from "./types";

export const EtherealPrisms = ${JSON.stringify(items, null, 2)} as const satisfies readonly EtherealPrism[];

export type EtherealPrismEntry = (typeof EtherealPrisms)[number];
`;
};

const main = async (): Promise<void> => {
  console.log("Reading HTML file...");
  const htmlPath = join(process.cwd(), ".garbage", "codex.html");
  const html = await readFile(htmlPath, "utf-8");

  console.log("Extracting ethereal prism data...");
  const items = extractEtherealPrismData(html);
  console.log(`Extracted ${items.length} ethereal prisms`);

  const outDir = join(process.cwd(), "src", "data", "ethereal_prism");
  await mkdir(outDir, { recursive: true });

  const dataPath = join(outDir, "ethereal_prisms.ts");
  await writeFile(dataPath, generateDataFile(items), "utf-8");
  console.log(`Generated ethereal_prisms.ts (${items.length} items)`);

  console.log("\nCode generation complete!");
  execSync("pnpm format", { stdio: "inherit" });
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
