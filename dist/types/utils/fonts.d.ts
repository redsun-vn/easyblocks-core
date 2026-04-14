import type { ExtractedFont } from "./extractFonts";
interface IFont {
    id: string;
    value: string;
    label: string;
}
export declare const defaultFontFamily = "Roboto";
export declare const defaultFontSize = 16;
export declare const defaultFontWeight = 400;
export declare const defaultLineHeight = 1.4;
export declare const fontFamilies: string[];
export declare function getFontFamilies(): IFont[];
export declare function getFontWeights(): IFont[];
export declare function getLineHeights(): IFont[];
export declare function getFontSizes(): IFont[];
type LoadGoogleFontsOptions = {
    /** Font families to load (legacy: string[], new: ExtractedFont[]). */
    fonts?: string[] | ExtractedFont[];
    /** If true, waits for fonts to actually render-ready before resolving. */
    waitFontReady?: boolean;
    /**
     * Editor mode: loads ALL font families with ALL weights (300–800).
     * Production mode (default): loads only the fonts + weights actually used.
     */
    editor?: boolean;
};
/**
 * Loads Google Fonts by injecting a `<link>` into `<head>`.
 *
 * Two modes:
 * - **Editor** (`editor: true`): loads all font families with weights 300–800.
 * - **Production** (default): loads only the fonts + weights actually used.
 */
export declare function loadGoogleFonts({ fonts, waitFontReady, editor, }?: LoadGoogleFontsOptions): Promise<void>;
export {};
//# sourceMappingURL=fonts.d.ts.map