/* with love from shopstory */
import { dotNotationSet } from '@easyblocks/utils';
import { EasyblocksBackend } from './EasyblocksBackend.js';
import { createCompilationContext } from './compiler/createCompilationContext.js';

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
