export type ExtractedFont = {
    family: string;
    weights: number[];
    italics: number[];
};
/**
 * Walks the entry tree and collects every `{ fontFamily, fontWeight?, fontStyle? }` pair.
 * Splits weights into regular (`weights`) and italic (`italics`) axes based on `fontStyle`.
 * Returns deduplicated fonts with only the variants actually used.
 */
export declare function extractFontsWithWeights(entry: any): ExtractedFont[];
/**
 * Backwards-compatible: returns just the font family strings.
 */
export declare const extractFonts: (entry: any) => string[];
//# sourceMappingURL=extractFonts.d.ts.map