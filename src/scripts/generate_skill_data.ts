import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import type { BaseSkill } from "../data/skill/types";

interface RawSkill {
  type: string;
  name: string;
  tags: string[];
}

// Maps JSON type → file key and type names
const SKILL_TYPE_CONFIG = {
  Active: {
    fileKey: "active",
    constName: "ActiveSkills",
    typeName: "ActiveSkill",
  },
  Passive: {
    fileKey: "passive",
    constName: "PassiveSkills",
    typeName: "PassiveSkill",
  },
  Support: {
    fileKey: "support",
    constName: "SupportSkills",
    typeName: "SupportSkill",
  },
  "Support (Magnificent)": {
    fileKey: "support_magnificent",
    constName: "MagnificentSupportSkills",
    typeName: "MagnificentSupportSkill",
  },
  "Support (Noble)": {
    fileKey: "support_noble",
    constName: "NobleSupportSkills",
    typeName: "NobleSupportSkill",
  },
  "Activation Medium": {
    fileKey: "activation_medium",
    constName: "ActivationMediumSkills",
    typeName: "ActivationMediumSkill",
  },
} as const;

type SkillTypeKey = keyof typeof SKILL_TYPE_CONFIG;

const extractSkillData = (html: string): RawSkill[] => {
  const $ = cheerio.load(html);
  const skills: RawSkill[] = [];

  const rows = $('#skill tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} skill rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 4) {
      console.warn(`Skipping row with ${tds.length} columns (expected 4)`);
      return;
    }

    const tags: string[] = [];
    $(tds[2])
      .find("span.multiVal")
      .each((_, elem) => {
        tags.push($(elem).text().replace(/\s+/g, " ").trim());
      });

    const skill: RawSkill = {
      type: $(tds[0]).text().trim(),
      name: $(tds[1]).text().trim(),
      tags,
    };

    skills.push(skill);
  });

  return skills;
};

const generateSkillTypeFile = (
  constName: string,
  typeName: string,
  skills: BaseSkill[],
): string => {
  return `import { BaseSkill } from "./types";

export const ${constName} = ${JSON.stringify(skills, null, 2)} as const satisfies readonly BaseSkill[];

export type ${typeName} = (typeof ${constName})[number];
`;
};

const main = async (): Promise<void> => {
  console.log("Reading HTML file...");
  const htmlPath = join(process.cwd(), ".garbage", "codex.html");
  const html = await readFile(htmlPath, "utf-8");

  console.log("Extracting skill data...");
  const rawData = extractSkillData(html);
  console.log(`Extracted ${rawData.length} skills`);

  // Group by skill type
  const grouped = new Map<SkillTypeKey, BaseSkill[]>();

  for (const raw of rawData) {
    const skillType = raw.type as SkillTypeKey;

    if (!(skillType in SKILL_TYPE_CONFIG)) {
      console.warn(`Unknown skill type: ${skillType}`);
      continue;
    }

    const skillEntry: BaseSkill = {
      type: raw.type as BaseSkill["type"],
      name: raw.name,
      tags: raw.tags as unknown as BaseSkill["tags"],
    };

    if (!grouped.has(skillType)) {
      grouped.set(skillType, []);
    }
    grouped.get(skillType)!.push(skillEntry);
  }

  console.log(`Grouped into ${grouped.size} skill types`);

  // Create output directory
  const outDir = join(process.cwd(), "src", "data", "skill");
  await mkdir(outDir, { recursive: true });

  // Generate individual skill type files
  for (const [skillType, skills] of grouped) {
    const config = SKILL_TYPE_CONFIG[skillType];
    const fileName = config.fileKey + ".ts";
    const filePath = join(outDir, fileName);
    const content = generateSkillTypeFile(
      config.constName,
      config.typeName,
      skills,
    );

    await writeFile(filePath, content, "utf-8");
    console.log(`Generated ${fileName} (${skills.length} skills)`);
  }

  console.log("\nCode generation complete!");
  console.log(
    `Generated ${grouped.size} skill type files with ${rawData.length} total skills`,
  );

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

export { main as generateSkillData };
