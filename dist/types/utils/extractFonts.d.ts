export type ExtractedFont = {
    family: string;
    weights: number[];
};
/**
 * Walks the entry tree and collects every `{ fontFamily, fontWeight? }` pair.
 * Returns deduplicated fonts with only the weights actually used.
 */
export declare function extractFontsWithWeights(entry: any): ExtractedFont[];
/**
 * Backwards-compatible: returns just the font family strings.
 */
export declare const extractFonts: (entry: any) => string[];
//# sourceMappingURL=extractFonts.d.ts.map