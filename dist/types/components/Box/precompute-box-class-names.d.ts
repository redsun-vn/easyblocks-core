import { Devices } from "../../types";
/**
 * Class names for every Box of a compiled tree, worked out before the tree is sent.
 *
 * A compiled document carries a style object per Box, and the browser turns each one into a
 * class through Stitches while it hydrates. On a large page those objects are a third of the
 * payload, and the work is done again by every visitor for a result that never changes.
 * Doing it once, where the compiled tree is cached, removes both.
 *
 * Each Box object is replaced by `{ __isBox, __as, __className }`, the class string `Box`
 * would have produced itself, and `css` holds the rules for those classes. Stitches names a
 * class by hashing its styles, so the names are the same ones the browser would compute.
 *
 * Only Boxes under a `styled` key are touched: that is what `ComponentBuilder` hands to
 * `buildBoxes`, so anything else keeps the shape its readers expect.
 *
 * The walk is the one `buildBoxes` does (arrays by index, objects by key), and it is
 * synchronous on purpose: `createEasyblocksStitches()` hands back the one shared instance
 * and empties its sheet, so no other render may touch that sheet before `getCssText()` has
 * been read.
 *
 * The input is not changed; objects on the path to a Box are copied, everything else is
 * shared.
 */
export declare function precomputeBoxClassNames<T>(renderableContent: T, devices: Devices): {
    renderableContent: T;
    css: string;
};
//# sourceMappingURL=precompute-box-class-names.d.ts.map