/**
 * Result of compiling a template string into a regex matcher.
 */
export interface CompiledTemplate {
  /** The compiled regex pattern (without anchors for substring matching) */
  regex: RegExp;
  /** Names of captured groups in order */
  captureNames: string[];
  /** Functions to extract/transform captured values */
  extractors: Map<string, (match: string) => string | number>;
}

/**
 * A compiled template that can match input strings and extract typed captures.
 */
export interface TemplateMatcher<T extends object> {
  /** Match the template against input, returning captures or undefined */
  match(input: string): T | undefined;
}
