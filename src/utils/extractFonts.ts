function traverse(obj: any, visitor: (node: any) => void) {
  if (typeof obj !== "object" || obj === null) return;

  visitor(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item) => traverse(item, visitor));
  } else {
    Object.values(obj).forEach((value) => traverse(value, visitor));
  }
}

export const extractFonts = (entry: any) => {
  const fonts = new Map<string, undefined>();

  traverse(entry, (node) => {
    if (
      node &&
      typeof node === "object" &&
      node.value &&
      typeof node.value === "object" &&
      typeof node.value.fontFamily === "string"
    ) {
      const family = node.value.fontFamily;

      if (!fonts.has(family)) {
        fonts.set(family, undefined);
      }
    }
  });

  return Array.from(fonts.keys());
};
