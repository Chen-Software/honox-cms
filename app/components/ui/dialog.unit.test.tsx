import { describe, expect, test } from "bun:test";
import { Dialog } from "./dialog";

describe("Dialog Unit Tests", () => {
	test("should render flattened API correctly", () => {
		const html = (
			<Dialog
				trigger={<button type="button">Open</button>}
				title="Dialog Title"
				description="Dialog Description"
				body="Body content"
				cancel={<button type="button">Close</button>}
			/>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Open");
		expect(html).toContain('data-part="content"');
		expect(html).toContain("Dialog Title");
		expect(html).toContain("Dialog Description");
		expect(html).toContain("Body content");
		expect(html).toContain("Close");
		expect(html).toContain('data-part="close-trigger"');
	});
});
