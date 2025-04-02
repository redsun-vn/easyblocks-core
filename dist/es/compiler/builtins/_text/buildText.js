/* with love from shopstory */
import { getDefaultLocale } from '../../../locales.js';
import { uniqueId } from '../../../utils/uniqueId.js';

function buildText(x, editorContext) {
  const defaultLocale = getDefaultLocale(editorContext.locales);
  return {
    id: "locale." + uniqueId(),
    value: {
      [defaultLocale.code]: x
    }
  };
}

export { buildText };
