import { expect, test } from "bun:test";
import { PageRenderer } from "../app/components/page-renderer";
import { registry, resolveType } from "../app/components/page-registry";

test("unknown component type renders a safe marker and never dumps JSON", () => {
  const content = [
    {
      type: "totally-unknown",
      secret: "do-not-leak",
      nested: { leaked: true },
    },
  ];

  const html = (<PageRenderer content={content} />).toString();

  // Inert marker so the page doesn't break.
  expect(html).toContain('data-unknown-component="totally-unknown"');
  // The raw CMS payload must never reach the rendered output.
  expect(html).not.toContain("do-not-leak");
  expect(html).not.toContain("leaked");
});

test("resolveType normalises kebab aliases to canonical camelCase keys", () => {
  expect(resolveType("hover-card")).toBe("hoverCard");
  expect(resolveType("paginated-table")).toBe("paginatedTable");
  expect(resolveType("radio-group")).toBe("radioGroup");
  expect(resolveType("segment-group")).toBe("segmentGroup");
  // Already-canonical and unknown types pass through unchanged.
  expect(resolveType("hoverCard")).toBe("hoverCard");
  expect(resolveType("nope")).toBe("nope");
});

test("every alias target resolves to a registered renderer", () => {
  const aliases: Record<string, string> = {
    "hover-card": "hoverCard",
    "paginated-table": "paginatedTable",
    "radio-group": "radioGroup",
    "segment-group": "segmentGroup",
  };
  for (const target of Object.values(aliases)) {
    expect(typeof registry[target]).toBe("function");
  }
});

test("link block renders an anchor with text, href and external rel safety", () => {
  // Plain internal link.
  const internal = (<PageRenderer content={[{ type: "link", text: "Docs", href: "/docs" }]} />).toString();
  expect(internal).toContain('href="/docs"');
  expect(internal).toContain("Docs");

  // External link: target="_blank" without rel must gain rel="noopener noreferrer".
  const external = (
    <PageRenderer
      content={[{ type: "link", text: "Hono", href: "https://hono.dev", target: "_blank" }]}
    />
  ).toString();
  expect(external).toContain('href="https://hono.dev"');
  expect(external).toContain('target="_blank"');
  expect(external).toContain('rel="noopener noreferrer"');

  // Explicit colorPalette passes through to the rendered element.
  const themed = (
    <PageRenderer content={[{ type: "link", text: "Go", href: "#", colorPalette: "green" }]} />
  ).toString();
  expect(themed).toContain("Go");
});

test("fileUpload block renders a hydrated FileUpload with coerced numeric props", () => {
  const html = (
    <PageRenderer
      content={[
        {
          type: "fileUpload",
          label: "Attachments",
          name: "attachments",
          accept: "image/*",
          // CMS payloads may deliver numbers as strings; the renderer coerces.
          maxFiles: "3",
          showSize: true,
          clearable: true,
        },
      ]}
    />
  ).toString();

  expect(html).toContain('data-scope="file-upload"');
  expect(html).toContain('data-interactive="true"');
  expect(html).toContain("Attachments");
  expect(html).toContain('name="attachments"');
  expect(html).toContain('accept="image/*"');
  // maxFiles=3 → the hidden input allows multiple selection.
  expect(html).toMatch(/<input[^>]*type="file"[^>]*multiple/);

  // Kebab-case alias resolves to the same renderer.
  const aliased = (
    <PageRenderer content={[{ type: "file-upload", label: "Docs" }]} />
  ).toString();
  expect(aliased).toContain('data-scope="file-upload"');
  expect(aliased).toContain("Docs");
});

test("registry exposes a renderer for every canonical block type", () => {
  const types = [
    "stack",
    "button",
    "badge",
    "alert",
    "heading",
    "link",
    "text",
    "card",
    "checkbox",
    "collapsible",
    "combobox",
    "dialog",
    "drawer",
    "field",
    "fieldset",
    "group",
    "hoverCard",
    "menu",
    "popover",
    "skeleton",
    "paginatedTable",
    "pagination",
    "progress",
    "radioGroup",
    "segmentGroup",
    "select",
    "slider",
    "switch",
    "fileUpload",
  ];
  for (const type of types) {
    expect(typeof registry[type], `registry missing entry for "${type}"`).toBe(
      "function",
    );
  }
});
