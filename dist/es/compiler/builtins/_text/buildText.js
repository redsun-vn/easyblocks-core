/* with love from shopstory */
import { uniqueId } from '@easyblocks/utils';
import { getDefaultLocale } from '../../../locales.js';

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
