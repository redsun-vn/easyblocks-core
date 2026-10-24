import type { ReactElement, ReactNode } from "react";
import React from "react";

type RichTextPartProps = {
  TextWrapper: React.ReactElement<{ trigger: React.ReactElement }> | undefined;
  // ReactElement when editing, string when not
  value: string | ReactElement;
  Text: React.ReactElement<{ children: ReactNode; style: Record<string, any> }>;
};

export function RichTextPartClient(props: RichTextPartProps) {
  const { value, Text, TextWrapper } = props;
  const textValue = value || "\uFEFF";

  if (TextWrapper) {
    return (
      <Text.type {...Text.props}>
        <TextWrapper.type {...TextWrapper.props}>{textValue}</TextWrapper.type>
      </Text.type>
    );
  }

  // Plain text the page author typed may be rewritten before React sees it: Cloudflare's
  // email obfuscation turns an address into `<a class="__cf_email__">[email protected]</a>`
  // in the HTML on every zone that has it on, and the host decides that, not us. React
  // then failed hydration on the text (#425) and re-rendered the boundary on the client.
  // With a single string child, `suppressHydrationWarning` makes React accept the
  // rewritten server copy instead; Cloudflare's own decoder script, which the zone injects
  // with the rewrite, turns it back into the address.
  return (
    <Text.type
      {...Text.props}
      suppressHydrationWarning={typeof textValue === "string" ? true : undefined}
    >
      {textValue}
    </Text.type>
  );
}
