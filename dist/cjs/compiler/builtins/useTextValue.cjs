/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');
var debounce = require('lodash/debounce');
var React = require('react');
var locales = require('../../locales.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var debounce__default = /*#__PURE__*/_interopDefaultLegacy(debounce);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function useTextValue(value, onChange, locale, locales$1, defaultPlaceholder, normalize) {
  const isExternal = typeof value === "object" && value !== null;
  const fallbackValue = isExternal ? locales.getFallbackForLocale(value.value, locale, locales$1) : undefined;
  const valueFromProps = (() => {
    if (isExternal) {
      let displayedValue = value.value?.[locale];
      if (typeof displayedValue !== "string") {
        displayedValue = fallbackValue ?? "";
      }
      return displayedValue;
    }
    return value ?? "";
  })();
  const previousValue = React__default["default"].useRef(valueFromProps);
  const [localInputValue, setLocalInputValue] = React__default["default"].useState(valueFromProps);
  function saveNewValue(newValue) {
    if (isExternal) {
      const newExternalValue = {
        ...value,
        value: {
          ...value.value,
          [locale]: newValue
        }
      };
      onChange(newExternalValue);
    } else {
      onChange(newValue);
    }
  }
  const onChangeDebounced = React__default["default"].useCallback(debounce__default["default"](newValue => {
    // If normalization is on, we shouldn't save on change
    if (normalize) {
      return;
    }
    saveNewValue(newValue);
  }, 500), [isExternal]);
  function handleBlur() {
    onChangeDebounced.cancel();
    let newValue = localInputValue;
    if (normalize) {
      const normalized = normalize(newValue);
      if (normalized === null) {
        newValue = previousValue.current;
      } else {
        newValue = normalized;
        previousValue.current = localInputValue;
      }
    }
    setLocalInputValue(newValue);
    if (isExternal) {
      if (newValue.trim() === "") {
        saveNewValue(null);
        setLocalInputValue(fallbackValue ?? "");
      } else {
        saveNewValue(newValue);
      }
    } else {
      if (value !== newValue) {
        saveNewValue(newValue);
      }
    }
  }
  function handleChange(event) {
    setLocalInputValue(event.target.value);
    onChangeDebounced(event.target.value);
  }

  // Sync local value with value from the config if the field value has been
  // changed from outside
  React__default["default"].useEffect(() => {
    setLocalInputValue(valueFromProps);
  }, [valueFromProps]);
  const style = {
    opacity: localInputValue === fallbackValue ? 0.5 : 1
  };
  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: utils.cleanString(localInputValue),
    style,
    placeholder: defaultPlaceholder ?? "Enter text"
  };
}

exports.useTextValue = useTextValue;
