import { richTextPartStyles } from "./$richTextPart.styles";

const styleFor = (color: string, isEditing = false) =>
  (
    richTextPartStyles({
      values: {
        color,
        font: { fontSize: 16 },
        value: "Cửa hàng của bạn",
        TextWrapper: [],
        fontStyle: "normal",
      },
      isEditing,
    } as any) as any
  ).styled.Text;

describe("richTextPartStyles", () => {
  /*
   * The whole point of this file. A flat colour used to be painted as a
   * background clipped to the glyphs, which leaves the glyphs transparent — so
   * selecting the words showed the highlight and nothing inside it, and an
   * author could not see what they had just selected.
   */
  it("paints a flat colour into `color`, where a selection can find it", () => {
    const styles = styleFor("#252525");

    expect(styles.color).toBe("#252525");
    expect(styles.backgroundClip).toBeUndefined();
    expect(styles["&::selection"]).toBeUndefined();
  });

  it("reads rgb() as flat too", () => {
    expect(styleFor("rgb(22, 8, 8)").color).toBe("rgb(22, 8, 8)");
  });

  it("clips a gradient to the glyphs, because there is no other way to paint one", () => {
    const styles = styleFor("linear-gradient(90deg, #ff0000, #0000ff)");

    expect(styles.background).toBe("linear-gradient(90deg, #ff0000, #0000ff)");
    expect(styles.backgroundClip).toBe("text");
    expect(styles.color).toBe("transparent");
  });

  // Gradient glyphs stay transparent, so the selection needs a fill of its own
  // or it swallows them exactly as before.
  it("gives gradient text a fill while it is selected", () => {
    const styles = styleFor("radial-gradient(#fff, #000)");

    expect(styles["&::selection"]).toEqual({ WebkitTextFillColor: "#111111" });
  });

  it("still lets Slate's spans inherit while editing", () => {
    const styles = styleFor("#252525", true);

    expect(styles['& [data-slate-string="true"]']).toEqual({
      fontFamily: "inherit",
      fontStyle: "inherit",
      color: "inherit",
    });
  });
});
