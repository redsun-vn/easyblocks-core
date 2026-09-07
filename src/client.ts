"use client";

/**
 * Client entry point.
 *
 * The React surface of this package lives behind its own entry so that a Next.js App
 * Router consumer can import it from a Server Component tree without dragging React
 * context creation into the RSC graph.
 *
 * It exists because the bundler cannot carry the per-file `"use client"` directives
 * through: rollup drops module-level directives when it bundles (see `onwarn` in
 * rollup.config.js), so nothing in `dist` told Next which exports were client-only.
 * A consumer was then forced to choose between two broken states — mark the package
 * external for Server Components and have the client import resolve to `undefined`
 * during SSR, or bundle it and have `React.createContext` run in the RSC environment,
 * where it does not exist.
 *
 * The directive below survives bundling because it is re-attached to this chunk by the
 * rollup `banner`, keyed on the entry name.
 */

export {
  Easyblocks,
  type ComponentOverrides,
  type EasyblocksProps,
} from "./components/Easyblocks";
export {
  LazyEasyblocks,
  type LazyEasyblocksProps,
} from "./components/LazyEasyblocks";
export { easyblocksGetCssText, easyblocksGetStyleTag } from "./components/ssr";
export { EasyblocksMetadataProvider } from "./components/EasyblocksMetadataProvider";
export { EasyblocksExternalDataProvider } from "./components/EasyblocksExternalDataProvider";
