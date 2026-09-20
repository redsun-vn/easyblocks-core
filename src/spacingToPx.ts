import { reduceCSSCalc } from "@/reduce-css-calc";
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
export function parseSpacing(spacing: string): ParsedSpacing | null {
  for (const unit of ["px", "vw"] as const) {
    if (spacing.endsWith(unit)) {
      const value = parseFloat(spacing);

      return isNaN(value) ? null : { unit, value };
    }
  }

  return null;
}

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
export function spacingToPx(spacing: Spacing, width: number): number {
  let reducedSpacing: string;

  try {
    reducedSpacing = reduceCSSCalc(
      `calc(${spacing})` /* wrapping calc is necessary, otherwise max(10px,20px) doesn't work */,
      5,
      { vw: width, percent: width }
    );
  } catch {
    console.warn(`easyblocks: could not read the spacing "${spacing}", using 0`);

    return 0;
  }

  const parsed = parseSpacing(reducedSpacing);

  if (parsed?.unit === "px") {
    return parsed.value;
  }

  console.warn(
    `easyblocks: could not turn the spacing "${spacing}" into pixels at width ${width}, using 0`
  );

  return 0;
}
