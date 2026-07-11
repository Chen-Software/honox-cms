import { expect, test, describe } from "bun:test";
import { Menu } from "../app/components/ui/menu";

describe("Menu Unit Tests", () => {
	test("should render correctly", () => {
		const html = (
			<Menu.Root interactive={false}>
				<Menu.Trigger>Open</Menu.Trigger>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.Item value="item-1">Item 1</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Open");
        expect(html).toContain('role="menu"');
	});

	test("should render items correctly", () => {
		const html = (
			<Menu.Root interactive={false}>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.Item value="item-1">Item 1</Menu.Item>
						<Menu.CheckboxItem value="item-2" checked>
							Item 2
						</Menu.CheckboxItem>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
		).toString();

		expect(html).toContain('role="menuitem"');
		expect(html).toContain('data-value="item-1"');
		expect(html).toContain('role="menuitemcheckbox"');
		expect(html).toContain('aria-checked="true"');
	});

	test("should degrade submenu to a disabled item (no debug leak)", () => {
		const html = (
			<Menu.Root
				interactive={false}
				items={[{ type: "submenu", label: "More", items: [] }]}
			/>
		).toString();

		expect(html).toContain('data-part="item"');
		expect(html).toContain("data-disabled");
		expect(html).toContain("More");
		expect(html).not.toContain("not supported in simplified API");
	});
});
