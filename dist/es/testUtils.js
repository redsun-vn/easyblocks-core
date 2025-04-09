/* with love from shopstory */
import { EasyblocksBackend } from './EasyblocksBackend.js';
import { createCompilationContext } from './compiler/createCompilationContext.js';
import { dotNotationSet } from './utils/object/dotNotationSet.js';

function createFormMock() {
  let initialValues = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    reset() {
      this.values = initialValues;
    },
    values: initialValues,
    change(path, value) {
      if (path === "") {
        this.values = value;
        return;
      }
      dotNotationSet(this.values, path, value);
    }
  };
}
function createTestCompilationContext() {
  return createCompilationContext({
    backend: new EasyblocksBackend({
      accessToken: ""
    }),
    locales: [{
      code: "en",
      isDefault: true
    }],
    components: [{
      id: "TestComponent",
      schema: []
    }]
  }, {
    locale: "en"
  }, "TestComponent");
}

export { createFormMock, createTestCompilationContext };
//# sourceMappingURL=testUtils.js.map
