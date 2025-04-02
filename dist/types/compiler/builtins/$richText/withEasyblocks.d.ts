import { Editor } from "slate";
/**
 * Keeps track what was the previous id before generating the unique id. This is needed because Slate rerenders before
 * our config updates and it wouldn't know which compiled component to render.
 */
export declare const NORMALIZED_IDS_TO_IDS: Map<string, string>;
declare function withEasyblocks(editor: Editor): Editor;
export { withEasyblocks };
//# sourceMappingURL=withEasyblocks.d.ts.map