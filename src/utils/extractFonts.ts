function traverse(obj: any, visitor: (node: any) => void) {
  if (typeof obj !== "object" || obj === null) return;

  visitor(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item) => traverse(item, visitor));
  } else {
    Object.values(obj).forEach((value) => traverse(value, visitor));
  }
}

export type ExtractedFont = {
  family: string;
  weights: number[];
};

/**
 * Walks the entry tree and collects every `{ fontFamily, fontWeight? }` pair.
 * Returns deduplicated fonts with only the weights actually used.
 */
export function extractFontsWithWeights(entry: any): ExtractedFont[] {
  const map = new Map<string, Set<number>>();

  traverse(entry, (node) => {
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

      let weights = map.get(family);
      if (!weights) {
        weights = new Set<number>();
        map.set(family, weights);
      }
      weights.add(weight);
    }
  });

  return Array.from(map.entries()).map(([family, weights]) => ({
    family,
    weights: Array.from(weights).sort((a, b) => a - b),
  }));
}

/**
 * Backwards-compatible: returns just the font family strings.
 */
export const extractFonts = (entry: any): string[] => {
  return extractFontsWithWeights(entry).map((f) => f.family);
};
