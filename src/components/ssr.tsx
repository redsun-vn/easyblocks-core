import { createStitches } from "@stitches/core";
import React from "react";

export type EasyblocksStitches = {
  /** The raw Stitches instance handed to `Box` for class generation. */
  stitches: any;
  /** Every rule this instance has generated, as CSS text. Does not consume anything. */
  getCssText: () => string;
  /**
   * The rules generated since the previous call, wrapped in a `<style>` element ready to
   * stream into the document. Streaming SSR asks for this once per flush, so returning only
   * what is new keeps each response carrying the stylesheet once rather than once per flush.
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

  const getStyleTag = () => {
    const css = getCssText();

    // Emptying the sheet is what makes the next flush a delta rather than a repeat of
    // everything so far. Nothing is lost: these rules are already in the markup being sent,
    // and class names are content hashes, so a style that appears again later resolves to
    // the same name. Server only — in a browser this sheet is the live CSSOM.
    if (typeof document === "undefined") {
      stitches.sheet.reset();
    }

    return <style id="stitches" dangerouslySetInnerHTML={{ __html: css }} />;
  };

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
