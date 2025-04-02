/* with love from shopstory */
import { serialize } from '@easyblocks/utils';
import { buildEntry } from './buildEntry.js';

async function buildDocument(_ref) {
  let {
    documentId,
    config,
    locale
  } = _ref;
  const {
    entry
  } = await resolveEntryForDocument({
    documentId,
    config,
    locale
  });
  const {
    meta,
    externalData,
    renderableContent,
    configAfterAuto
  } = buildEntry({
    entry,
    config,
    locale
  });
  return {
    renderableDocument: {
      renderableContent,
      meta: serialize(meta),
      configAfterAuto
    },
    externalData
  };
}
async function resolveEntryForDocument(_ref2) {
  let {
    documentId,
    config,
    locale
  } = _ref2;
  try {
    const documentResponse = await config.backend.documents.get({
      id: documentId,
      locale
    });
    if (!documentResponse) {
      throw new Error(`Document with id ${documentId} not found.`);
    }
    return documentResponse;
  } catch {
    throw new Error(`Error fetching document with id ${documentId}.`);
  }
}

export { buildDocument };
