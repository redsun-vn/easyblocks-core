/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getDefaultLocale(locales) {
  const defaultLocale = locales.find(locale => locale.isDefault);
  if (!defaultLocale) {
    throw new Error("No default locale found");
  }
  return defaultLocale;
}
function getFallbackLocaleForLocale(locale, locales) {
  do {
    const fallbackId = locales.find(l => l.code === locale)?.fallback ?? getDefaultLocale(locales).code;

    // Default locale, no fallback
    if (fallbackId === locale) {
      return;
    }
    return fallbackId;
  } while (true);
}
function getFallbackForLocale(translatedValues, locale, locales) {
  while (true) {
    const fallbackLocale = getFallbackLocaleForLocale(locale, locales);
    if (!fallbackLocale) {
      return;
    }
    const fallbackValue = translatedValues[fallbackLocale];
    if (fallbackValue !== undefined && fallbackValue !== null) {
      return fallbackValue;
    }
    locale = fallbackLocale;
  }
}

exports.getDefaultLocale = getDefaultLocale;
exports.getFallbackForLocale = getFallbackForLocale;
exports.getFallbackLocaleForLocale = getFallbackLocaleForLocale;
//# sourceMappingURL=locales.cjs.map
