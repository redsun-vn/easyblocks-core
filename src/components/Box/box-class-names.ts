import { getBoxStyles } from "../../compiler/box";
import { Devices } from "../../types";

/**
 * Wrapped in `:where()` so the rule carries no specificity at all.
 *
 * Every Box gets this reset plus a class generated from its own styles, and both are single
 * classes — equal specificity, so whichever the browser reads last wins. That is fine while
 * they live in one stylesheet, and stops being fine the moment they do not: server-rendered
 * CSS is streamed into the body, the browser's own instance writes into the head, and the
 * head is read first. A component whose styles are generated only in the browser then loses
 * every padding, margin and border to a reset that happens to sit further down the page.
 *
 * At zero specificity the reset always loses to the component rule and position stops
 * mattering. It also now loses to a bare element selector, which is the intended trade: an
 * author who writes `ul { padding-left: 2rem }` means it.
 */
const boxStyles = {
  ":where(&)": {
    boxSizing: "border-box",
    minWidth: "0px",
    margin: 0,
    padding: 0,
    border: 0,
    listStyle: "none",
  },
};

export type BoxClassNames = {
  boxClassName: string;
  componentClassName: string;
};

/** What one render tree has generated so far: the shared reset, and a class set per style. */
type ClassNameScope = {
  resetClassName: string;
  byHash: Map<string, BoxClassNames>;
};

/**
 * Class names generated for one render tree, so a page's Boxes stop paying for each other.
 *
 * A page repeats its styles far more than it varies them: the webino home page compiles
 * 2,350 Box style objects out of 387 distinct ones. Every Box still paid full price for its
 * own copy — a deep clone, a responsive pass and two Stitches registrations — because
 * `useMemo` spans re-renders of a single element and a server render has none. Six of every
 * seven of those calls were recomputing a result already known.
 *
 * `__hash` is a content hash of the styles, and `Box`'s memo already trusted it to say when
 * two style objects are the same; this only widens that trust from one element to the tree.
 *
 * **The lifetime is the whole point, and getting it wrong shipped a bug.** A cached class
 * name is worth something only while the rule naming it is still in the sheet, and the sheet
 * does not last as long as the Stitches instance: `createStitches` is memoised on the JSON of
 * its config, so `createEasyblocksStitches()` hands back the same instance every time and
 * empties its sheet on the way. A cache that outlived that emptying kept naming rules that
 * had been thrown away — every Box carried the reset class in its markup while the rule
 * defining it was absent from the served CSS.
 *
 * Nothing reachable from a Box marks the boundary: the compiled document, and the `devices`
 * inside it, are cached in process memory and shared across requests. So the scope is opened
 * explicitly, from the one place that empties the sheet, and the entry is discarded there.
 */
const scopesByStitches = new WeakMap<object, ClassNameScope>();

/**
 * Starts a fresh scope for `stitches`, discarding what the previous tree generated.
 *
 * Called by `createEasyblocksStitches`, which is where the sheet is emptied, so the cache and
 * the rules it names are always thrown away together.
 */
export function startBoxClassNameScope(stitches: unknown): void {
  scopesByStitches.delete(stitches as object);
}

function getScope(stitches: any): ClassNameScope {
  let scope = scopesByStitches.get(stitches);

  if (!scope) {
    // Registered per tree rather than per element: the sheet this writes into was emptied
    // when the tree began.
    scope = {
      resetClassName: stitches.css(boxStyles)() as string,
      byHash: new Map(),
    };
    scopesByStitches.set(stitches, scope);
  }

  return scope;
}

function buildComponentClassName(
  stitches: any,
  devices: Devices,
  styles: Record<string, any>,
): string {
  /**
   * Styles have to be owned by the current JS realm for Stitches/CSSOM: the editor renders
   * its canvas in an iframe and passes objects across that boundary. `structuredClone` is
   * faster than a JSON round trip and covers the same case; the round trip is there for
   * browsers without it.
   */
  const cloned =
    typeof structuredClone === "function"
      ? structuredClone(styles)
      : JSON.parse(JSON.stringify(styles));

  return stitches.css(getBoxStyles(cloned, devices))() as string;
}

export function getBoxClassNames(
  stitches: any,
  devices: Devices,
  styles: Record<string, any>,
): BoxClassNames {
  const scope = getScope(stitches);
  const hash = styles.__hash;

  // Styles compiled without a hash cannot be told apart, so they are never cached.
  if (typeof hash !== "string") {
    return {
      boxClassName: scope.resetClassName,
      componentClassName: buildComponentClassName(stitches, devices, styles),
    };
  }

  let classNames = scope.byHash.get(hash);

  if (!classNames) {
    classNames = {
      boxClassName: scope.resetClassName,
      componentClassName: buildComponentClassName(stitches, devices, styles),
    };
    scope.byHash.set(hash, classNames);
  }

  return classNames;
}
