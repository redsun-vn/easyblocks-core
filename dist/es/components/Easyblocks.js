'use client';
/* with love from shopstory */
import React, { useEffect } from 'react';
import { RichTextClient } from '../compiler/builtins/_richText/_richText.client.js';
import { RichTextBlockElementClient } from '../compiler/builtins/_richText/_richTextBlockElement/_richTextBlockElement.client.js';
import { RichTextLineElementClient } from '../compiler/builtins/_richText/_richTextLineElement/_richTextLineElement.client.js';
import { RichTextPartClient } from '../compiler/builtins/_richText/_richTextPart/_richTextPart.client.js';
import { TextClient } from '../compiler/builtins/_text/_text.client.js';
import { ComponentBuilder } from './ComponentBuilder/ComponentBuilder.js';
import { EasyblocksExternalDataProvider } from './EasyblocksExternalDataProvider.js';
import { EasyblocksMetadataProvider } from './EasyblocksMetadataProvider.js';
import { MissingComponent } from './MissingComponent.js';

const builtinComponents = {
  "@easyblocks/missing-component": MissingComponent,
  "@easyblocks/rich-text.client": RichTextClient,
  "@easyblocks/rich-text-block-element": RichTextBlockElementClient,
  "@easyblocks/rich-text-line-element": RichTextLineElementClient,
  "@easyblocks/rich-text-part": RichTextPartClient,
  "@easyblocks/text.client": TextClient,
  "EditableComponentBuilder.client": ComponentBuilder
};
function Easyblocks(_ref) {
  let {
    renderableDocument,
    externalData,
    componentOverrides,
    components
  } = _ref;
  useEffect(() => {
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
  return /*#__PURE__*/React.createElement(EasyblocksMetadataProvider, {
    meta: renderableDocument.meta
  }, /*#__PURE__*/React.createElement(EasyblocksExternalDataProvider, {
    externalData: externalData ?? {}
  }, /*#__PURE__*/React.createElement(ComponentBuilder, {
    compiled: renderableContent,
    path: "",
    components: {
      ...components,
      ...builtinComponents
    }
  })));
}

export { Easyblocks };
