import { extractFontsWithWeights } from "./extractFonts";

/** A font value as the compiler stores one: responsive, with the token beside it. */
const font = (family: string, weight?: number, fontStyle?: string) => ({
  $res: true,
  xl: {
    value: {
      fontFamily: family,
      fontSize: 16,
      lineHeight: 1.5,
      ...(weight === undefined ? {} : { fontWeight: weight }),
      ...(fontStyle === undefined ? {} : { fontStyle }),
    },
    tokenId: "some-token",
  },
});

const familyNamed = (family: string, fonts: ReturnType<typeof extractFontsWithWeights>) =>
  fonts.find((entry) => entry.family === family);

describe("extractFontsWithWeights", () => {
  it("collects a family once, with the weights actually used", () => {
    const fonts = extractFontsWithWeights({
      a: font("Roboto", 400),
      b: font("Roboto", 600),
      c: font("Lora", 400),
    });

    expect(familyNamed("Roboto", fonts)).toEqual({
      family: "Roboto",
      weights: [400, 600],
      italics: [],
    });
    expect(familyNamed("Lora", fonts)?.weights).toEqual([400]);
  });

  it("defaults to 400 when the value names no weight", () => {
    const fonts = extractFontsWithWeights({ a: font("Roboto") });

    expect(familyNamed("Roboto", fonts)?.weights).toEqual([400]);
  });

  it("reads an italic written inside the font value", () => {
    const fonts = extractFontsWithWeights({ a: font("Roboto", 400, "italic") });

    expect(familyNamed("Roboto", fonts)).toEqual({
      family: "Roboto",
      weights: [],
      italics: [400],
    });
  });

  /*
   * The case this file exists for. A rich-text part keeps its italic beside its
   * font rather than inside it, so reading only the value left every italic in
   * a rich text without a file — slanted by the browser instead of set.
   */
  it("reads an italic written beside the font, as a rich-text part writes it", () => {
    const fonts = extractFontsWithWeights({
      _component: "@easyblocks/rich-text-part",
      value: "Cửa hàng của bạn",
      fontStyle: "italic",
      font: font("Playfair Display", 500),
    });

    expect(familyNamed("Playfair Display", fonts)).toEqual({
      family: "Playfair Display",
      weights: [],
      italics: [500],
    });
  });

  it("treats oblique as the italic file, which is the closest one served", () => {
    const fonts = extractFontsWithWeights({
      fontStyle: "oblique",
      font: font("Lora", 400),
    });

    expect(familyNamed("Lora", fonts)?.italics).toEqual([400]);
  });

  it("leaves a part's siblings alone", () => {
    const fonts = extractFontsWithWeights({
      elements: [
        {
          _component: "@easyblocks/rich-text-part",
          fontStyle: "italic",
          font: font("Playfair Display", 500),
        },
        {
          _component: "@easyblocks/rich-text-part",
          fontStyle: "normal",
          font: font("Roboto", 400),
        },
      ],
    });

    expect(familyNamed("Playfair Display", fonts)?.italics).toEqual([500]);
    expect(familyNamed("Roboto", fonts)).toEqual({
      family: "Roboto",
      weights: [400],
      italics: [],
    });
  });

  /*
   * An italic component holding a child with a font of its own: the child is
   * not italic, and fetching an italic file for it would be bytes spent on
   * text nobody slants.
   */
  it("does not pass a component's italic down to a child's own font", () => {
    const fonts = extractFontsWithWeights({
      _component: "Something",
      fontStyle: "italic",
      font: font("Playfair Display", 500),
      Label: [
        {
          _component: "Label",
          font: font("Roboto", 400),
        },
      ],
    });

    expect(familyNamed("Roboto", fonts)).toEqual({
      family: "Roboto",
      weights: [400],
      italics: [],
    });
  });

  it("keeps the same family's upright and italic weights apart", () => {
    const fonts = extractFontsWithWeights({
      a: { fontStyle: "italic", font: font("Lora", 400) },
      b: font("Lora", 700),
    });

    expect(familyNamed("Lora", fonts)).toEqual({
      family: "Lora",
      weights: [700],
      italics: [400],
    });
  });
});
