import { compileTemplate } from "./compiler";
import type { ParseTemplate } from "./template-types";
import type { TemplateMatcher } from "./types";

/**
 * Create a template matcher from a template string.
 * Uses substring matching - the pattern can appear anywhere in the input.
 *
 * Template syntax:
 * - `{name:int}` - Integer capture
 * - `{name:dec}` - Decimal capture
 * - `{name:dec%}` - Decimal with % suffix
 * - `[word]` - Optional literal word (captured as boolean)
 * - `(a|b)` - Alternation (non-capturing)
 *
 * @example
 * const matcher = template("{value:int} shadow quantity");
 * const result = matcher.match("Adds +50 Shadow Quantity");
 * // result = { value: 50 }
 */
export const template = <T extends string>(
  templateStr: T,
): TemplateMatcher<ParseTemplate<T>> => {
  const compiled = compileTemplate(templateStr);

  return {
    match(input: string): ParseTemplate<T> | undefined {
      const match = input.match(compiled.regex);
      if (!match) return undefined;

      const result: Record<string, string | number | boolean> = {};

      for (let i = 0; i < compiled.captureNames.length; i++) {
        const name = compiled.captureNames[i];
        const value = match[i + 1];

        if (value !== undefined) {
          const extractor = compiled.extractors.get(name);
          if (extractor) {
            result[name] = extractor(value);
          } else {
            result[name] = value;
          }
        }
      }

      return result as ParseTemplate<T>;
    },
  };
};
