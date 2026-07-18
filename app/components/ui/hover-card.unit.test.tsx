import { describe, expect, test } from "bun:test";
import { HoverCard } from "./hover-card";

describe("HoverCard Unit Tests", () => {
	test("should render correctly", () => {
		const html = (
			<HoverCard
				interactive={false}
				trigger={<span>Hover me</span>}
				title="HoverCard Title"
				description="This is the description."
			/>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Hover me");
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('role="dialog"');
		expect(html).toContain("HoverCard Title");
		expect(html).toContain("This is the description.");
	});

	test("should render arrow when showArrow is true", () => {
		const html = (
			<HoverCard interactive={false} showArrow={true} />
		).toString();

		expect(html).toContain('data-part="arrow"');
	});

	test("should not render arrow when showArrow is false", () => {
		const html = (
			<HoverCard interactive={false} showArrow={false} />
		).toString();

		expect(html).not.toContain('data-part="arrow"');
	});

	test("should render custom content when provided", () => {
		const html = (
			<HoverCard interactive={false} content={<div>Custom Content</div>} />
		).toString();

		expect(html).toContain("Custom Content");
		expect(html).not.toContain("HoverCard Title");
	});

	test("should render compound/composable API correctly", () => {
		const html = (
			<HoverCard.Root>
				<HoverCard.Trigger>
					<span>Hover me</span>
				</HoverCard.Trigger>
				<HoverCard.Positioner>
					<HoverCard.Content>
						Supplementary information shown on hover.
					</HoverCard.Content>
				</HoverCard.Positioner>
			</HoverCard.Root>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Hover me");
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('role="dialog"');
		expect(html).toContain("Supplementary information shown on hover.");
	});
});
