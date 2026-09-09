/**
 * @jest-environment node
 *
 * Stitches writes into the document's CSSOM whenever one exists, so under jsdom
 * `getCssText()` answers with nothing. The node environment is also the one that matters
 * here: this cache exists for server rendering.
 */
import React from "react";
import { renderToString } from "react-dom/server";
import { Devices } from "../../types";
import { createStitches } from "@stitches/core";
import { Box } from "./Box";
import { startBoxClassNameScope } from "./box-class-names";

const devices: Devices = [
  { id: "xs", w: 375, h: 667, breakpoint: 568 },
  { id: "md", w: 768, h: 1024, breakpoint: 992 },
  { id: "xl", w: 1440, h: 900, breakpoint: null },
];

let instanceCount = 0;

/**
 * A Stitches instance of its own, wrapped to count how often class generation runs. The
 * counter never replaces what it measures — the CSS still comes out of Stitches itself.
 *
 * The unused config key is what makes each of these a separate instance: `createStitches` is
 * memoised on the JSON of its config, so every call with the same config — `{}` included —
 * answers with one shared object. See the note in `createEasyblocksStitches`.
 */
function countingStitches() {
  const stitches: any = createStitches({
    __testInstance: (instanceCount += 1),
  } as any);
  const realCss = stitches.css.bind(stitches);
  let cssCalls = 0;

  stitches.css = (...args: unknown[]) => {
    cssCalls += 1;
    return realCss(...args);
  };

  return { stitches, getCssCalls: () => cssCalls };
}

function compiled(hash: string, padding: string) {
  return {
    __isBox: true,
    __hash: hash,
    display: "block",
    paddingTop: padding,
  };
}

describe("Box class generation", () => {
  it("generates one rule per distinct __hash, not one per element", () => {
    const { stitches, getCssCalls } = countingStitches();
    const distinct = ["h1", "h2", "h3", "h4", "h5"];
    const repeats = 4;

    const boxes = distinct.flatMap((hash, index) =>
      Array.from({ length: repeats }, (_unused, repeat) => (
        <Box
          key={`${hash}-${repeat}`}
          __compiled={compiled(hash, `${index * 4}px`)}
          devices={devices}
          stitches={stitches}
        />
      )),
    );

    renderToString(<>{boxes}</>);

    // One call for the shared reset, one per distinct hash. Without the cache this was one
    // reset call plus one style call for every element rendered.
    expect(getCssCalls()).toBe(1 + distinct.length);
  });

  it("gives elements sharing a __hash the same classes, and different ones otherwise", () => {
    const { stitches } = countingStitches();

    const classNamesOf = (hash: string, padding: string) => {
      const html = renderToString(
        <Box
          __compiled={compiled(hash, padding)}
          devices={devices}
          stitches={stitches}
        />,
      );
      return /class="([^"]*)"/.exec(html)?.[1] ?? "";
    };

    const first = classNamesOf("same", "8px");
    const second = classNamesOf("same", "8px");
    const other = classNamesOf("different", "16px");

    expect(first).toBe(second);
    expect(first).not.toBe(other);
  });

  it("still styles compiled styles that carry no hash", () => {
    const { stitches, getCssCalls } = countingStitches();
    const render = (padding: string) =>
      renderToString(
        <Box
          __compiled={{ __isBox: true, display: "flex", paddingTop: padding }}
          devices={devices}
          stitches={stitches}
        />,
      );

    const first = /class="([^"]*)"/.exec(render("24px"))?.[1] ?? "";
    const second = /class="([^"]*)"/.exec(render("32px"))?.[1] ?? "";

    // Both still get their own class; they simply go through generation every time, because
    // there is no hash to remember them by. Three calls, not four: the reset is a constant
    // and is generated once for the instance however the styles arrive.
    expect(first).toBeTruthy();
    expect(first).not.toBe(second);
    expect(getCssCalls()).toBe(3);
  });

  it("keeps one instance's cache out of another's", () => {
    const first = countingStitches();
    const second = countingStitches();
    const element = (stitches: unknown) => (
      <Box
        __compiled={compiled("shared", "12px")}
        devices={devices}
        stitches={stitches}
      />
    );

    renderToString(element(first.stitches));
    renderToString(element(second.stitches));

    // The second instance does its own generating rather than reading a class name out of a
    // cache belonging to a sheet it does not own: one call for the reset, one for the styles.
    expect(first.stitches).not.toBe(second.stitches);
    expect(second.getCssCalls()).toBe(2);
  });

  it("puts the reset back for each render tree, since the sheet is emptied between them", () => {
    // The condition this reproduces is the real one, and the reason the first version of this
    // cache shipped broken. `createEasyblocksStitches()` hands back the same Stitches instance
    // every time and empties its sheet on the way. A cache that survived that emptying kept
    // handing every Box the reset class while the rule defining it was gone from the CSS, so
    // the served page lost box-sizing, margin, padding and border on every Box.
    const { stitches, getCssCalls } = countingStitches();
    const render = () =>
      renderToString(
        <Box
          __compiled={compiled("shared", "12px")}
          devices={devices}
          stitches={stitches}
        />,
      );

    render();
    expect(getCssCalls()).toBe(2); // the reset, and the styles
    // What `createEasyblocksStitches` does at the start of the next tree.
    stitches.reset();
    startBoxClassNameScope(stitches);
    render();

    // Four, not three: the second tree registers the reset again rather than naming a rule
    // the emptying above discarded. Counted rather than read back out of the sheet, because
    // `getCssText` stops answering once `reset` has been called on the instance by hand.
    expect(getCssCalls()).toBe(4);
  });

  it("names identical styles identically across instances, so hydration matches", () => {
    // The server and the browser each build their own instance. Class names are derived from
    // the styles, not the instance, which is the only reason the markup one produces can be
    // hydrated by the other. The cache above is keyed per instance and must not change that.
    const server = countingStitches();
    const browser = countingStitches();

    const classNamesOf = (stitches: unknown) => {
      const html = renderToString(
        <Box
          __compiled={compiled("same", "20px")}
          devices={devices}
          stitches={stitches}
        />,
      );
      return /class="([^"]*)"/.exec(html)?.[1] ?? "";
    };

    expect(classNamesOf(server.stitches)).toBe(classNamesOf(browser.stitches));
  });
});
