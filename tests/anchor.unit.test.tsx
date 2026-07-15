import { describe, expect, it } from "bun:test";
import { Anchor } from "../app/components/ui/anchor";

describe("Anchor component", () => {
	it("renders an anchor with the default (underline / blue) recipe classes", () => {
		const html = (<Anchor href="/home">Home</Anchor>).toString();
		expect(html).toContain("<a");
		expect(html).toContain("anchor--variant_underline");
		expect(html).toContain("anchor--colorPalette_blue");
		expect(html).toContain('href="/home"');
		expect(html).toContain("Home");
	});

	it("applies the plain variant and a custom colorPalette", () => {
		const html = (
			<Anchor href="/docs" variant="plain" colorPalette="green">
				Docs
			</Anchor>
		).toString();
		expect(html).toContain("anchor--variant_plain");
		expect(html).toContain("anchor--colorPalette_green");
	});

	it("adds rel=noopener noreferrer to external (target=_blank) links by default", () => {
		const html = (
			<Anchor href="https://example.com" target="_blank">
				External
			</Anchor>
		).toString();
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it("does not override an explicit rel on external links", () => {
		const html = (
			<Anchor href="https://example.com" target="_blank" rel="noopener">
				External
			</Anchor>
		).toString();
		expect(html).toContain('rel="noopener"');
		expect(html).not.toContain('rel="noopener noreferrer"');
	});

	it("respects the `as` prop to change the rendered element", () => {
		const html = (
			<Anchor as="span" href="/x">
				Inline
			</Anchor>
		).toString();
		expect(html).toContain("<span");
		expect(html).not.toContain("<a");
	});

	it("merges styles onto a single child when asChild is set", () => {
		const html = (
			<Anchor asChild href="/dashboard">
				<span class="custom-link">Go</span>
			</Anchor>
		).toString();
		// No <a> is rendered; the child element receives the recipe classes.
		expect(html).not.toContain("<a");
		expect(html).toContain("<span");
		expect(html).toContain("anchor--variant_underline");
		expect(html).toContain("custom-link");
		expect(html).toContain('href="/dashboard"');
	});
});
