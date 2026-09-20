export type Locale = {
  code: string;
  name?: string;
  isDefault?: boolean;
  fallback?: string;
  icon?: string;
};

/**
 * The locale marked default, or the first one when none is.
 *
 * `locales` is shop data, not a developer constant, so a shop whose languages
 * carry no default flag is a configuration a real tenant can end up in. This
 * used to throw, and it is reached from the fallback lookup for every
 * untranslated text on a page — so one unflagged language list blanked the
 * published site and the editor together.
 *
 * The first language is the answer a person would give.
 */
export function getDefaultLocale(locales: Locale[]): Locale {
  const defaultLocale = locales.find((locale) => locale.isDefault);

  if (defaultLocale) {
    return defaultLocale;
  }

  if (locales.length === 0) {
    // No languages at all is a setup mistake, and there is nothing to return.
    throw new Error("getDefaultLocale: the list of locales is empty");
  }

  console.warn(
    `easyblocks: no locale is marked as default; using "${locales[0].code}"`,
  );

  return locales[0];
}

export function getFallbackLocaleForLocale(
  locale: string,
  locales: Locale[],
): string | undefined {
  do {
    const fallbackId =
      locales.find((l) => l.code === locale)?.fallback ??
      getDefaultLocale(locales).code;

    // Default locale, no fallback
    if (fallbackId === locale) {
      return;
    }

    return fallbackId;
  } while (true);
}

export function getFallbackForLocale<T>(
  translatedValues: { [locale: string]: T | undefined | null },
  locale: string,
  locales: Locale[],
): T | undefined {
  while (true) {
    const fallbackLocale = getFallbackLocaleForLocale(locale, locales);

    if (!fallbackLocale) {
      // The chain is exhausted, so fall back to whatever language the value was
      // actually written in. Deliberate, since 279c6a0 (2026-06-02): a shop
      // writes its pages in one language, and a request for a locale nobody
      // configured a chain for must still show the shop's words rather than an
      // empty page. Do not remove this to satisfy an upstream test — upstream
      // returns undefined here, this fork does not.
      const firstLocale = Object.keys(translatedValues)?.[0];

      if (!firstLocale) {
        return;
      }

      return translatedValues[firstLocale] ?? undefined;
    }

    const fallbackValue = translatedValues[fallbackLocale];

    if (fallbackValue !== undefined && fallbackValue !== null) {
      return fallbackValue;
    }

    locale = fallbackLocale;
  }
}
