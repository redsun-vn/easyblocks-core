/**
 * Which font files a saved document is going to need.
 *
 * The renderer asks Google for exactly what comes back from here, so a variant
 * missed here is a variant the browser has to fake: a bold it smears, or an
 * italic it slants by shearing the upright letters. That shows up as a page
 * that looked right while it was being built — the editor loads every weight
 * of every family up front — and looks subtly wrong once published.
 */

/**
 * Where a piece of text says it is italic.
 *
 * Two shapes, both of which the compiler produces. A `font` token value may
 * carry `fontStyle` inside itself, which is the shape a component writes when
 * its whole text is italic. A rich-text part instead keeps `fontStyle` beside
 * its `font`, as a field of its own, because the italic there belongs to the
 * few words an author selected rather than to the token they share with the
 * rest of the line — and reading only the first shape is what left every
 * italic in a rich text being faked by the browser.
 *
 * `oblique` asks for the italic file too. Nothing serves a separate oblique,
 * and the real italic is far closer to what was asked for than a sheared
 * upright.
 */
const isItalicStyle = (style: unknown): boolean =>
  style === "italic" || style === "oblique";

/** The keys whose value is a font a node's own `fontStyle` is about. */
const FONT_KEYS = new Set(["font", "mainFont"]);

function traverse(
  obj: any,
  inheritedStyle: unknown,
  visitor: (node: any, style: unknown) => void,
) {
  if (typeof obj !== "object" || obj === null) return;

  visitor(obj, inheritedStyle);

  if (Array.isArray(obj)) {
    obj.forEach((item) => traverse(item, inheritedStyle, visitor));
    return;
  }

  /*
   * A node's `fontStyle` travels into its own font and no further.
   *
   * Passing it to every descendant instead would be simpler and wrong in a way
   * that costs bytes on every page: a component set in italic holding a child
   * with a font of its own would have that child's italic file fetched too,
   * for text nobody ever slants.
   */
  const ownStyle = typeof obj.fontStyle === "string" ? obj.fontStyle : undefined;

  Object.entries(obj).forEach(([key, value]) => {
    traverse(
      value,
      FONT_KEYS.has(key) ? ownStyle : inheritedStyle,
      visitor,
    );
  });
}

export type ExtractedFont = {
  family: string;
  weights: number[];
  italics: number[];
};

/**
 * Walks the entry tree and collects every `{ fontFamily, fontWeight?, fontStyle? }` pair.
 * Splits weights into regular (`weights`) and italic (`italics`) axes based on `fontStyle`,
 * whether that style sits inside the font value or beside it.
 * Returns deduplicated fonts with only the variants actually used.
 */
export function extractFontsWithWeights(entry: any): ExtractedFont[] {
  const map = new Map<
    string,
    { weights: Set<number>; italics: Set<number> }
  >();

  traverse(entry, undefined, (node, style) => {
    if (
      node &&
      typeof node === "object" &&
      node.value &&
      typeof node.value === "object" &&
      typeof node.value.fontFamily === "string"
    ) {
      const family = node.value.fontFamily;
      const weight =
        typeof node.value.fontWeight === "number" ? node.value.fontWeight : 400;
      const isItalic =
        isItalicStyle(node.value.fontStyle) || isItalicStyle(style);

      let entryMap = map.get(family);
      if (!entryMap) {
        entryMap = { weights: new Set<number>(), italics: new Set<number>() };
        map.set(family, entryMap);
      }
      (isItalic ? entryMap.italics : entryMap.weights).add(weight);
    }
  });

  return Array.from(map.entries()).map(([family, { weights, italics }]) => ({
    family,
    weights: Array.from(weights).sort((a, b) => a - b),
    italics: Array.from(italics).sort((a, b) => a - b),
  }));
}

/**
 * Backwards-compatible: returns just the font family strings.
 */
export const extractFonts = (entry: any): string[] => {
  return extractFontsWithWeights(entry).map((f) => f.family);
};
