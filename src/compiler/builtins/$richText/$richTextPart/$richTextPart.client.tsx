import type { ReactElement, ReactNode } from "react";
import React, { useEffect, useLayoutEffect, useRef } from "react";

type RichTextPartProps = {
  TextWrapper: React.ReactElement<{ trigger: React.ReactElement }> | undefined;
  // ReactElement when editing, string when not
  value: string | ReactElement;
  Text: React.ReactElement<{ children: ReactNode; style: Record<string, any> }>;
};

// useLayoutEffect only runs in a browser; on the server it would just warn.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function RichTextPartClient(props: RichTextPartProps) {
  const { value, Text, TextWrapper } = props;
  const textValue = value || "﻿";
  const isPlainText = !TextWrapper && typeof textValue === "string";
  const textRef = useRef<HTMLElement>(null);

  // Plain text the page author typed may be rewritten before React sees it: Cloudflare's
  // email obfuscation turns an address into `<a class="__cf_email__">[email protected]</a>`
  // in the HTML on every zone that has it on, and the host decides that, not us. React
  // then failed hydration on the text (#425) and re-rendered the whole boundary on the
  // client. With `suppressHydrationWarning` React keeps the rewritten copy instead, and it
  // never writes the text back, while the storefront's CSP (`strict-dynamic`) blocks the
  // decoder script Cloudflare injects. So once hydrated, the element gets the author's
  // text again: the same end result the re-render gave, without re-rendering anything.
  useBrowserLayoutEffect(() => {
    const element = textRef.current;

    if (isPlainText && element && element.textContent !== textValue) {
      element.textContent = textValue as string;
    }
  }, [isPlainText, textValue]);

  if (TextWrapper) {
    return (
      <Text.type {...Text.props}>
        <TextWrapper.type {...TextWrapper.props}>{textValue}</TextWrapper.type>
      </Text.type>
    );
  }

  return (
    <Text.type
      {...Text.props}
      ref={isPlainText ? textRef : undefined}
      suppressHydrationWarning={isPlainText ? true : undefined}
    >
      {textValue}
    </Text.type>
  );
}
