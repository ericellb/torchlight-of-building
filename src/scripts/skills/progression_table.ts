import type { CheerioAPI } from "cheerio";
import * as cheerio from "cheerio";
import type {
  ProgressionRow,
  ProgressionTable,
  SupportParserInput,
} from "./types";

const EXPECTED_LEVELS = 40;

export const extractProgressionTable = (
  $: CheerioAPI,
): ProgressionTable | undefined => {
  const card = $("div.card-header:contains('Progression /40')").closest(
    "div.card",
  );
  if (card.length === 0) {
    return undefined;
  }

  const table = card.find("table");
  if (table.length === 0) {
    return undefined;
  }

  const headerRow = table.find("thead tr").first();
  const headerCells = headerRow.find("th");
  let headerTemplate: string | undefined;

  if (headerCells.length > 1) {
    const secondHeader = $(headerCells[1]);
    if (secondHeader.find("span.text-mod").length > 0) {
      headerTemplate = secondHeader.html() ?? undefined;
    }
  }

  const rows: ProgressionRow[] = [];
  table.find("tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const level = Number.parseInt($(cells[0]).text().trim(), 10);
    if (Number.isNaN(level)) return;

    const descriptionHtml = $(cells[1]).html() ?? "";

    const values: string[] = [];
    cells.slice(1).each((_, cell) => {
      values.push($(cell).text().trim());
    });

    rows.push({ level, descriptionHtml, values });
  });

  return { headerTemplate, rows };
};

export const validateAllLevels = (
  levels: Record<number, unknown>,
  skillName: string,
): void => {
  const levelNumbers = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  if (levelNumbers.length !== EXPECTED_LEVELS) {
    throw new Error(
      `Parser for "${skillName}" extracted ${levelNumbers.length} levels, expected ${EXPECTED_LEVELS}`,
    );
  }

  for (let i = 1; i <= EXPECTED_LEVELS; i++) {
    if (!levelNumbers.includes(i)) {
      throw new Error(`Parser for "${skillName}" missing level ${i}`);
    }
  }
};

export const extractTextModValues = (html: string): string[] => {
  const fragment = cheerio.load(html);
  const values: string[] = [];
  fragment("span.text-mod").each((_, elem) => {
    values.push(fragment(elem).text().trim());
  });
  return values;
};

export const parseNumericValue = (
  value: string,
  options?: { asPercentage?: boolean },
): number => {
  const cleaned = value.replace(/^\+/, "").trim();

  // Handle fraction notation (e.g., "31/2" = 15.5)
  const fractionMatch = cleaned.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  let num: number;

  if (fractionMatch) {
    const numerator = Number.parseFloat(fractionMatch[1]);
    const denominator = Number.parseFloat(fractionMatch[2]);
    num = numerator / denominator;
  } else {
    num = Number.parseFloat(cleaned);
  }

  if (Number.isNaN(num)) {
    throw new Error(`Failed to parse numeric value: "${value}"`);
  }

  if (options?.asPercentage === true) {
    num = num / 100;
  }

  // Round to 4 decimal places to avoid floating point artifacts
  return Math.round(num * 10000) / 10000;
};

export const buildProgressionTableInput = (
  $: CheerioAPI,
): SupportParserInput["progressionTable"] | undefined => {
  const table = extractProgressionTable($);
  if (table === undefined) {
    return undefined;
  }

  const description: Record<number, string> = {};
  const values: Record<number, string[]> = {};

  for (const row of table.rows) {
    // Convert descriptionHtml to plain text
    const descText = cheerio.load(row.descriptionHtml).text().trim();
    description[row.level] = descText;
    values[row.level] = row.values;
  }

  return { description, values };
};
