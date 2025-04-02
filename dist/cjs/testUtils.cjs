/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var EasyblocksBackend = require('./EasyblocksBackend.cjs');
var createCompilationContext = require('./compiler/createCompilationContext.cjs');
var dotNotationSet = require('./utils/object/dotNotationSet.cjs');

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
      dotNotationSet.dotNotationSet(this.values, path, value);
    }
  };
}
function createTestCompilationContext() {
  return createCompilationContext.createCompilationContext({
    backend: new EasyblocksBackend.EasyblocksBackend({
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

exports.createFormMock = createFormMock;
exports.createTestCompilationContext = createTestCompilationContext;
