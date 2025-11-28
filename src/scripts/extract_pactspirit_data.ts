import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface Pactspirit {
  type: string;
  rarity: string;
  name: string;
  effect: string;
}

const cleanEffectText = (html: string): string => {
  let text = html.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  text = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");
  text = text
    .split("\n")
    .filter((line) => line.length > 0)
    .join("\n");
  return text.trim();
};

const extractPactspiritData = (html: string): Pactspirit[] => {
  const $ = cheerio.load(html);
  const items: Pactspirit[] = [];

  const rows = $('#pactspirit tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} pactspirit rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 4) {
      console.warn(`Skipping row with ${tds.length} columns (expected 4)`);
      return;
    }

    const item: Pactspirit = {
      type: $(tds[0]).text().trim(),
      rarity: $(tds[1]).text().trim(),
      name: $(tds[2]).text().trim(),
      effect: cleanEffectText($(tds[3]).html() || ""),
    };

    items.push(item);
  });

  return items;
};

const main = async () => {
  try {
    console.log("Reading HTML file...");
    const htmlPath = join(process.cwd(), ".garbage", "codex.html");
    const html = await readFile(htmlPath, "utf-8");

    console.log("Extracting pactspirit data...");
    const items = extractPactspiritData(html);
    console.log(`Extracted ${items.length} pactspirits`);

    console.log("Creating data directory...");
    const dataDir = join(process.cwd(), "src", "data");
    await mkdir(dataDir, { recursive: true });

    console.log("Writing JSON file...");
    const outputPath = join(dataDir, "pactspirit.json");
    await writeFile(outputPath, JSON.stringify(items, null, 2), "utf-8");

    console.log(
      `Successfully wrote ${items.length} pactspirits to ${outputPath}`,
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
