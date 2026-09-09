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
export declare function createEasyblocksStitches(): EasyblocksStitches;
/**
 * Fallback instance for callers that have not adopted `createEasyblocksStitches`.
 *
 * Shared process-wide, so it carries the accumulation described above and is only safe
 * where one tree exists at a time — the editor, and client-only rendering. Server rendering
 * should pass an explicit instance instead.
 */
export declare const easyblocksStitchesInstances: any[];
export declare function easyblocksGetCssText(): string;
export declare function easyblocksGetStyleTag(): React.JSX.Element;
//# sourceMappingURL=ssr.d.ts.map