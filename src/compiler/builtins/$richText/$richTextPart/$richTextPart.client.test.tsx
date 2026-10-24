import React from "react";
import { renderToString } from "react-dom/server";
import { RichTextPartClient } from "./$richTextPart.client";

const Text = <span />;

describe("RichTextPartClient", () => {
  test("plain text accepts a host-rewritten server copy (Cloudflare email obfuscation)", () => {
    const element = RichTextPartClient({
      value: "Email: info@example.com",
      Text,
      TextWrapper: undefined,
    });

    expect(element.props.suppressHydrationWarning).toBe(true);
    expect(element.props.children).toBe("Email: info@example.com");
  });

  test("the server HTML is unchanged", () => {
    const html = renderToString(
      <RichTextPartClient value="Email: info@example.com" Text={Text} TextWrapper={undefined} />
    );

    expect(html).toBe("<span>Email: info@example.com</span>");
  });

  test("editing content (an element, not a string) is left as it was", () => {
    const editing = <b>editable</b>;
    const element = RichTextPartClient({ value: editing, Text, TextWrapper: undefined });

    expect(element.props.suppressHydrationWarning).toBeUndefined();
  });

  test("text inside a link wrapper is left as it was", () => {
    const element = RichTextPartClient({
      value: "Email: info@example.com",
      Text,
      TextWrapper: <a />,
    });

    expect(element.props.suppressHydrationWarning).toBeUndefined();
  });
});
