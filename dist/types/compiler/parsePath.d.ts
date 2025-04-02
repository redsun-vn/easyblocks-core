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
export declare function findPathOfFirstAncestorOfType(path: string, templateId: string, form: any): string;
//# sourceMappingURL=parsePath.d.ts.map