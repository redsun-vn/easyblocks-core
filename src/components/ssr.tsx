import { createStitches } from "@stitches/core";
import React from "react";

export type EasyblocksStitches = {
  /** The raw Stitches instance handed to `Box` for class generation. */
  stitches: any;
  /** Every rule this instance has generated, as CSS text. Does not consume anything. */
  getCssText: () => string;
  /**
   * Every rule so far, wrapped in a `<style>` element ready to stream into the document.
   *
   * Streaming SSR asks for this once per flush and each answer repeats what came before, so
   * a response carries the stylesheet more than once. That redundancy is deliberate — see
   * the note on `getStyleTag` in `createEasyblocksStitches`.
   */
  getStyleTag: () => React.ReactElement;
};

/**
 * A Stitches instance plus the helpers to serialise what it has collected.
 *
 * Create one per render tree — `useState(() => createEasyblocksStitches())` — and pass it to
 * `<Easyblocks stitches={...} />`. On a server that means one per request, which is the
 * point: a Stitches sheet only ever grows, so a shared one would serve every request the
 * accumulated CSS of every request before it, across tenants, for the lifetime of the
 * process. Owning it per tree also makes `getCssText` exact — it returns this page's rules
 * and nothing else.
 */
export function createEasyblocksStitches(): EasyblocksStitches {
  // Typed loosely on purpose: `sheet` is part of the runtime surface but not the published
  // types, and `Box` already receives this instance as `any`.
  const stitches: any = createStitches({});

  const getCssText = () => stitches.getCssText();

  /**
   * Deliberately cumulative: every flush repeats the rules the earlier ones already carried.
   *
   * Emptying the sheet between flushes would be smaller, and is wrong. `Box` gives every
   * element a shared reset class alongside its own generated one, and the reset only works
   * because it is inserted first. Drain the sheet and the next element re-inserts that reset
   * *after* the component rules already streamed — same specificity, later wins, and every
   * padding, margin and border those rules set is silently flattened to the reset's zero.
   *
   * Repeating the rules keeps each tag internally ordered, so the reset stays ahead of what
   * overrides it no matter which tag the browser reads last.
   */
  const getStyleTag = () => (
    <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
  );

  return { stitches, getCssText, getStyleTag };
}

/**
 * Fallback instance for callers that have not adopted `createEasyblocksStitches`.
 *
 * Shared process-wide, so it carries the accumulation described above and is only safe
 * where one tree exists at a time — the editor, and client-only rendering. Server rendering
 * should pass an explicit instance instead.
 */
export const easyblocksStitchesInstances: any[] = [];

export function easyblocksGetCssText() {
  return easyblocksStitchesInstances
    .map((stitches) => stitches.getCssText())
    .join(" ");
}

export function easyblocksGetStyleTag() {
  return (
    <style
      id="stitches"
      dangerouslySetInnerHTML={{ __html: easyblocksGetCssText() }}
    />
  );
}
