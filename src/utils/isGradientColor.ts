/**
 * Whether a colour value paints with a gradient rather than one flat colour.
 *
 * It decides how text is painted, and the two ways are not interchangeable. A
 * gradient can only reach glyphs as a background clipped to them, which means
 * the glyphs themselves are drawn transparent; a flat colour goes straight into
 * `color`, where the rest of the platform can see it.
 *
 * Painting a flat colour the gradient way looks identical until something else
 * wants to know what colour the text is — and then it is transparent. A
 * selection is the plainest example: the browser draws its highlight and fills
 * the glyphs with their own colour, so text painted this way disappears into
 * the highlight and an author cannot see which words they have selected.
 */
export const isGradientColor = (color: unknown): boolean =>
  typeof color === "string" && color.toLowerCase().includes("gradient");
