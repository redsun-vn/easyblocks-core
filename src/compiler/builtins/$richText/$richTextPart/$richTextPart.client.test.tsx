/**
 * @jest-environment jsdom
 */
import React from "react";
import { act } from "react-dom/test-utils";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { RichTextPartClient } from "./$richTextPart.client";

const Text = <span />;
const ADDRESS = "Email: info@example.com";

/** Hydrates `element` over `serverHtml`, collecting the errors React recovers from. */
async function hydrate(element: React.ReactElement, serverHtml: string) {
  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.appendChild(container);
  const serverNode = container.firstChild;
  const recoverableErrors: unknown[] = [];
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  await act(async () => {
    hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
  });

  consoleError.mockRestore();

  return { container, serverNode, recoverableErrors };
}

describe("RichTextPartClient", () => {
  test("the server HTML is unchanged", () => {
    const html = renderToString(
      <RichTextPartClient value={ADDRESS} Text={Text} TextWrapper={undefined} />
    );

    expect(html).toBe(`<span>${ADDRESS}</span>`);
  });

  test("a host-rewritten address hydrates without an error and shows the author's text", async () => {
    // What Cloudflare's email obfuscation sends instead of the server's HTML.
    const rewritten =
      '<span>Email: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="00">[email&#160;protected]</a></span>';

    const { container, serverNode, recoverableErrors } = await hydrate(
      <RichTextPartClient value={ADDRESS} Text={Text} TextWrapper={undefined} />,
      rewritten
    );

    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toBe(ADDRESS);
    expect(container.querySelector(".__cf_email__")).toBeNull();
    // Hydrated in place, not thrown away and rendered again on the client.
    expect(container.firstChild).toBe(serverNode);
  });

  test("untouched text hydrates as it did", async () => {
    const html = renderToString(
      <RichTextPartClient value={ADDRESS} Text={Text} TextWrapper={undefined} />
    );

    const { container, serverNode, recoverableErrors } = await hydrate(
      <RichTextPartClient value={ADDRESS} Text={Text} TextWrapper={undefined} />,
      html
    );

    expect(recoverableErrors).toEqual([]);
    expect(container.innerHTML).toBe(html);
    expect(container.firstChild).toBe(serverNode);
  });

  test("editing content (an element, not a string) renders as it did", () => {
    const html = renderToString(
      <RichTextPartClient value={<b>editable</b>} Text={Text} TextWrapper={undefined} />
    );

    expect(html).toBe("<span><b>editable</b></span>");
  });

  test("text inside a link wrapper renders as it did", () => {
    const html = renderToString(
      <RichTextPartClient value={ADDRESS} Text={Text} TextWrapper={<a />} />
    );

    expect(html).toBe(`<span><a>${ADDRESS}</a></span>`);
  });
});
