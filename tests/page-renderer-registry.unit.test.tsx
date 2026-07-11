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

test("resolveType normalizes kebab aliases to canonical camelCase keys", () => {
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

test("registry exposes a renderer for every canonical block type", () => {
  const types = [
    "stack",
    "button",
    "badge",
    "alert",
    "heading",
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
  ];
  for (const type of types) {
    expect(typeof registry[type], `registry missing entry for "${type}"`).toBe(
      "function",
    );
  }
});
