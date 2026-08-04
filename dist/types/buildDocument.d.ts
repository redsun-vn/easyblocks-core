import type { Config, RenderableDocument, RequestedExternalData } from "./types";
import { ExtractedFont } from "./utils/extractFonts";
declare function buildDocument({ documentId, config, locale, }: {
    documentId: string;
    config: Config;
    locale: string;
}): Promise<{
    renderableDocument: RenderableDocument;
    externalData: RequestedExternalData;
    fonts: ExtractedFont[];
}>;
export { buildDocument };
//# sourceMappingURL=buildDocument.d.ts.map