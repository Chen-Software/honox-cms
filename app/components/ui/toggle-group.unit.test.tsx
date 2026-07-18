import { describe, expect, test } from "bun:test";
import { ToggleGroup } from "./toggle-group";

describe("ToggleGroup Unit Tests", () => {
	test("should render correctly with flattened API", () => {
		const html = (
			<ToggleGroup
				defaultValue={["bold"]}
				items={[
					{ label: "B", value: "bold" },
					{ label: "I", value: "italic" },
				]}
			/>
		).toString();

		expect(html).toContain('data-scope="toggle-group"');
		expect(html).toContain('data-part="root"');
		expect(html).toContain("B");
		expect(html).toContain("I");
		expect(html).toContain('data-value="bold"');
		expect(html).toContain('data-state="on"');
		expect(html).toContain('data-state="off"');
	});

	test("should render as an island when interactive", () => {
		const html = (
			<ToggleGroup interactive items={[{ label: "B", value: "bold" }]} />
		).toString();

		expect(html).toContain('data-hydrated="true"');
	});

	test("should support multiple selection", () => {
		const html = (
			<ToggleGroup
				multiple
				defaultValue={["bold", "italic"]}
				items={[
					{ label: "B", value: "bold" },
					{ label: "I", value: "italic" },
				]}
			/>
		).toString();

		expect(html).toContain('role="checkbox"');
		expect(html).toContain('aria-pressed="true"');
	});
});
