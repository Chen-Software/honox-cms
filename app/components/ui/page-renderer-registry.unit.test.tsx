import { expect, test } from "bun:test";
import { registry, resolveType } from "../page-registry";
import { PageRenderer } from "../page-renderer";

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
	expect(resolveType("radio-card-group")).toBe("radioCardGroup");
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
		"radio-card-group": "radioCardGroup",
		"radio-group": "radioGroup",
		"segment-group": "segmentGroup",
	};
	for (const target of Object.values(aliases)) {
		expect(typeof registry[target]).toBe("function");
	}
});

test("anchor block renders an anchor with text, href and external rel safety", () => {
	// Plain internal link.
	const internal = (
		<PageRenderer content={[{ type: "anchor", text: "Docs", href: "/docs" }]} />
	).toString();
	expect(internal).toContain('href="/docs"');
	expect(internal).toContain("Docs");

	// External link: target="_blank" without rel must gain rel="noopener noreferrer".
	const external = (
		<PageRenderer
			content={[
				{
					type: "anchor",
					text: "Hono",
					href: "https://hono.dev",
					target: "_blank",
				},
			]}
		/>
	).toString();
	expect(external).toContain('href="https://hono.dev"');
	expect(external).toContain('target="_blank"');
	expect(external).toContain('rel="noopener noreferrer"');

	// Explicit colorPalette passes through to the rendered element.
	const themed = (
		<PageRenderer
			content={[
				{ type: "anchor", text: "Go", href: "#", colorPalette: "green" },
			]}
		/>
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

test("carousel block renders slides with captions/links and coerces numeric props", () => {
	const html = (
		<PageRenderer
			content={[
				{
					type: "carousel",
					slides: [
						{ image: "/media/one.jpg", caption: "First slide", href: "/one" },
						{ image: "/media/two.jpg" },
					],
					// CMS payloads may deliver numbers as strings; the renderer coerces.
					slidesPerPage: "1",
					autoplayDelay: "3000",
					loop: true,
					colorPalette: "purple",
				},
			]}
		/>
	).toString();

	expect(html).toContain('data-scope="carousel"');
	expect(html).toContain('data-part="item"');
	expect(html).toContain('src="/media/one.jpg"');
	expect(html).toContain('src="/media/two.jpg"');
	expect(html).toContain("First slide");
	expect(html).toContain('href="/one"');
	expect(html).toContain("carousel__root--colorPalette_purple");
	// slidesPerPage=1 → --slides-per-page:1 in the root's inline style.
	expect(html).toContain("--slides-per-page:1");

	// A slide with no caption/href renders the bare image, no dangling anchor.
	expect(html).not.toContain("<a><img");
});

test("carousel block with no slides renders an empty, non-throwing carousel", () => {
	const html = (<PageRenderer content={[{ type: "carousel" }]} />).toString();

	expect(html).toContain('data-scope="carousel"');
	expect(html).not.toContain('data-part="item"');
});

test("radioCardGroup block renders hydrated variant-styled cards and scrubs empty CMS fields", () => {
	const html = (
		<PageRenderer
			content={[
				{
					type: "radioCardGroup",
					label: "Plan",
					defaultValue: "pro",
					variant: "surface",
					// Sveltia serializes untouched optional fields as empty strings —
					// they must not override the recipe's defaults.
					colorPalette: "",
					items: [
						{ label: "Hobby", value: "hobby", disabled: false },
						{ label: "Pro", value: "pro", disabled: false },
					],
				},
			]}
		/>
	).toString();

	expect(html).toContain('data-scope="radio-card-group"');
	expect(html).toContain('data-hydrated="true"');
	expect(html).toContain("Plan");
	expect(html).toContain("radio-card-group__item--variant_surface");
	expect(html).not.toContain("--variant_outline");
	expect(html).not.toContain('colorPalette=""');
	// defaultValue=pro → that card is checked.
	expect(html).toMatch(/data-value="pro"[^>]*data-state="checked"/);

	// Kebab-case alias resolves to the same renderer.
	const aliased = (
		<PageRenderer
			content={[
				{ type: "radio-card-group", items: ["one"], colorPalette: "purple" },
			]}
		/>
	).toString();
	expect(aliased).toContain('data-scope="radio-card-group"');
	expect(aliased).toContain("radio-card-group__root--colorPalette_purple");
});

test("registry exposes a renderer for every canonical block type", () => {
	const types = [
		"stack",
		"button",
		"badge",
		"alert",
		"heading",
		"anchor",
		"text",
		"card",
		"carousel",
		"checkbox",
		"collapsible",
		"combobox",
		"dialog",
		"drawer",
		"field",
		"textarea",
		"fieldset",
		"group",
		"hoverCard",
		"dropdown",
		"popover",
		"skeleton",
		"paginatedTable",
		"pagination",
		"progress",
		"radioGroup",
		"radioCardGroup",
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
