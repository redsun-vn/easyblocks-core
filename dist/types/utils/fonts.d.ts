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
export declare function loadGoogleFonts(fonts?: string[]): Promise<void>;
export {};
//# sourceMappingURL=fonts.d.ts.map