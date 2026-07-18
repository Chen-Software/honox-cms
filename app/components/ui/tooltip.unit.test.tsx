import { describe, expect, test } from "bun:test";
import { Tooltip } from "./tooltip";

describe("Tooltip Unit Tests", () => {
	test("should render trigger and content", () => {
		const html = (
			<Tooltip interactive={false} content="Helpful hint">
				<button type="button">Hover me</button>
			</Tooltip>
		).toString();

		expect(html).toContain('data-part="trigger"');
		expect(html).toContain("Hover me");
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('role="tooltip"');
		expect(html).toContain("Helpful hint");
	});

	test("content is always present in the DOM (not conditionally unmounted)", () => {
		const html = (
			<Tooltip interactive={false} content="Always mounted">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain('data-part="content"');
		expect(html).toContain("Always mounted");
	});

	test("aria-describedby always references the content id, even while closed", () => {
		const html = (
			<Tooltip interactive={false} id="my-tip" content="Description text">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain('aria-describedby="tooltip-content-my-tip"');
		expect(html).toContain('id="tooltip-content-my-tip"');
	});

	test("should render arrow when showArrow is true", () => {
		const html = (
			<Tooltip interactive={false} showArrow content="With arrow">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain('class="tooltip__arrow"');
	});

	test("should not render arrow when showArrow is false", () => {
		const html = (
			<Tooltip interactive={false} content="No arrow">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).not.toContain('class="tooltip__arrow"');
	});

	test("default placement is top, and is reflected on the positioner", () => {
		const html = (
			<Tooltip interactive={false} content="Placement check">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain('data-placement="top"');
	});

	test("respects an explicit placement prop", () => {
		const html = (
			<Tooltip interactive={false} placement="right" content="Right side">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain('data-placement="right"');
	});

	test("disabled renders only the trigger children, no tooltip markup", () => {
		const html = (
			<Tooltip interactive={false} disabled content="Should not render">
				<button type="button">Trigger</button>
			</Tooltip>
		).toString();

		expect(html).toContain("Trigger");
		expect(html).not.toContain("Should not render");
		expect(html).not.toContain('data-part="positioner"');
	});

	test("should not trigger focus on first render when closed", () => {
		let focusCalledCount = 0;
		if (typeof document !== "undefined") {
			const originalFocus = HTMLElement.prototype.focus;
			HTMLElement.prototype.focus = () => {
				focusCalledCount++;
			};

			const div = document.createElement("div");
			document.body.appendChild(div);

			div.innerHTML = (
				<Tooltip
					id="test-focus-tooltip"
					interactive={true}
					content="Tooltip content"
				>
					<button id="test-trigger" type="button">
						Hover
					</button>
				</Tooltip>
			).toString();

			HTMLElement.prototype.focus = originalFocus;
			document.body.removeChild(div);
		}

		expect(focusCalledCount).toBe(0);
	});
});
