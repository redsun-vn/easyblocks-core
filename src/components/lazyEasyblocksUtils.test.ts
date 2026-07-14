import type { RenderableDocument } from "../types";
import { autoDetectSlot, buildSlicedDocument } from "./lazyEasyblocksUtils";

describe("autoDetectSlot", () => {
  test("returns undefined when components is undefined", () => {
    expect(autoDetectSlot(undefined)).toBeUndefined();
  });

  test("returns undefined when no array slot has children", () => {
    expect(autoDetectSlot({ data: [], footer: [] })).toBeUndefined();
  });

  test("picks the slot with the most children", () => {
    const components = {
      header: [{}],
      data: [{}, {}, {}],
      footer: [{}, {}],
    };

    expect(autoDetectSlot(components)).toBe("data");
  });

  test("ignores non-array entries", () => {
    const components = {
      title: "not-an-array" as unknown as unknown[],
      data: [{}, {}],
    };

    expect(autoDetectSlot(components)).toBe("data");
  });

  test("keeps the first slot on a length tie", () => {
    const components = {
      first: [{}, {}],
      second: [{}, {}],
    };

    expect(autoDetectSlot(components)).toBe("first");
  });
});

describe("buildSlicedDocument", () => {
  function makeDoc(children: unknown[]): RenderableDocument {
    return {
      renderableContent: {
        _component: "$Root",
        _id: "root",
        props: {},
        styled: {},
        components: { data: children as never },
      },
      meta: {} as never,
    };
  }

  test("returns the original document when slot is missing", () => {
    const doc = makeDoc([{ _id: "a" }, { _id: "b" }]);
    expect(buildSlicedDocument(doc, undefined, 3)).toBe(doc);
  });

  test("returns the original document when the slot is empty", () => {
    const doc = makeDoc([]);
    expect(buildSlicedDocument(doc, "data", 3)).toBe(doc);
  });

  test("returns the original document for a null renderableContent", () => {
    const doc: RenderableDocument = {
      renderableContent: null,
      meta: {} as never,
    };
    expect(buildSlicedDocument(doc, "data", 3)).toBe(doc);
  });

  test("slices the target slot to visibleCount", () => {
    const children = [{ _id: "a" }, { _id: "b" }, { _id: "c" }, { _id: "d" }];
    const doc = makeDoc(children);

    const sliced = buildSlicedDocument(doc, "data", 2);
    const slicedChildren = sliced.renderableContent!.components.data;

    expect(slicedChildren).toHaveLength(2);
    expect(slicedChildren[0]).toBe(children[0]);
    expect(slicedChildren[1]).toBe(children[1]);
  });

  test("reuses child references and does not mutate the original", () => {
    const children = [{ _id: "a" }, { _id: "b" }, { _id: "c" }];
    const doc = makeDoc(children);

    const sliced = buildSlicedDocument(doc, "data", 2);

    // Original untouched — protects caller from componentOverrides mutation.
    expect(doc.renderableContent!.components.data).toHaveLength(3);
    expect(sliced).not.toBe(doc);
    expect(sliced.renderableContent).not.toBe(doc.renderableContent);
    expect(sliced.renderableContent!.components).not.toBe(
      doc.renderableContent!.components
    );
    // Child config objects reused by reference (no remount).
    expect(sliced.renderableContent!.components.data[0]).toBe(children[0]);
  });

  test("preserves meta and other slots by reference", () => {
    const children = [{ _id: "a" }, { _id: "b" }];
    const doc = makeDoc(children);
    doc.renderableContent!.components.footer = [{ _id: "f" }] as never;

    const sliced = buildSlicedDocument(doc, "data", 1);

    expect(sliced.meta).toBe(doc.meta);
    expect(sliced.renderableContent!.components.footer).toBe(
      doc.renderableContent!.components.footer
    );
  });
});
