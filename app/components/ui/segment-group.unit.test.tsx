import { describe, expect, test } from "bun:test";
import { SegmentGroup } from "./segment-group";

describe("SegmentGroup Unit Tests", () => {
	test("should render correctly", () => {
		const html = (
			<SegmentGroup
				defaultValue="react"
				items={[
					{ label: "React", value: "react" },
					{ label: "Solid", value: "solid" },
				]}
			/>
		).toString();

		expect(html).toContain('data-scope="segment-group"');
		expect(html).toContain('data-part="root"');
		expect(html).toContain("React");
		expect(html).toContain("Solid");
		expect(html).toContain('value="react"');
		expect(html).toContain('value="solid"');
	});

	test("should render as an island when interactive", () => {
		const html = (
			<SegmentGroup interactive items={[{ label: "React", value: "react" }]} />
		).toString();

		expect(html).toContain('data-hydrated="true"');
	});

	test("should not render as an island when not interactive", () => {
		const html = (
			<SegmentGroup
				interactive={false}
				items={[{ label: "React", value: "react" }]}
			/>
		).toString();

		expect(html).not.toContain('data-hydrated="true"');
		expect(html).toContain('data-part="root"');
	});

	test("should support compound components for backward compatibility", () => {
		const html = (
			<SegmentGroup.Root defaultValue="react">
				<SegmentGroup.Indicator />
				<SegmentGroup.Item value="react">
					<SegmentGroup.ItemText>React</SegmentGroup.ItemText>
					<SegmentGroup.ItemHiddenInput />
				</SegmentGroup.Item>
			</SegmentGroup.Root>
		).toString();

		expect(html).toContain('data-part="root"');
		expect(html).toContain('data-part="indicator"');
		expect(html).toContain('data-part="item"');
		expect(html).toContain('data-part="item-text"');
		expect(html).toContain('type="radio"');
	});
});
