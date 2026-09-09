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
   * a caller that returns it unchanged ships the whole stylesheet once per flush. See the
   * note on `getStyleTag` in `createEasyblocksStitches` for what to return instead.
   */
  getStyleTag: () => React.ReactElement;
};

/**
 * A Stitches instance plus the helpers to serialise what it has collected.
 *
 * Call it once per render tree — `useState(() => createEasyblocksStitches())` — and pass the
 * result to `<Easyblocks stitches={...} />`.
 *
 * Be aware of what that does and does not buy, because it is less than it looks. Stitches
 * memoises `createStitches` on the JSON of its config, so every call here with the same empty
 * config answers with the same object: two calls in one process are one instance and one
 * sheet, and on a server without a `document` that sheet is shared further still. A response
 * therefore carries whatever the process has generated since it started, across tenants, not
 * this page's rules alone — which is most of why the emitted `<style>` is as large as it is.
 *
 * Nothing here is wrong on screen: class names are derived from the styles rather than from
 * the instance, so a shared sheet names everything exactly as a private one would and a
 * browser instance still agrees with the server's markup at hydration. What it costs is
 * weight. Giving a call its own instance takes a config that serialises differently, and that
 * trades the growing sheet for a memo entry per call that is never released, so it is not a
 * fix to apply casually. `Box.test.tsx` pins the naming behaviour this all rests on.
 */
export function createEasyblocksStitches(): EasyblocksStitches {
  // Typed loosely on purpose: `sheet` is part of the runtime surface but not the published
  // types, and `Box` already receives this instance as `any`.
  const stitches: any = createStitches({});

  const getCssText = () => stitches.getCssText();

  /**
   * Cumulative: the sheet is never drained, so this answers with every rule generated so far.
   *
   * Draining it between flushes is the mistake to avoid. Stitches re-inserts a rule it no
   * longer knows about, so the shared `Box` reset would reappear in a later tag, after the
   * component rules that already streamed.
   *
   * That used to decide the cascade, and no longer does: the reset is wrapped in `:where()`
   * and carries no specificity, so a component rule wins wherever either one sits. What is
   * left is pure weight — a streaming caller that returns this on every flush ships the whole
   * sheet each time, measured at twenty copies of 113 KB in one document.
   *
   * A caller streaming this into a response should therefore remember what it has already
   * sent and return only the rest: identical text means send nothing, and text that extends
   * what was sent means send the extension. Keep the fallback for text that does not extend
   * it — the sheet groups rules by layer, so a rule landing in an earlier group rewrites the
   * middle of the string, and sending the whole sheet again is the only safe answer there.
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
