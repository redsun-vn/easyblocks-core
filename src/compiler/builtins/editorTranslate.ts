/**
 * The words these editor-side builtins put on the canvas, in the editor's
 * language.
 *
 * The panel around them has been translated for a while; the hints inside the
 * canvas — the grey text an empty block shows — were written in English in the
 * source and stayed English whatever the editor was set to. On a Vietnamese
 * shop that is the only English left on the screen, and it sits in the one
 * place an author is being told what to do.
 *
 * These components already reach the editor through `editorWindowAPI` on the
 * parent window, which is how the canvas talks to the editor across the iframe
 * boundary, and the translation files and the chosen UI language are already on
 * that object. So this reads what is there rather than adding a channel: there
 * is nothing for a host to wire up, and a host that passes no files at all
 * keeps the English it has today.
 */

/** The language the editor falls back to, as the editor itself does. */
const DEFAULT_UI_LOCALE = "en-US";

export function translateInEditor(key: string, fallback: string): string {
  try {
    const editorContext = (window.parent as any)?.editorWindowAPI?.editorContext;
    const files = editorContext?.translationFiles;

    if (!files) {
      return fallback;
    }

    const file =
      (editorContext.uiLocale && files[editorContext.uiLocale]) ||
      files[DEFAULT_UI_LOCALE];
    const translated = file?.[key];

    return typeof translated === "string" && translated !== ""
      ? translated
      : fallback;
  } catch {
    // The canvas renders outside an editor too, and a cross-origin parent
    // throws on access rather than answering. The English is the answer there.
    return fallback;
  }
}
