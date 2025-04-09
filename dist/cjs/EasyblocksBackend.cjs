/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const AUTH_HEADER = "x-shopstory-access-token";
class EasyblocksBackend {
  constructor(args) {
    this.accessToken = args.accessToken;
    this.rootUrl = args.rootUrl ?? "https://app.easyblocks.io";
  }
  async init() {
    // don't reinitialize
    if (this.project) {
      return;
    }

    // Set project!
    const response = await this.get("/projects");
    if (response.ok) {
      const projects = await response.json();
      if (projects.length === 0) {
        throw new Error("Authorization error. Have you provided a correct access token?");
      }
      this.project = projects[0];
    } else {
      throw new Error("Initialization error in ApiClient");
    }
  }
  async request(path, options) {
    const apiRequestUrl = new URL(`${this.rootUrl}/api${path}`);
    if (options.searchParams && Object.keys(options.searchParams).length > 0) {
      for (const [key, value] of Object.entries(options.searchParams)) {
        if (Array.isArray(value)) {
          value.forEach(value => {
            apiRequestUrl.searchParams.append(key, value);
          });
        } else {
          apiRequestUrl.searchParams.set(key, value);
        }
      }
    }
    const headers = {
      ...(path.includes("assets") ? {} : {
        "Content-Type": "application/json"
      }),
      ...options.headers,
      [AUTH_HEADER]: this.accessToken
    };
    const body = options.body ? typeof options.body === "object" && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body : undefined;
    return fetch(apiRequestUrl.toString(), {
      method: options.method,
      headers,
      body
    });
  }
  async get(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "GET"
    });
  }
  async post(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "POST"
    });
  }
  async put(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "PUT"
    });
  }
  async delete(path) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.request(path, {
      ...options,
      method: "DELETE"
    });
  }
  documents = {
    get: async payload => {
      await this.init();
      const response = await this.get(`/projects/${this.project.id}/documents/${payload.id}`, {
        searchParams: {
          format: "full"
        }
      });
      if (response.ok) {
        return documentWithResolvedConfigDTOToDocument(await response.json());
      }
      throw new Error("Failed to get document");
    },
    create: async payload => {
      await this.init();
      const response = await this.post(`/projects/${this.project.id}/documents`, {
        body: {
          title: "Untitled",
          config: payload.entry,
          rootContainer: payload.entry._component
        }
      });
      if (response.ok) {
        return documentDTOToDocument(await response.json(), payload.entry);
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error("Failed to save document");
    },
    update: async payload => {
      await this.init();
      const response = await this.put(`/projects/${this.project.id}/documents/${payload.id}`, {
        body: {
          version: payload.version,
          config: payload.entry
        }
      });
      if (response.ok) {
        return documentDTOToDocument(await response.json(), payload.entry);
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      throw new Error("Failed to update document");
    }
  };
  templates = {
    get: async payload => {
      await this.init();

      // dummy inefficient implementation
      const allTemplates = await this.templates.getAll();
      const template = allTemplates.find(template => template.id === payload.id);
      if (!template) {
        throw new Error("Template not found");
      }
      return template;
    },
    getAll: async () => {
      await this.init();
      try {
        const response = await this.get(`/projects/${this.project.id}/templates`);
        const data = await response.json();
        const templates = data.map(item => ({
          id: item.id,
          label: item.label,
          entry: item.config.config,
          isUserDefined: true,
          width: item.width,
          widthAuto: item.widthAuto
        }));
        return templates;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    create: async input => {
      await this.init();
      const payload = {
        label: input.label,
        config: input.entry,
        masterTemplateIds: [],
        width: input.width,
        widthAuto: input.widthAuto
      };
      const response = await this.request(`/projects/${this.project.id}/templates`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (response.status !== 200) {
        throw new Error("couldn't create template");
      }
      const json = await response.json();
      return {
        id: json.id,
        label: json.label,
        entry: input.entry,
        isUserDefined: true
      };
    },
    update: async input => {
      await this.init();
      const payload = {
        label: input.label,
        masterTemplateIds: []
      };
      const response = await this.request(`/projects/${this.project.id}/templates/${input.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      console.log("update template json", json);
      if (response.status !== 200) {
        throw new Error();
      }
      return {
        id: json.id,
        label: json.label,
        isUserDefined: true
      };
    },
    delete: async input => {
      await this.init();
      const response = await this.request(`/projects/${this.project.id}/templates/${input.id}`, {
        method: "DELETE"
      });
      if (response.status !== 200) {
        throw new Error();
      }
    }
  };
}
function documentDTOToDocument(documentDTO, entry) {
  if (!documentDTO.root_container) {
    throw new Error("unexpected server error");
  }
  return {
    id: documentDTO.id,
    version: documentDTO.version,
    entry
  };
}
function documentWithResolvedConfigDTOToDocument(documentWithResolvedConfigDTO) {
  return documentDTOToDocument(documentWithResolvedConfigDTO, documentWithResolvedConfigDTO.config.config);
}

exports.EasyblocksBackend = EasyblocksBackend;
//# sourceMappingURL=EasyblocksBackend.cjs.map
