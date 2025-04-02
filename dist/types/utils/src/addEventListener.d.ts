declare function addEventListener<EventName extends keyof WindowEventMap>(target: EventTarget, type: EventName, listener: (event: WindowEventMap[EventName]) => void, options?: boolean | AddEventListenerOptions): () => void;
export { addEventListener };
//# sourceMappingURL=addEventListener.d.ts.map