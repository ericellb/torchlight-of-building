import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface Skill {
  type: string;
  name: string;
  tags: string[];
}

const extractSkillData = (html: string): Skill[] => {
  const $ = cheerio.load(html);
  const skills: Skill[] = [];

  // Select rows from the "skill" table
  const rows = $('#skill tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} skill rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 4) {
      console.warn(`Skipping row with ${tds.length} columns (expected 4)`);
      return;
    }

    // Extract tags from span.multiVal elements
    const tags: string[] = [];
    $(tds[2])
      .find("span.multiVal")
      .each((_, elem) => {
        tags.push($(elem).text().replace(/\s+/g, " ").trim());
      });

    const skill: Skill = {
      type: $(tds[0]).text().trim(),
      name: $(tds[1]).text().trim(),
      tags,
    };

    skills.push(skill);
  });

  return skills;
};

const main = async () => {
  try {
    console.log("Reading HTML file...");
    const htmlPath = join(process.cwd(), ".garbage", "codex.html");
    const html = await readFile(htmlPath, "utf-8");

    console.log("Extracting skill data...");
    const skills = extractSkillData(html);
    console.log(`Extracted ${skills.length} skills`);

    console.log("Creating data directory...");
    const dataDir = join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });

    console.log("Writing JSON file...");
    const outputPath = join(dataDir, "skill_data.json");
    await writeFile(outputPath, JSON.stringify(skills, null, 2), "utf-8");

    console.log(
      `✓ Successfully wrote ${skills.length} skills to ${outputPath}`,
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
