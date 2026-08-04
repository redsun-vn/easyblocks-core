import { serialize } from "@/utils";
import { buildEntry } from "./buildEntry";
import type {
  Config,
  Document,
  RenderableDocument,
  RequestedExternalData,
} from "./types";
import { extractFontsWithWeights } from "./utils/extractFonts";
import { setGlobalFonts } from "./utils/fonts";

async function buildDocument({
  documentId,
  config,
  locale,
}: {
  documentId: string;
  config: Config;
  locale: string;
}): Promise<{
  renderableDocument: RenderableDocument;
  externalData: RequestedExternalData;
}> {
  const { entry } = await resolveEntryForDocument({
    documentId,
    config,
    locale,
  });

  const fonts = extractFontsWithWeights(entry);
  setGlobalFonts(fonts);

  const { meta, externalData, renderableContent, configAfterAuto } = buildEntry(
    { entry, config, locale },
  );

  return {
    renderableDocument: {
      renderableContent,
      meta: serialize(meta),
      configAfterAuto,
    },
    externalData,
  };
}

export { buildDocument };

async function resolveEntryForDocument({
  documentId,
  config,
  locale,
}: {
  documentId: string;
  config: Config;
  locale: string;
}): Promise<Document> {
  try {
    const documentResponse = await config.backend.documents.get({
      id: documentId,
      locale,
    });

    if (!documentResponse) {
      throw new Error(`Document with id ${documentId} not found.`);
    }

    return documentResponse;
  } catch {
    throw new Error(`Error fetching document with id ${documentId}.`);
  }
}
