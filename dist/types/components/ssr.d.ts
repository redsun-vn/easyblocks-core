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