'use client';
/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('@babel/runtime/helpers/extends');
var throttle = require('lodash/throttle');
var React = require('react');
var reactDom = require('react-dom');
var slate = require('slate');
var slateReact = require('slate-react');
var Box = require('../../../components/Box/Box.cjs');
var ComponentBuilder = require('../../../components/ComponentBuilder/ComponentBuilder.cjs');
var locales = require('../../../locales.cjs');
var box = require('../../box.cjs');
var devices = require('../../devices.cjs');
var duplicateConfig = require('../../duplicateConfig.cjs');
var $richText_constants = require('./_richText.constants.cjs');
var $richTextPart_client = require('./_richTextPart/_richTextPart.client.cjs');
var getAbsoluteRichTextPartPath = require('./getAbsoluteRichTextPartPath.cjs');
var richTextEditorActions = require('./richTextEditorActions.cjs');
var convertEditorValueToRichTextElements = require('./utils/convertEditorValueToRichTextElements.cjs');
var convertRichTextElementsToEditorValue = require('./utils/convertRichTextElementsToEditorValue.cjs');
var createTemporaryEditor = require('./utils/createTemporaryEditor.cjs');
var extractElementsFromCompiledComponents = require('./utils/extractElementsFromCompiledComponents.cjs');
var extractTextPartsFromCompiledComponents = require('./utils/extractTextPartsFromCompiledComponents.cjs');
var getEditorSelectionFromFocusedFields = require('./utils/getEditorSelectionFromFocusedFields.cjs');
var getFocusedFieldsFromSlateSelection = require('./utils/getFocusedFieldsFromSlateSelection.cjs');
var getFocusedRichTextPartsConfigPaths = require('./utils/getFocusedRichTextPartsConfigPaths.cjs');
var getRichTextComponentConfigFragment = require('./utils/getRichTextComponentConfigFragment.cjs');
var withEasyblocks = require('./withEasyblocks.cjs');
var dotNotationGet = require('../../../utils/object/dotNotationGet.cjs');
var deepClone = require('../../../utils/deepClone.cjs');
var deepCompare = require('../../../utils/deepCompare.cjs');
var responsiveValueFill = require('../../../responsiveness/responsiveValueFill.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends);
var throttle__default = /*#__PURE__*/_interopDefaultLegacy(throttle);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function RichTextEditor(props) {
  const {
    editorContext
  } = window.parent.editorWindowAPI;
  const {
    actions,
    contextParams,
    form,
    focussedField,
    locales: locales$1,
    setFocussedField
  } = editorContext;
  const {
    __easyblocks: {
      path,
      runtime: {
        resop,
        stitches,
        devices
      }
    },
    align
  } = props;
  let richTextConfig = dotNotationGet.dotNotationGet(form.values, path);
  const [editor] = React.useState(() => withEasyblocks.withEasyblocks(slateReact.withReact(slate.createEditor())));
  const localizedRichTextElements = richTextConfig.elements[contextParams.locale];
  const fallbackRichTextElements = locales.getFallbackForLocale(richTextConfig.elements, contextParams.locale, locales$1);
  const richTextElements = localizedRichTextElements ?? fallbackRichTextElements;
  const richTextElementsConfigPath = `${path}.elements.${contextParams.locale}`;
  const [editorValue, setEditorValue] = React.useState(() => convertRichTextElementsToEditorValue.convertRichTextElementsToEditorValue(richTextElements));

  // If rich text has no value, we initialize it with default config by updating it during first render
  // This is only possible when we open entry for non main locale without fallback, this is total edge case
  if (richTextElements.length === 0 && !fallbackRichTextElements) {
    // We only want to show rich text for default config within this component, we don't want to update raw content
    // To prevent implicit update of raw content we make a deep copy.
    richTextConfig = deepClone.deepClone(richTextConfig);
    richTextConfig.elements[contextParams.locale] = convertEditorValueToRichTextElements.convertEditorValueToRichTextElements(editorValue);
  }

  /**
   * Controls the visibility of decoration imitating browser selection of
   * the selected text after the user has blurred the content editable element.
   */
  const [isDecorationActive, setIsDecorationActive] = React.useState(false);

  /**
   * Keeps track what caused last change to editor value.
   * This is used in two cases:
   * - text-only changes of editable content shouldn't trigger update of `editor.children` ("text-input")
   * - changes from outside of editable content shouldn't trigger writing to editor's history within change callback ("external")
   */
  const lastChangeReason = React.useRef("text-input");

  /**
   * Whether the content editable is enabled or not. We enable it through double click.
   */
  const [isEnabled, setIsEnabled] = React.useState(false);
  const previousRichTextComponentConfig = React.useRef();
  const currentSelectionRef = React.useRef(null);
  const isConfigChanged = !isConfigEqual(previousRichTextComponentConfig.current, richTextConfig);
  if (previousRichTextComponentConfig.current && isConfigChanged) {
    if (lastChangeReason.current !== "paste") {
      lastChangeReason.current = "external";
    }
    previousRichTextComponentConfig.current = richTextConfig;
    const nextEditorValue = convertRichTextElementsToEditorValue.convertRichTextElementsToEditorValue(richTextElements);
    // React bails out the render if state setter function is invoked during the render phase.
    // Doing it makes Slate always up-to date with the latest config if it's changed from outside.
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    setEditorValue(nextEditorValue);
    editor.children = nextEditorValue;
    if (isEnabled) {
      const newEditorSelection = getEditorSelectionFromFocusedFields.getEditorSelectionFromFocusedFields(focussedField, form);
      if (isDecorationActive) {
        currentSelectionRef.current = newEditorSelection;
      } else {
        // Slate gives us two methods to update its selection:
        // - `setSelection` updates current selection, so `editor.selection` must be not null
        // - `select` sets the selection, so `editor.selection` must be null
        if (newEditorSelection !== null && editor.selection !== null) {
          slate.Transforms.setSelection(editor, newEditorSelection);
        } else if (newEditorSelection !== null && editor.selection === null) {
          slate.Transforms.select(editor, newEditorSelection);
        } else {
          slate.Transforms.deselect(editor);
        }
      }
    }
  }
  React.useLayoutEffect(() => {
    if (isDecorationActive && currentSelectionRef.current !== null && !slate.Range.isCollapsed(currentSelectionRef.current)) {
      splitStringNodes(editor, currentSelectionRef.current);
      return () => {
        unwrapStringNodesContent(editor);
      };
    }
  }, [editor, isDecorationActive, richTextConfig]);
  const isRichTextActive = focussedField.some(focusedField => focusedField.startsWith(path));
  React.useLayoutEffect(() => {
    // When rich text becomes inactive we want to restore all original [data-slate-string] nodes
    // by removing all span wrappers that we added to show the mocked browser selection.
    if (!isRichTextActive) {
      unwrapStringNodesContent(editor);
    }
  }, [editor, isRichTextActive]);
  React.useEffect(() => {
    // We set previous value of rich text only once, then we manually assign it when needed.
    previousRichTextComponentConfig.current = richTextConfig;
  }, []);
  React.useEffect(
  // Component is blurred when the user selects other component in editor. This is different from blurring content editable.
  // Content editable can be blurred, but the component can remain active ex. when we select some text within content editable
  // and want to update its color from the sidebar.
  function handleRichTextBlur() {
    if (!isRichTextActive && isEnabled) {
      // editor.children = deepClone(editorValue);
      setIsEnabled(false);
      currentSelectionRef.current = null;
    }
    if (!editor.selection) {
      return;
    }
    if (!isRichTextActive) {
      slate.Transforms.deselect(editor);
      const isSlateValueEmpty = isEditorValueEmpty(editor.children);

      // When value for current locale is empty we want to show value from fallback value instead of placeholder
      // if the fallback value is present.
      if (isSlateValueEmpty && fallbackRichTextElements !== undefined) {
        const nextRichTextElement = deepClone.deepClone(richTextConfig);
        delete nextRichTextElement.elements[contextParams.locale];
        editor.children = convertRichTextElementsToEditorValue.convertRichTextElementsToEditorValue(fallbackRichTextElements);
        form.change(path, nextRichTextElement);
      }
    }
  }, [focussedField, isEnabled, isRichTextActive]);
  React.useEffect(() => {
    // If editor has been refocused and it was blurred earlier we have to disable the decoration to show only browser selection
    if (slateReact.ReactEditor.isFocused(editor) && isDecorationActive) {
      setIsDecorationActive(false);
    }
  });
  React.useEffect(() => {
    function handleRichTextChanged(event) {
      if (!editor.selection) {
        return;
      }
      if (event.data.type === "@easyblocks-editor/rich-text-changed") {
        const {
          payload
        } = event.data;
        const {
          editorContext
        } = window.parent.editorWindowAPI;

        // Slate is an uncontrolled component and we don't have an easy access to control it.
        // It keeps its state internally and on each change we convert this state to our format.
        // This works great because changing content of editable element is easy, we append or remove things.
        // When we change the color/font of selected text there are many questions:
        // - is the current selection partial or does it span everything?
        // - how to split text chunks when selection is partial?
        // - how to update selection?
        //
        // `Editor.addMark` method automatically will split (or not) text chunks, update selection etc.
        // It will just do all the painful things. After the Slate do its job, we take its current state after the update
        // and convert it to entry and correct focused fields.
        const temporaryEditor = createTemporaryEditor.createTemporaryEditor(editor);
        const updateSelectionResult = richTextEditorActions.updateSelection(temporaryEditor, payload.prop, ...payload.values);
        if (!updateSelectionResult) {
          return;
        }
        currentSelectionRef.current = temporaryEditor.selection;
        actions.runChange(() => {
          const newRichTextElement = {
            ...richTextConfig,
            elements: {
              ...richTextConfig.elements,
              [editorContext.contextParams.locale]: updateSelectionResult.elements
            }
          };
          form.change(path, newRichTextElement);
          const newFocusedFields = updateSelectionResult.focusedRichTextParts.map(focusedRichTextPart => getAbsoluteRichTextPartPath.getAbsoluteRichTextPartPath(focusedRichTextPart, path, editorContext.contextParams.locale));
          return newFocusedFields;
        });
      }
    }
    window.addEventListener("message", handleRichTextChanged);
    return () => {
      window.removeEventListener("message", handleRichTextChanged);
    };
  }, [richTextConfig, path]);
  const decorate = createTextSelectionDecorator(editor);
  const Elements = extractElementsFromCompiledComponents.extractElementsFromCompiledComponents(props);
  function renderElement(_ref) {
    let {
      attributes,
      children,
      element
    } = _ref;
    const Element = Elements.find(Element => Element._id === element.id || withEasyblocks.NORMALIZED_IDS_TO_IDS.get(element.id) === Element._id);
    if (!Element) {
      // This can only happen if the current locale has no value and has no fallback
      if (Elements.length === 0) {
        if (element.type === "list-item") {
          return /*#__PURE__*/React__default["default"].createElement("div", attributes, /*#__PURE__*/React__default["default"].createElement("div", null, children));
        }
        return /*#__PURE__*/React__default["default"].createElement("div", attributes, children);
      }
      throw new Error("Missing element");
    }
    const compiledStyles = (() => {
      if (Element._component === "@easyblocks/rich-text-block-element") {
        if (Element.props.type === "bulleted-list") {
          return Element.styled.BulletedList;
        } else if (Element.props.type === "numbered-list") {
          return Element.styled.NumberedList;
        } else if (Element.props.type === "paragraph") {
          return Element.styled.Paragraph;
        }
      } else if (Element._component === "@easyblocks/rich-text-line-element") {
        if (element.type === "text-line") {
          return Element.styled.TextLine;
        } else if (element.type === "list-item") {
          return Element.styled.ListItem;
        }
      }
    })();
    if (compiledStyles === undefined) {
      throw new Error("Unknown element type");
    }
    return /*#__PURE__*/React__default["default"].createElement(Box.Box, _extends__default["default"]({
      __compiled: compiledStyles,
      devices: devices,
      stitches: stitches
    }, attributes, process.env.NODE_ENV === "development" && {
      "data-shopstory-element-type": element.type,
      "data-shopstory-id": element.id
    }), element.type === "list-item" ? /*#__PURE__*/React__default["default"].createElement("div", null, children) : children);
  }
  const TextParts = extractTextPartsFromCompiledComponents.extractTextPartsFromCompiledComponents(props);
  function renderLeaf(_ref2) {
    let {
      attributes,
      children,
      leaf
    } = _ref2;
    let TextPart = TextParts.find(TextPart => {
      return TextPart._id === leaf.id;
    });
    if (!TextPart) {
      TextPart = TextParts.find(TextPart => {
        return withEasyblocks.NORMALIZED_IDS_TO_IDS.get(leaf.id) === TextPart._id;
      });
    }
    if (!TextPart) {
      // This can only happen if the current locale has no value and has no fallback
      if (TextParts.length === 0) {
        return /*#__PURE__*/React__default["default"].createElement("span", attributes, children);
      }
      throw new Error("Missing part");
    }
    const TextPartComponent = /*#__PURE__*/React__default["default"].createElement($richTextPart_client.RichTextPartClient, {
      value: children,
      Text: /*#__PURE__*/React__default["default"].createElement(Box.Box, _extends__default["default"]({
        __compiled: TextPart.styled.Text,
        devices: devices,
        stitches: stitches
      }, attributes)),
      TextWrapper: TextPart.components.TextWrapper[0] ? /*#__PURE__*/React__default["default"].createElement(ComponentBuilder.ComponentBuilder, {
        compiled: TextPart.components.TextWrapper[0],
        path: path,
        components: editorContext.components,
        passedProps: {
          __isSelected: leaf.isHighlighted && leaf.highlightType === "textWrapper"
        }
      }) : undefined
    });
    return TextPartComponent;
  }

  // Setting `display: flex` for element's aligning on `Editable` component makes default styles
  // of placeholder insufficient thus they require to explicitly set `top` and `left`.
  function renderPlaceholder(_ref3) {
    let {
      attributes,
      children
    } = _ref3;
    return /*#__PURE__*/React__default["default"].createElement("span", _extends__default["default"]({}, attributes, {
      style: {
        ...attributes.style,
        top: 0,
        left: 0
      }
    }), children);
  }
  const scheduleConfigSync = React.useCallback(throttle__default["default"](nextValue => {
    setEditorValue(nextValue);
    const nextElements = convertEditorValueToRichTextElements.convertEditorValueToRichTextElements(nextValue);
    actions.runChange(() => {
      const newRichTextElement = {
        ...richTextConfig,
        elements: {
          ...richTextConfig.elements,
          [editorContext.contextParams.locale]: nextElements
        }
      };
      form.change(path, newRichTextElement);
      previousRichTextComponentConfig.current = newRichTextElement;
      if (editor.selection) {
        const nextFocusedFields = getFocusedFieldsFromSlateSelection.getFocusedFieldsFromSlateSelection(editor, path, contextParams.locale);
        return nextFocusedFields;
      }
    });
  }, $richText_constants.RICH_TEXT_CONFIG_SYNC_THROTTLE_TIMEOUT), [isConfigChanged, editorContext.contextParams.locale]);
  const scheduleFocusedFieldsChange = React.useCallback(
  // Slate internally throttles the invocation of DOMSelectionChange for performance reasons.
  // We also throttle update of our focused fields state for the same reason.
  // This gives us a good balance between perf and showing updated fields within the sidebar.
  throttle__default["default"](focusedFields => {
    setFocussedField(focusedFields);
  }, $richText_constants.RICH_TEXT_FOCUSED_FIELDS_SYNC_THROTTLE_TIMEOUT), [setFocussedField]);
  function handleEditableChange(value) {
    if (!isEnabled) {
      return;
    }

    // Editor's value can be changed from outside ex. sidebar or history undo/redo. If the last reason for change
    // was "external", we skip this change. In case we would like to start typing immediately after undo/redo we
    // set last change reason to `text-input`.
    if (lastChangeReason.current === "external" || lastChangeReason.current === "paste") {
      lastChangeReason.current = "text-input";
      return;
    }
    const isValueSame = deepCompare.deepCompare(value, editorValue);

    // Slate runs `onChange` callback on any change, even when the text haven't changed.
    // If value haven't changed, it must be a selection change.
    if (isValueSame) {
      const nextFocusedFields = getFocusedFieldsFromSlateSelection.getFocusedFieldsFromSlateSelection(editor, path, contextParams.locale);
      if (nextFocusedFields) {
        scheduleFocusedFieldsChange(nextFocusedFields);
      }
      return;
    }
    lastChangeReason.current = "text-input";
    scheduleConfigSync(value);
  }
  function handleEditableFocus() {
    if (!isEnabled) {
      return;
    }
    lastChangeReason.current = "text-input";

    // When value for current locale is empty we present the value from fallback.
    // If user focuses editable element, we present the value of fallback unless it's also empty.
    if (!localizedRichTextElements) {
      let nextSlateValue = editor.children;
      let nextRichTextComponentConfig;
      if (fallbackRichTextElements) {
        nextRichTextComponentConfig = richTextConfig;
        const fallbackFirstTextPart = fallbackRichTextElements[0].elements[0].elements[0];

        // Keep only one line element with single empty rich text
        nextRichTextComponentConfig.elements[contextParams.locale] = [{
          ...fallbackRichTextElements[0],
          elements: [{
            ...fallbackRichTextElements[0].elements[0],
            elements: [{
              ...fallbackFirstTextPart,
              value: ""
            }]
          }]
        }];
        nextSlateValue = convertRichTextElementsToEditorValue.convertRichTextElementsToEditorValue(nextRichTextComponentConfig.elements[contextParams.locale]);
        editor.children = nextSlateValue;
        slate.Transforms.select(editor, {
          anchor: slate.Editor.start(editor, []),
          focus: slate.Editor.start(editor, [])
        });
        form.change(path, nextRichTextComponentConfig);
      } else {
        // If current and fallback value is missing we have:
        // - empty Slate value
        // - empty config within component-collection-localised
        // We will build next $richText component config based on current Slate value
        nextRichTextComponentConfig = richTextConfig;
        nextRichTextComponentConfig.elements[contextParams.locale] = convertEditorValueToRichTextElements.convertEditorValueToRichTextElements(editor.children);
        form.change(path, nextRichTextComponentConfig);
      }
      previousRichTextComponentConfig.current = nextRichTextComponentConfig;
      if (editor.selection) {
        const nextFocusedFields = getFocusedRichTextPartsConfigPaths.getFocusedRichTextPartsConfigPaths(editor).map(richTextPartPath => getAbsoluteRichTextPartPath.getAbsoluteRichTextPartPath(richTextPartPath, path, contextParams.locale));
        setFocussedField(nextFocusedFields);
      }
    }
    if (isDecorationActive) {
      const root = slateReact.ReactEditor.findDocumentOrShadowRoot(editor);
      const slateStringElements = root.querySelectorAll("[data-slate-string]");
      slateStringElements.forEach(element => {
        element.replaceChildren(document.createTextNode(element.textContent));
      });
    }
  }
  React.useEffect(() => {
    function saveLatestSelection() {
      const root = slateReact.ReactEditor.findDocumentOrShadowRoot(editor);
      const selection = root.getSelection();
      if (selection && selection.type === "Range") {
        currentSelectionRef.current = slateReact.ReactEditor.toSlateRange(editor, selection, {
          exactMatch: false,
          suppressThrow: true
        });
      } else {
        currentSelectionRef.current = null;
      }
    }
    const throttledSaveLatestSelection = throttle__default["default"](saveLatestSelection, 100);
    if (isEnabled) {
      window.document.addEventListener("selectionchange", throttledSaveLatestSelection);
      return () => {
        window.document.removeEventListener("selectionchange", throttledSaveLatestSelection);
      };
    }
  }, [editor, isEnabled]);
  function handleEditableBlur() {
    lastChangeReason.current = "external";
    setIsDecorationActive(true);
  }

  // When copying content from content editable, Slate will copy HTML content of selected nodes
  // and this is not what we want. Instead we set clipboard data to contain selected content
  // in form of rich text editable component config.
  function handleEditableCopy(event) {
    const selectedRichTextComponentConfig = getRichTextComponentConfigFragment.getRichTextComponentConfigFragment(richTextConfig, editorContext);
    event.clipboardData.setData("text/x-shopstory", JSON.stringify(selectedRichTextComponentConfig));
  }
  function handleEditablePaste(event) {
    const selectedRichTextComponentConfigClipboardData = event.clipboardData.getData("text/x-shopstory");
    if (selectedRichTextComponentConfigClipboardData) {
      const selectedRichTextComponentConfig = JSON.parse(selectedRichTextComponentConfigClipboardData);

      // Preventing the default action will also prevent Slate from handling this event on his own.
      event.preventDefault();
      const nextSlateValue = convertRichTextElementsToEditorValue.convertRichTextElementsToEditorValue(duplicateConfig.duplicateConfig(selectedRichTextComponentConfig, editorContext).elements[contextParams.locale]);
      const temporaryEditor = createTemporaryEditor.createTemporaryEditor(editor);
      slate.Editor.insertFragment(temporaryEditor, nextSlateValue);
      const nextElements = convertEditorValueToRichTextElements.convertEditorValueToRichTextElements(temporaryEditor.children);
      actions.runChange(() => {
        form.change(richTextElementsConfigPath, nextElements);
        const nextFocusedFields = getFocusedFieldsFromSlateSelection.getFocusedFieldsFromSlateSelection(temporaryEditor, path, contextParams.locale);
        return nextFocusedFields;
      });
      lastChangeReason.current = "paste";
    } else if (
    // Slate only handles pasting if the clipboardData contains text/plain type.
    // When copying text from the Contentful's rich text editor, the clipboardData contains
    // more than one type, so we have to handle this case manually.
    event.clipboardData.types.length > 1 && event.clipboardData.types.some(type => type === "text/plain")) {
      slate.Editor.insertText(editor, event.clipboardData.getData("text/plain"));
      event.preventDefault();
    }
  }
  const contentEditableClassName = React.useMemo(() => {
    const responsiveAlignmentStyles = mapResponsiveAlignmentToStyles(align, {
      devices: editorContext.devices,
      resop
    });
    const isFallbackValueShown = localizedRichTextElements === undefined && fallbackRichTextElements !== undefined;

    // When we make a selection of text within editable container and then blur
    // sometimes the browser selection changes and shows incorrectly selected chunks.
    const getStyles = stitches.css({
      display: "flex",
      ...responsiveAlignmentStyles,
      cursor: !isEnabled ? "inherit" : "text",
      "& *": {
        pointerEvents: isEnabled ? "auto" : "none",
        userSelect: isEnabled ? "auto" : "none"
      },
      "& *::selection": {
        backgroundColor: "#b4d5fe"
      },
      ...(isDecorationActive && {
        "& *::selection": {
          backgroundColor: "transparent"
        },
        "& *[data-easyblocks-rich-text-selection]": {
          backgroundColor: "#b4d5fe"
        }
      }),
      ...(isFallbackValueShown && {
        opacity: 0.5
      }),
      // Remove any text decoration from slate nodes that are elements. We only need text decoration on text elements.
      "[data-slate-node]": {
        textDecoration: "none"
      }
    });
    return getStyles().className;
  }, [align, isDecorationActive, localizedRichTextElements, fallbackRichTextElements, isEnabled]);
  return /*#__PURE__*/React__default["default"].createElement(slateReact.Slate, {
    editor: editor,
    value: editorValue,
    onChange: handleEditableChange
  }, /*#__PURE__*/React__default["default"].createElement("div", null, /*#__PURE__*/React__default["default"].createElement(slateReact.Editable, {
    className: contentEditableClassName,
    placeholder: "Here goes text content",
    renderElement: renderElement,
    renderLeaf: renderLeaf,
    renderPlaceholder: renderPlaceholder,
    decorate: decorate,
    onFocus: handleEditableFocus,
    onBlur: handleEditableBlur,
    onCopy: handleEditableCopy,
    onPaste: handleEditablePaste,
    onMouseDown: event => {
      if (isEnabled) {
        event.stopPropagation();
        return;
      }
      if (event.detail === 2) {
        event.preventDefault();
        reactDom.flushSync(() => {
          setIsEnabled(true);
        });
        slateReact.ReactEditor.focus(editor);
        if (isEditorValueEmpty(editor.children)) {
          return;
        }
        const editorSelectionRange = {
          anchor: slate.Editor.start(editor, []),
          focus: slate.Editor.end(editor, [])
        };
        slate.Transforms.setSelection(editor, editorSelectionRange);
        const editorSelectionDOMRange = slateReact.ReactEditor.toDOMRange(editor, editorSelectionRange);
        window.getSelection()?.setBaseAndExtent(editorSelectionDOMRange.startContainer, editorSelectionDOMRange.startOffset, editorSelectionDOMRange.endContainer, editorSelectionDOMRange.endOffset);
      }
    },
    readOnly: !isEnabled
  })));
}
function isEditorValueEmpty(editorValue) {
  return editorValue.length === 1 && editorValue[0].children.length === 1 && editorValue[0].children[0].children.length === 1 && slate.Text.isText(editorValue[0].children[0].children[0]) && editorValue[0].children[0].children[0].text === "";
}
function isConfigEqual(newConfig, oldConfig) {
  return deepCompare.deepCompare(newConfig, oldConfig);
}
function mapResponsiveAlignmentToStyles(align, _ref4) {
  let {
    devices: devices$1,
    resop
  } = _ref4;
  function mapAlignmentToFlexAlignment(align) {
    if (align === "center") {
      return "center";
    }
    if (align === "right") {
      return "flex-end";
    }
    return "flex-start";
  }
  const responsiveStyles = resop({
    align: responsiveValueFill.responsiveValueFill(align, devices$1, devices.getDevicesWidths(devices$1))
  }, values => {
    return {
      justifyContent: mapAlignmentToFlexAlignment(values.align),
      textAlign: values.align
    };
  }, devices$1);
  const compiledStyles = box.compileBox(responsiveStyles, devices$1);
  return box.getBoxStyles(compiledStyles, devices$1);
}
function createTextSelectionDecorator(editor) {
  return _ref5 => {
    let [node, path] = _ref5;
    const decorations = [];
    if (slate.Text.isText(node) && editor.selection !== null && node.TextWrapper.length > 0 && slate.Range.isCollapsed(editor.selection)) {
      const textRange = slate.Editor.range(editor, path);
      const intersection = slate.Range.intersection(editor.selection, textRange);
      if (intersection !== null) {
        const range = {
          isHighlighted: true,
          highlightType: "textWrapper",
          ...textRange
        };
        decorations.push(range);
      }
    }
    return decorations;
  };
}
function splitStringNodes(editor, selection) {
  const nodes = slate.Editor.nodes(editor, {
    at: selection,
    match: slate.Text.isText
  });
  const domNodes = Array.from(nodes).map(_ref6 => {
    let [node] = _ref6;
    const domNode = slateReact.ReactEditor.toDOMNode(editor, node);
    return domNode;
  });
  if (domNodes.length === 1) {
    const slateString = domNodes[0].querySelector("[data-slate-string]");
    const textContent = slateString.textContent;
    const newChild = document.createDocumentFragment();

    // Selection made within whole text node
    if (textContent.length === selection.focus.offset - selection.anchor.offset || textContent.length === selection.anchor.offset - selection.focus.offset) {
      const selectedTextNode = document.createElement("span");
      selectedTextNode.textContent = textContent;
      selectedTextNode.dataset.easyblocksRichTextSelection = "true";
      newChild.appendChild(selectedTextNode);
      slateString.replaceChildren(newChild);
    } else {
      const selectedTextNode = document.createElement("span");
      selectedTextNode.textContent = textContent.slice(selection.anchor.offset, selection.focus.offset);
      selectedTextNode.dataset.easyblocksRichTextSelection = "true";
      newChild.appendChild(document.createTextNode(textContent.slice(0, selection.anchor.offset)));
      newChild.appendChild(selectedTextNode);
      newChild.appendChild(document.createTextNode(textContent.slice(selection.focus.offset)));
      slateString.replaceChildren(newChild);
    }
    return;
  }
  domNodes.forEach((node, index) => {
    const slateString = node.querySelector("[data-slate-string]");
    if (slateString) {
      const textContent = slateString.textContent;
      const newChild = document.createDocumentFragment();
      if (index === 0) {
        newChild.appendChild(document.createTextNode(slateString.textContent.slice(0, selection.anchor.offset)));
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent.slice(selection.anchor.offset);
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        slateString.replaceChildren(newChild);
      } else if (index === domNodes.length - 1) {
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent.slice(0, selection.focus.offset);
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        newChild.appendChild(document.createTextNode(textContent.slice(selection.focus.offset)));
        slateString.replaceChildren(newChild);
      } else {
        const selectedTextNode = document.createElement("span");
        selectedTextNode.textContent = textContent;
        selectedTextNode.dataset.easyblocksRichTextSelection = "true";
        newChild.appendChild(selectedTextNode);
        slateString.replaceChildren(newChild);
      }
    }
  });
}
function unwrapStringNodesContent(editor) {
  const root = slateReact.ReactEditor.findDocumentOrShadowRoot(editor);
  const slateStringElements = root.querySelectorAll("[data-slate-string]");
  slateStringElements.forEach(element => {
    element.replaceChildren(document.createTextNode(element.textContent));
  });
}

exports.RichTextEditor = RichTextEditor;
