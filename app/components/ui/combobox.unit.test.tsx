import { describe, expect, test } from "bun:test";
import { Combobox } from "./combobox";

describe("Combobox Unit Tests", () => {
	test("should render correctly with flattened API (static)", () => {
		const html = (
			<Combobox
				interactive={false}
				label="Favorite Framework"
				placeholder="Select framework..."
				items={[
					{ label: "React", value: "react" },
					{ label: "Solid", value: "solid" },
				]}
			/>
		).toString();

		expect(html).toContain('data-scope="combobox"');
		expect(html).toContain('data-part="root"');
		expect(html).toContain("Favorite Framework");
		expect(html).toContain("Select framework...");
		expect(html).toContain("React");
		expect(html).toContain("Solid");
	});

	test("should support compound components for backward compatibility", () => {
		const html = (
			<Combobox.Root
				id="my-combobox"
				items={[{ label: "Hono", value: "hono" }]}
			>
				<Combobox.Label>Framework</Combobox.Label>
				<Combobox.Control>
					<Combobox.Input placeholder="Search..." />
					<Combobox.IndicatorGroup>
						<Combobox.ClearTrigger />
						<Combobox.Trigger />
					</Combobox.IndicatorGroup>
				</Combobox.Control>
				<Combobox.Positioner>
					<Combobox.Content>
						<Combobox.List>
							<Combobox.Item value="hono" index={0}>
								<Combobox.ItemText>Hono</Combobox.ItemText>
								<Combobox.ItemIndicator />
							</Combobox.Item>
						</Combobox.List>
					</Combobox.Content>
				</Combobox.Positioner>
			</Combobox.Root>
		).toString();

		expect(html).toContain('data-part="root"');
		expect(html).toContain('data-part="label"');
		expect(html).toContain('data-part="control"');
		expect(html).toContain('data-part="input"');
		expect(html).toContain('data-part="clear-trigger"');
		expect(html).toContain('data-part="trigger"');
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('data-part="content"');
		expect(html).toContain('data-part="list"');
		expect(html).toContain('data-part="item"');
		expect(html).toContain('data-part="item-text"');
		expect(html).toContain('data-part="item-indicator"');
	});
});
