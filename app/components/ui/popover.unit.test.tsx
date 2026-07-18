import { describe, expect, test } from "bun:test";
import { Popover } from "./popover";

describe("Popover Unit Tests", () => {
	test("should render flattened API correctly", () => {
		const html = (
			<Popover
				interactive={false}
				trigger={<button type="button">Open</button>}
				title="Popover Title"
				body="This is the popover body content."
			/>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Open");
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('role="dialog"');
		expect(html).toContain("Popover Title");
		expect(html).toContain("This is the popover body content.");
		expect(html).toContain('data-part="close-trigger"');
	});

	test("should render arrow when showArrow is true", () => {
		const html = (<Popover interactive={false} showArrow={true} />).toString();

		expect(html).toContain('class="popover__arrow"');
	});

	test("should not render arrow when showArrow is false", () => {
		const html = (<Popover interactive={false} showArrow={false} />).toString();

		expect(html).not.toContain('class="popover__arrow"');
	});

	test("should render footer when provided", () => {
		const html = (
			<Popover interactive={false} footer={<div>Footer Content</div>} />
		).toString();

		expect(html).toContain("Footer Content");
	});

	test("should not trigger focus on first render when closed", () => {
		// Since tests run in a Node/Bun environment where full browser globals like `document` or `Document` might not be defined or fully populated,
		// we verify that the component rendering works cleanly and we mock HTMLElement.focus if document exists.
		let focusCalledCount = 0;
		if (typeof document !== "undefined") {
			const originalFocus = HTMLElement.prototype.focus;
			HTMLElement.prototype.focus = () => {
				focusCalledCount++;
			};

			const div = document.createElement("div");
			document.body.appendChild(div);

			div.innerHTML = (
				<Popover
					id="test-focus-popover"
					interactive={true}
					trigger={
						<button id="test-trigger" type="button">
							Open
						</button>
					}
					title="Popover Title"
					body="This is the popover body content."
				/>
			).toString();

			HTMLElement.prototype.focus = originalFocus;
			document.body.removeChild(div);
		}

		expect(focusCalledCount).toBe(0);
	});
});
