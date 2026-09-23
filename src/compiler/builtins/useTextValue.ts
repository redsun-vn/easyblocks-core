import { cleanString } from "@/utils";
import debounce from "lodash/debounce";
import React from "react";
import { Locale, getFallbackForLocale } from "../../locales";
import { translateInEditor } from "./editorTranslate";

export function useTextValue(
  value: any,
  onChange: any,
  locale: string,
  locales: Array<Locale>,
  defaultPlaceholder?: string,
  normalize?: (x: string) => string | null
) {
  const isExternal = typeof value === "object" && value !== null;
  const fallbackValue = isExternal
    ? getFallbackForLocale(value.value, locale, locales)
    : undefined;

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

  function saveNewValue(newValue: string | null) {
    if (isExternal) {
      const newExternalValue = {
        ...value,
        value: {
          ...value.value,
          [locale]: newValue,
        },
      };

      onChange(newExternalValue);
    } else {
      onChange(newValue);
    }
  }

  const onChangeDebounced = React.useCallback(
    debounce((newValue: string) => {
      // If normalization is on, we shouldn't save on change
      if (normalize) {
        return;
      }

      saveNewValue(newValue);
    }, 500),
    [isExternal]
  );

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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setLocalInputValue(event.target.value);
    onChangeDebounced(event.target.value);
  }

  // Sync local value with value from the config if the field value has been
  // changed from outside
  React.useEffect(() => {
    setLocalInputValue(valueFromProps);
  }, [valueFromProps]);

  // Dimmed means "this text belongs to another locale". It has to be decided
  // by whether this locale has its own text, not by whether the string happens
  // to match the fallback: with no fallback to follow, `getFallbackForLocale`
  // hands back the first translation there is, which on the default locale is
  // the very value being shown. Every field of a single-locale document was
  // greyed out, and greyed out is how this editor says a value is not really
  // there.
  const hasOwnValue = isExternal
    ? typeof value.value?.[locale] === "string"
    : value !== undefined && value !== null;

  const style: any = {
    opacity: !hasOwnValue && localInputValue === fallbackValue ? 0.5 : 1,
  };

  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: cleanString(localInputValue),
    style,
    placeholder:
      defaultPlaceholder ??
      translateInEditor("editor.canvas.text.enter", "Enter text"),
  };
}
