import React, { useMemo } from "react";
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

type BoxClassNames = {
  boxClassName: string;
  componentClassName: string;
};

/**
 * Class names for one set of compiled styles, remembered per Stitches instance.
 *
 * A page repeats its styles far more than it varies them: the webino home page compiles
 * 2,350 Box style objects out of 387 distinct ones. Every Box still paid full price for its
 * own copy — a deep clone, a responsive pass and two Stitches registrations — because
 * `useMemo` spans re-renders of a single element and a server render has none. Six of every
 * seven of those calls were recomputing a result already known.
 *
 * `__hash` is a content hash of the styles, and the memo below already trusted it to say
 * when two style objects are the same; this only widens that trust from one element to the
 * whole tree. The cache hangs off the Stitches instance, so it is discarded with the request
 * that owns it and can never reach another tenant, and off `devices`, which the responsive
 * pass reads.
 */
const classNamesByStitches = new WeakMap<
  object,
  WeakMap<object, Map<string, BoxClassNames>>
>();

/** The reset is a module constant, so its class is generated once per Stitches instance. */
const resetClassByStitches = new WeakMap<object, string>();

function getResetClassName(stitches: any): string {
  let className = resetClassByStitches.get(stitches);

  if (className === undefined) {
    className = stitches.css(boxStyles)() as string;
    resetClassByStitches.set(stitches, className);
  }

  return className;
}

function buildClassNames(
  stitches: any,
  devices: Devices,
  styles: Record<string, any>,
): BoxClassNames {
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

  return {
    boxClassName: getResetClassName(stitches),
    componentClassName: stitches.css(getBoxStyles(cloned, devices))() as string,
  };
}

function getClassNames(
  stitches: any,
  devices: Devices,
  styles: Record<string, any>,
): BoxClassNames {
  const hash = styles.__hash;

  // Styles compiled without a hash cannot be told apart, so they are never cached.
  if (typeof hash !== "string") {
    return buildClassNames(stitches, devices, styles);
  }

  let byDevices = classNamesByStitches.get(stitches);

  if (!byDevices) {
    byDevices = new WeakMap();
    classNamesByStitches.set(stitches, byDevices);
  }

  let byHash = byDevices.get(devices);

  if (!byHash) {
    byHash = new Map();
    byDevices.set(devices, byHash);
  }

  let classNames = byHash.get(hash);

  if (!classNames) {
    classNames = buildClassNames(stitches, devices, styles);
    byHash.set(hash, classNames);
  }

  return classNames;
}

type BoxProps = {
  __compiled: any;
  __name?: string;
  devices: Devices;
  stitches: any;
  [key: string]: any;
};

const Box = React.forwardRef<HTMLElement, BoxProps>((props, ref) => {
  /**
   * passedProps - the props given in component code like <MyBox data-id="abc" /> (data-id is in passedProps)
   * restProps - the props given by Shopstory (like from actionWrapper)
   *
   * They are merged into "realProps".
   *
   * I know those names sucks, this needs to be cleaned up.
   */

  const { __compiled, __name, passedProps, devices, stitches, ...restProps } =
    props;

  const { __as, ...styles } = __compiled;
  const realProps = { ...restProps, ...passedProps };

  const { as, itemWrappers, className, ...restPassedProps } = realProps;

  const { boxClassName, componentClassName } = useMemo(
    () => getClassNames(stitches, devices, styles),
    // `stitches` and `devices` join the hash because the class names are only valid for the
    // instance that generated them and the devices they were compiled against.
    [stitches, devices, styles.__hash],
  );

  return React.createElement(
    as || __as || "div",
    {
      ref,
      ...restPassedProps,
      className: [boxClassName, componentClassName, className]
        .filter(Boolean)
        .join(" "),
      "data-testid": __name,
    },
    props.children,
  );
});

Box.displayName = "Box";

export { Box };
