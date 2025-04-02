import type { RequestedExternalData, CompilationMetadata, CompiledShopstoryComponentConfig, CompilerModule, NoCodeComponentEntry, Config, ExternalData, ExternalReference } from "./types";
type BuildEntryOptions = {
    entry: NoCodeComponentEntry;
    config: Config;
    locale: string;
    compiler?: CompilerModule;
    externalData?: ExternalData;
    isExternalDataChanged?: (externalData: {
        id: string;
        externalId: ExternalReference["id"];
    }, defaultIsExternalDataChanged: (externalData: {
        id: string;
        externalId: ExternalReference["id"];
    }) => boolean) => boolean;
};
declare function buildEntry({ entry, config, locale, compiler, externalData, isExternalDataChanged, }: BuildEntryOptions): {
    renderableContent: CompiledShopstoryComponentConfig;
    meta: CompilationMetadata;
    externalData: RequestedExternalData;
    configAfterAuto?: NoCodeComponentEntry;
};
export { buildEntry };
//# sourceMappingURL=buildEntry.d.ts.map