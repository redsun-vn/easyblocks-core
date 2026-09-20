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
/**
 * A spacing as a number and a unit, or `null` when the string is not one.
 *
 * It answers with `null` rather than throwing because of where it is called
 * from. Every caller is on the path that compiles a saved document: the
 * built-in `space` type's validator, the theme's own space tokens, and
 * `linearizeSpace` for every spacing prop on the page. A throw there does not
 * reject one value — it takes down the whole build, which is a blank page on
 * the published site and an editor canvas that empties and does not come back.
 *
 * And the values reaching it are typed by hand: the spacing field in the
 * sidebar is a free-text input, so `1rem`, `5%`, `2em`, `auto` and a bare `10`
 * all arrive here without anybody having made a mistake beyond knowing some
 * CSS.
 */
export declare function parseSpacing(spacing: string): ParsedSpacing | null;
/**
 * A spacing in pixels, or `0` when it cannot be worked out.
 *
 * Zero because this is exported and components do arithmetic with the result —
 * a column gap, a card width, an edge margin. Zero is the neutral value there:
 * the layout is wrong in a way somebody can see and report, rather than absent.
 *
 * `reduceCSSCalc` throws on an expression it cannot parse, so the call is
 * wrapped: it is third-party code reached with values a shop owner typed.
 */
export declare function spacingToPx(spacing: Spacing, width: number): number;
export {};
//# sourceMappingURL=spacingToPx.d.ts.map