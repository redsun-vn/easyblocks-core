/**
 * Which font files a saved document is going to need.
 *
 * The renderer asks Google for exactly what comes back from here, so a variant
 * missed here is a variant the browser has to fake: a bold it smears, or an
 * italic it slants by shearing the upright letters. That shows up as a page
 * that looked right while it was being built — the editor loads every weight
 * of every family up front — and looks subtly wrong once published.
 */
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
export declare function extractFontsWithWeights(entry: any): ExtractedFont[];
/**
 * Backwards-compatible: returns just the font family strings.
 */
export declare const extractFonts: (entry: any) => string[];
//# sourceMappingURL=extractFonts.d.ts.map