import type { RequestedExternalData, Config, RenderableDocument } from "./types";
declare function buildDocument({ documentId, config, locale, }: {
    documentId: string;
    config: Config;
    locale: string;
}): Promise<{
    renderableDocument: RenderableDocument;
    externalData: RequestedExternalData;
}>;
export { buildDocument };
//# sourceMappingURL=buildDocument.d.ts.map