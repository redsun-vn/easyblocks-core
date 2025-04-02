import { NoCodeComponentEntry, SchemaProp } from "./types";
import { Component$$$SchemaProp } from "./compiler/schema";
type EasyblocksEditorEventData<Type extends `@easyblocks-editor/${string}${string}`, Payload = never> = Payload extends never ? {
    type: Type;
} : {
    type: Type;
    payload: Payload;
};
type InferShopstoryEditorEventData<Event> = Event extends MessageEvent<EasyblocksEditorEventData<infer Type, infer Payload>> ? EasyblocksEditorEventData<Type, Payload> : never;
type SelectionFramePositionChangedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/selection-frame-position-changed", {
    target: DOMRect;
    container?: DOMRect;
}>>;
declare function selectionFramePositionChanged(target: DOMRect, container?: DOMRect): InferShopstoryEditorEventData<SelectionFramePositionChangedEvent>;
type RichTextChangedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/rich-text-changed", {
    prop: "font" | "color" | "TextWrapper";
    schemaProp: SchemaProp | Component$$$SchemaProp;
    values: Array<Record<string, any> | [] | [NoCodeComponentEntry]>;
}>>;
declare function richTextChangedEvent(payload: InferShopstoryEditorEventData<RichTextChangedEvent>["payload"]): InferShopstoryEditorEventData<RichTextChangedEvent>;
type ComponentPickerOpenedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/component-picker-opened", {
    path: string;
}>>;
declare function componentPickerOpened(path: string): InferShopstoryEditorEventData<ComponentPickerOpenedEvent>;
type ComponentPickerClosedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/component-picker-closed", {
    config?: NoCodeComponentEntry;
}>>;
declare function componentPickerClosed(config?: NoCodeComponentEntry): InferShopstoryEditorEventData<ComponentPickerClosedEvent>;
type ItemInsertedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/item-inserted", {
    name: string;
    index: number;
    block: NoCodeComponentEntry;
}>>;
declare function itemInserted(payload: InferShopstoryEditorEventData<ItemInsertedEvent>["payload"]): InferShopstoryEditorEventData<ItemInsertedEvent>;
type ItemMovedEvent = MessageEvent<EasyblocksEditorEventData<"@easyblocks-editor/item-moved", {
    fromPath: string;
    toPath: string;
    placement?: "before" | "after";
}>>;
declare function itemMoved(payload: InferShopstoryEditorEventData<ItemMovedEvent>["payload"]): InferShopstoryEditorEventData<ItemMovedEvent>;
export { componentPickerClosed, componentPickerOpened, itemInserted, itemMoved, richTextChangedEvent, selectionFramePositionChanged, };
export type { ComponentPickerClosedEvent, ComponentPickerOpenedEvent, InferShopstoryEditorEventData, ItemInsertedEvent, ItemMovedEvent, RichTextChangedEvent, SelectionFramePositionChangedEvent, EasyblocksEditorEventData, };
//# sourceMappingURL=events.d.ts.map