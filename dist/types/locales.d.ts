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
export declare function getDefaultLocale(locales: Locale[]): Locale;
export declare function getFallbackLocaleForLocale(locale: string, locales: Locale[]): string | undefined;
export declare function getFallbackForLocale<T>(translatedValues: {
    [locale: string]: T | undefined | null;
}, locale: string, locales: Locale[]): T | undefined;
//# sourceMappingURL=locales.d.ts.map