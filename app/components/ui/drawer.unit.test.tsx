import { describe, expect, test } from "bun:test";
import { Drawer } from "./drawer";

describe("Drawer Unit Tests", () => {
	test("should render flattened API correctly", () => {
		const html = (
			<Drawer
				trigger={<button type="button">Open</button>}
				title="Drawer Title"
				description="Drawer Description"
				body="Body content"
				cancel={<button type="button">Close</button>}
			/>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Open");
		expect(html).toContain('data-part="content"');
		expect(html).toContain("Drawer Title");
		expect(html).toContain("Drawer Description");
		expect(html).toContain("Body content");
		expect(html).toContain("Close");
		expect(html).toContain('data-part="close-trigger"');
	});
});
