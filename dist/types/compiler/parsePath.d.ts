/**
 * When selecting text within $richText, we keep information about which text parts are selected
 * within focused fields. If the text part is partially selected, we add information about the selection.
 * This selection has format: ".{textPartCharacterSelectionStartIndex,textPartCharacterSelectionEndIndex}".
 * We often want to query related to selection text part component config and to do that correctly we need to
 * strip information about selection.
 */
declare function stripRichTextPartSelection(value: string): string;
export { stripRichTextPartSelection };
export type ParentPathInfo = {
    templateId: string;
    fieldName: string;
    path: string;
};
export type PathInfo = {
    templateId: string;
    /**
     * Relative field name. `undefined` when path IS a component.
     */
    fieldName?: string;
    /**
     * If component is in the collection, then it is its index.
     */
    index?: number;
    parent?: ParentPathInfo;
};
export declare function parsePath(path: string, form: any): PathInfo;
/**
 * The path of the nearest ancestor of that type, or `undefined` when the tree
 * does not hold one.
 *
 * It answers rather than throwing because the caller is the `editing` function
 * of a rich-text part, which runs inside the editor's render. A part that has
 * somehow ended up outside its rich-text tree — after a paste, an undo, or a
 * document edited by hand — used to empty the whole canvas, and an author with
 * an empty canvas has no way to undo whatever put them there.
 */
export declare function findPathOfFirstAncestorOfType(path: string, templateId: string, form: any): string | undefined;
//# sourceMappingURL=parsePath.d.ts.map