export type Locale = {
    code: string;
    isDefault?: boolean;
    fallback?: string;
};
export declare function getDefaultLocale(locales: Locale[]): Locale;
export declare function getFallbackLocaleForLocale(locale: string, locales: Locale[]): string | undefined;
export declare function getFallbackForLocale<T>(translatedValues: {
    [locale: string]: T | undefined | null;
}, locale: string, locales: Locale[]): T | undefined;
//# sourceMappingURL=locales.d.ts.map