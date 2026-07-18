import { describe, expect, test } from "bun:test";
import { Dropdown } from "./dropdown";

describe("Dropdown Refined Unit Tests", () => {
	test("should apply custom classNames and styles to slots", () => {
		const html = (
			<Dropdown.Root
				interactive={false}
				classNames={{
					content: "my-custom-content-class",
					item: "my-custom-item-class",
					positioner: "my-custom-positioner-class",
				}}
				styles={{
					content: { backgroundColor: "rgb(255, 0, 0)" },
					item: { padding: "10px" },
				}}
				items={[{ type: "item", label: "Item A", value: "a" }]}
			/>
		).toString();

		expect(html).toContain("my-custom-content-class");
		expect(html).toContain("my-custom-item-class");
		expect(html).toContain("my-custom-positioner-class");
		expect(html).toContain("background-color:rgb(255, 0, 0)");
		expect(html).toContain("padding:10px");
	});

	test("should support popupRender / dropdownRender custom wrapping", () => {
		const html = (
			<Dropdown.Root
				interactive={false}
				popupRender={(menu) => (
					<div class="custom-wrapper">
						<div class="header">My Header</div>
						{menu}
					</div>
				)}
				items={[{ type: "item", label: "Item A", value: "a" }]}
			/>
		).toString();

		expect(html).toContain("custom-wrapper");
		expect(html).toContain("My Header");
		expect(html).toContain('role="menu"');
		expect(html).toContain("Item A");
	});

	test("should support pointAtCenter arrow mapping", () => {
		const html = (
			<Dropdown.Root
				interactive={true}
				arrow={{ pointAtCenter: true }}
				items={[{ type: "item", label: "Item A", value: "a" }]}
			/>
		).toString();

		expect(html).toContain('data-part="arrow"');
		expect(html).toContain('data-part="arrow-tip"');
	});

	test("should support trigger alias instead of triggerMode", () => {
		const html = (
			<Dropdown.Root
				interactive={true}
				trigger={["click", "hover"]}
				items={[{ type: "item", label: "Item A", value: "a" }]}
			/>
		).toString();

		expect(html).toContain('data-part="root"');
	});

	test("should render DropdownButton component correctly", () => {
		const html = (
			<Dropdown.Button
				type="primary"
				danger
				loading
				onClick={() => {}}
				items={[{ type: "item", label: "Option 1", value: "1" }]}
			>
				Primary Action
			</Dropdown.Button>
		).toString();

		// Should render both the left and right buttons in the group
		expect(html).toContain("Primary Action");
		expect(html).toContain('data-loading=""');
		expect(html).toContain("More Actions"); // Right action icon title
	});
});
