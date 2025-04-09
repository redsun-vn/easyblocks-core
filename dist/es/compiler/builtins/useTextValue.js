/* with love from shopstory */
import debounce from 'lodash/debounce';
import React from 'react';
import { getFallbackForLocale } from '../../locales.js';
import { cleanString } from '../../utils/cleanString.js';

function useTextValue(value, onChange, locale, locales, defaultPlaceholder, normalize) {
  const isExternal = typeof value === "object" && value !== null;
  const fallbackValue = isExternal ? getFallbackForLocale(value.value, locale, locales) : undefined;
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
  const previousValue = React.useRef(valueFromProps);
  const [localInputValue, setLocalInputValue] = React.useState(valueFromProps);
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
  const onChangeDebounced = React.useCallback(debounce(newValue => {
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
  React.useEffect(() => {
    setLocalInputValue(valueFromProps);
  }, [valueFromProps]);
  const style = {
    opacity: localInputValue === fallbackValue ? 0.5 : 1
  };
  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: cleanString(localInputValue),
    style,
    placeholder: defaultPlaceholder ?? "Enter text"
  };
}

export { useTextValue };
//# sourceMappingURL=useTextValue.js.map
