'use client';
/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var $richText_client = require('../compiler/builtins/_richText/_richText.client.cjs');
var $richTextBlockElement_client = require('../compiler/builtins/_richText/_richTextBlockElement/_richTextBlockElement.client.cjs');
var $richTextLineElement_client = require('../compiler/builtins/_richText/_richTextLineElement/_richTextLineElement.client.cjs');
var $richTextPart_client = require('../compiler/builtins/_richText/_richTextPart/_richTextPart.client.cjs');
var $text_client = require('../compiler/builtins/_text/_text.client.cjs');
var ComponentBuilder = require('./ComponentBuilder/ComponentBuilder.cjs');
var EasyblocksExternalDataProvider = require('./EasyblocksExternalDataProvider.cjs');
var EasyblocksMetadataProvider = require('./EasyblocksMetadataProvider.cjs');
var MissingComponent = require('./MissingComponent.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const builtinComponents = {
  "@easyblocks/missing-component": MissingComponent.MissingComponent,
  "@easyblocks/rich-text.client": $richText_client.RichTextClient,
  "@easyblocks/rich-text-block-element": $richTextBlockElement_client.RichTextBlockElementClient,
  "@easyblocks/rich-text-line-element": $richTextLineElement_client.RichTextLineElementClient,
  "@easyblocks/rich-text-part": $richTextPart_client.RichTextPartClient,
  "@easyblocks/text.client": $text_client.TextClient,
  "EditableComponentBuilder.client": ComponentBuilder.ComponentBuilder
};
function Easyblocks(_ref) {
  let {
    renderableDocument,
    externalData,
    componentOverrides,
    components
  } = _ref;
  React.useEffect(() => {
    document.documentElement.style.setProperty("--shopstory-viewport-width", `calc(100vw - ${window.innerWidth - document.documentElement.clientWidth}px)`);
  });
  const renderableContent = renderableDocument.renderableContent;
  if (renderableContent === null) {
    return null;
  }
  if (componentOverrides) {
    const overridesEntries = Object.entries(componentOverrides);
    overridesEntries.forEach(_ref2 => {
      let [componentProp, componentOverride] = _ref2;
      renderableContent.components[componentProp] = [componentOverride];
    });
  }
  return /*#__PURE__*/React__default["default"].createElement(EasyblocksMetadataProvider.EasyblocksMetadataProvider, {
    meta: renderableDocument.meta
  }, /*#__PURE__*/React__default["default"].createElement(EasyblocksExternalDataProvider.EasyblocksExternalDataProvider, {
    externalData: externalData ?? {}
  }, /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.ComponentBuilder, {
    compiled: renderableContent,
    path: "",
    components: {
      ...components,
      ...builtinComponents
    }
  })));
}

exports.Easyblocks = Easyblocks;
//# sourceMappingURL=Easyblocks.cjs.map
