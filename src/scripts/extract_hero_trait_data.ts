import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface HeroTrait {
  hero: string;
  name: string;
  level: number;
  effect: string;
}

const cleanEffectText = (html: string): string => {
  // Replace <br> and <br/> with newlines
  let text = html.replace(/<br\s*\/?>/gi, "\n");
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // Decode HTML entities
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Normalize whitespace (but preserve newlines)
  text = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");
  // Remove empty lines
  text = text
    .split("\n")
    .filter((line) => line.length > 0)
    .join("\n");
  return text.trim();
};

const extractHeroTraitData = (html: string): HeroTrait[] => {
  const $ = cheerio.load(html);
  const traits: HeroTrait[] = [];

  // Select rows from the "heroTrait" table
  const rows = $('#heroTrait tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} hero trait rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 4) {
      console.warn(`Skipping row with ${tds.length} columns (expected 4)`);
      return;
    }

    const hero = $(tds[0]).text().trim();
    const name = $(tds[1]).text().trim();
    const levelStr = $(tds[2]).text().trim();
    const effectHtml = $(tds[3]).html() || "";

    const level = parseInt(levelStr, 10);
    if (isNaN(level)) {
      console.warn(`Skipping row with invalid level: ${levelStr}`);
      return;
    }

    const trait: HeroTrait = {
      hero,
      name,
      level,
      effect: cleanEffectText(effectHtml),
    };

    traits.push(trait);
  });

  return traits;
};

const main = async () => {
  try {
    console.log("Reading HTML file...");
    const htmlPath = join(process.cwd(), ".garbage", "codex.html");
    const html = await readFile(htmlPath, "utf-8");

    console.log("Extracting hero trait data...");
    const traits = extractHeroTraitData(html);
    console.log(`Extracted ${traits.length} hero traits`);

    console.log("Creating data directory...");
    const dataDir = join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });

    console.log("Writing JSON file...");
    const outputPath = join(dataDir, "hero_trait.json");
    await writeFile(outputPath, JSON.stringify(traits, null, 2), "utf-8");

    console.log(
      `Successfully wrote ${traits.length} hero traits to ${outputPath}`,
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
