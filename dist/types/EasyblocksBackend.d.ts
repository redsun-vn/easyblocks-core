import { Backend, NoCodeComponentEntry, UserDefinedTemplate, Document } from "./types";
type DateString = string;
export type DocumentDTO = {
    archived: boolean;
    config_id: string;
    created_at: DateString;
    id: string;
    project_id: string;
    source: string;
    title: string;
    unique_source_identifier: string | null;
    updated_at: DateString;
    version: number;
    root_container: string | null;
};
export type DocumentWithResolvedConfigDTO = DocumentDTO & {
    config: ConfigDTO;
};
export type ConfigDTO = {
    config: NoCodeComponentEntry;
    created_at: DateString;
    id: string;
    metadata: Record<string, unknown> | null;
    parent_id: string | null;
    project_id: string;
    updated_at: DateString;
};
export type AssetDTO = {
    id: string;
    name: string;
    url: string;
} & ({
    mediaType: "image";
    metadata: {
        width: number;
        height: number;
        mimeType: string;
    };
} | {
    mediaType: "video";
    metadata: {
        mimeType: string;
    };
});
export declare class EasyblocksBackend implements Backend {
    private project?;
    private accessToken;
    private rootUrl;
    constructor(args: {
        accessToken: string;
        rootUrl?: string;
    });
    private init;
    private request;
    private get;
    private post;
    private put;
    private delete;
    documents: {
        get: (payload: {
            id: string;
        }) => Promise<Document>;
        create: (payload: Omit<Document, "id" | "version">) => Promise<Document>;
        update: (payload: Document) => Promise<Document>;
    };
    templates: {
        get: (payload: {
            id: string;
        }) => Promise<UserDefinedTemplate>;
        getAll: () => Promise<UserDefinedTemplate[]>;
        create: (input: {
            label: string;
            entry: NoCodeComponentEntry;
            width?: number;
            widthAuto?: boolean;
        }) => Promise<UserDefinedTemplate>;
        update: (input: {
            id: string;
            label: string;
        }) => Promise<Omit<UserDefinedTemplate, "entry">>;
        delete: (input: {
            id: string;
        }) => Promise<void>;
    };
}
export {};
//# sourceMappingURL=EasyblocksBackend.d.ts.map