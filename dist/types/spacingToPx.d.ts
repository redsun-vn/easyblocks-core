import { Spacing } from "./types";
type PxSpacing = {
    unit: "px";
    value: number;
};
type VwSpacing = {
    unit: "vw";
    value: number;
};
type ParsedSpacing = PxSpacing | VwSpacing;
export declare function parseSpacing(spacing: string): ParsedSpacing;
export declare function spacingToPx(spacing: Spacing, width: number): number;
export {};
//# sourceMappingURL=spacingToPx.d.ts.map