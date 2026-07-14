import React from "react";
import { EasyblocksProps } from "./Easyblocks";
export type LazyEasyblocksProps = EasyblocksProps & {
    /** How many collection children to mount initially. Default `3`. */
    initialCount?: number;
    /** How many more children to mount each time the sentinel is reached (clamped to `>= 1`). Default `3`. */
    batchSize?: number;
    /**
     * Name of the collection slot on the root compiled node to lazy-mount. When
     * omitted, the slot whose children array is longest is auto-detected. Pass
     * explicitly when the root has multiple collections.
     */
    slot?: string;
    /** IntersectionObserver `root`. Default `null` (viewport). */
    scrollRoot?: Element | null;
    /** IntersectionObserver `rootMargin` (prefetch distance). Default `"200px"`. */
    rootMargin?: string;
};
/**
 * Drop-in wrapper around {@link Easyblocks} that progressively mounts the
 * children of one collection slot on scroll (append-only infinite scroll).
 *
 * Children config objects are reused by reference when slicing, so children
 * already mounted (keyed by `_id` inside the renderer) never remount — each
 * scroll batch only mounts the newly revealed children.
 */
declare function LazyEasyblocks({ renderableDocument, initialCount, batchSize, slot, scrollRoot, rootMargin, ...easyblocksProps }: LazyEasyblocksProps): React.JSX.Element;
export { LazyEasyblocks };
//# sourceMappingURL=LazyEasyblocks.d.ts.map