/**
 * @jest-environment node
 *
 * Stitches writes into the document's CSSOM whenever one exists, so under jsdom
 * `getCssText()` answers with nothing; the precomputation runs on the server anyway.
 */
import React from "react";
import { renderToString } from "react-dom/server";
import { Devices } from "../../types";
import { createEasyblocksStitches } from "../ssr";
import { Box } from "./Box";
import { precomputeBoxClassNames } from "./precompute-box-class-names";

const devices: Devices = [
  { id: "xs", w: 375, h: 667, breakpoint: 568 },
  { id: "md", w: 768, h: 1024, breakpoint: 992 },
  { id: "xl", w: 1440, h: 900, breakpoint: null },
];

/** A compiled tree with the shapes a page carries: breakpoints, `__as`, no `__hash`, nesting. */
function compiledTree() {
  return {
    _component: "BlockRow",
    _id: "row",
    styled: {
      Root: {
        __isBox: true,
        __hash: "root",
        display: "grid",
        paddingTop: "48px",
        "@xs": { paddingTop: "16px" },
        "@md": { paddingTop: "32px" },
      },
      Title: {
        __isBox: true,
        __hash: "title",
        __as: "span",
        fontWeight: 700,
      },
      Items: [{ __isBox: true, color: "red" }],
    },
    components: {
      Columns: [
        {
          _component: "BlockColumn",
          _id: "column",
          styled: {
            Root: { __isBox: true, __hash: "column", flexDirection: "column" },
          },
          components: {},
        },
      ],
    },
    // Not under `styled`, so nothing renders it as a Box: it must stay as it is.
    props: { sample: { __isBox: true, keep: "me" } },
  };
}

/** Every Box object under `styled`, in walk order, as [path, object]. */
function boxesOf(value: any, path = "", inStyled = false): Array<[string, any]> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      boxesOf(item, `${path}.${index}`, inStyled),
    );
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  if (inStyled && value.__isBox) {
    return [[path, value]];
  }

  return Object.keys(value).flatMap((key) =>
    boxesOf(value[key], `${path}.${key}`, inStyled || key === "styled"),
  );
}

function renderedClass(compiled: any, stitches: any) {
  const html = renderToString(
    <Box __compiled={compiled} devices={devices} stitches={stitches} />,
  );

  return {
    tag: /^<(\w+)/.exec(html)![1],
    className: /class="([^"]*)"/.exec(html)![1],
  };
}

describe("precomputeBoxClassNames", () => {
  it("gives each Box the class string Box itself would render", () => {
    const tree = compiledTree();
    const { stitches } = createEasyblocksStitches();
    const expected = boxesOf(tree).map(([path, box]) => [
      path,
      renderedClass(box, stitches).className,
    ]);

    const { renderableContent } = precomputeBoxClassNames(tree, devices);
    const actual = boxesOf(renderableContent).map(([path, box]) => [
      path,
      box.__className,
    ]);

    expect(actual).toEqual(expected);
    expect(actual).toHaveLength(4);
  });

  it("returns a rule for every generated class", () => {
    const { renderableContent, css } = precomputeBoxClassNames(
      compiledTree(),
      devices,
    );
    const tokens = boxesOf(renderableContent).flatMap(([, box]) =>
      box.__className.split(" "),
    );

    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      expect(css).toContain(`.${token}`);
    }
    expect(css).toContain("@media (max-width: 567px)");
  });

  it("keeps __as and drops the style values", () => {
    const { renderableContent } = precomputeBoxClassNames(
      compiledTree(),
      devices,
    );
    const title = (renderableContent as any).styled.Title;

    expect(Object.keys(title).sort()).toEqual(["__as", "__className", "__isBox"]);
    expect(title.__as).toBe("span");
  });

  it("leaves objects outside styled alone and does not change its input", () => {
    const tree = compiledTree();
    const before = JSON.parse(JSON.stringify(tree));
    const { renderableContent } = precomputeBoxClassNames(tree, devices);

    expect(tree).toEqual(before);
    expect((renderableContent as any).props).toBe(tree.props);
  });
});

describe("Box with a precomputed class", () => {
  it("renders the given class and element, and generates no CSS", () => {
    const { stitches, getCssText } = createEasyblocksStitches();
    const sheetBefore = getCssText();

    const rendered = renderedClass(
      { __isBox: true, __as: "p", __className: "a b" },
      stitches,
    );

    expect(rendered).toEqual({ tag: "p", className: "a b" });
    expect(getCssText()).toBe(sheetBefore);
  });
});
