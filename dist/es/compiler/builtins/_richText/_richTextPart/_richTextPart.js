/* with love from shopstory */
import { findPathOfFirstAncestorOfType } from '../../../parsePath.js';
import { richTextPartStyles } from './_richTextPart.styles.js';

const editing = _ref => {
  let {
    editingInfo,
    __SECRET_INTERNALS__
  } = _ref;
  if (!__SECRET_INTERNALS__) {
    throw new Error("Missing __SECRET_INTERNALS__");
  }
  const {
    pathPrefix,
    editorContext
  } = __SECRET_INTERNALS__;
  const resultFields = [];
  const richTextPath = findPathOfFirstAncestorOfType(pathPrefix, "@easyblocks/rich-text", editorContext.form);
  const richTextBlockPath = findPathOfFirstAncestorOfType(pathPrefix, "@easyblocks/rich-text-block-element", editorContext.form);
  resultFields.push({
    type: "fields",
    path: richTextPath,
    filters: {
      group: ["Size", "Margins"]
    }
  }, {
    type: "field",
    path: `${richTextPath}.align`
  }, ...editingInfo.fields, {
    type: "field",
    path: `${richTextBlockPath}.type`
  }, {
    type: "field",
    path: `${richTextPath}.isListStyleAuto`
  }, {
    type: "field",
    path: `${richTextPath}.mainFont`
  }, {
    type: "field",
    path: `${richTextPath}.mainColor`
  }, {
    type: "fields",
    path: richTextPath,
    filters: {
      group: ["Accessibility and SEO"]
    }
  });
  return {
    fields: resultFields
  };
};
const richTextPartEditableComponent = {
  id: "@easyblocks/rich-text-part",
  label: "Text",
  schema: [{
    prop: "value",
    type: "string",
    visible: false,
    group: "Text"
  }, {
    prop: "font",
    label: "Style",
    type: "font",
    group: "Text"
  }, {
    prop: "color",
    label: "Color",
    type: "color",
    group: "Text"
  }, {
    prop: "TextWrapper",
    label: "Text Wrapper",
    type: "component",
    noInline: true,
    accepts: ["@easyblocks/text-wrapper"],
    visible: true,
    group: "Text Wrapper",
    isLabelHidden: true
  }],
  editing,
  styles: richTextPartStyles
};

export { richTextPartEditableComponent };
//# sourceMappingURL=_richTextPart.js.map
