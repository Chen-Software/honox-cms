import { expect, test } from "bun:test";
import { PageRenderer } from "../app/components/page-renderer";

test("PageRenderer renders card and its children components correctly", () => {
	const content = [
		{
			type: "card",
			title: "Mountain Adventure",
			description: "Explore nature.",
			body: "Get ready for a nice trip.",
			children: [
				{
					type: "button",
					text: "Book Cabin",
					variant: "solid",
					colorPalette: "green"
				}
			]
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Mountain Adventure");
	expect(html).toContain("Explore nature.");
	expect(html).toContain("Get ready for a nice trip.");
	expect(html).toContain("Book Cabin");
});

test("PageRenderer renders checkbox correctly", () => {
	const content = [
		{
			type: "checkbox",
			label: "Accept Terms",
			checked: true,
			colorPalette: "blue"
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Accept Terms");
	expect(html).toContain("checkbox");
});

test("PageRenderer renders collapsible correctly", () => {
	const content = [
		{
			type: "collapsible",
			triggerText: "Click to reveal",
			showIndicator: true,
			children: [
				{
					type: "text",
					content: "Secret content"
				}
			]
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Click to reveal");
	expect(html).toContain("Secret content");
});

test("PageRenderer renders combobox correctly", () => {
	const content = [
		{
			type: "combobox",
			label: "Select Tech",
			placeholder: "Choose...",
			items: [
				{ "label": "Hono", "value": "hono" },
				{ "label": "React", "value": "react" }
			]
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Select Tech");
	expect(html).toContain("Choose...");
	expect(html).toContain("Hono");
	expect(html).toContain("React");
});

test("PageRenderer renders dialog correctly", () => {
	const content = [
		{
			type: "dialog",
			title: "Confirm Action",
			description: "Are you sure?",
			triggerText: "Open Dialog",
			confirmText: "Yes",
			cancelText: "No"
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Confirm Action");
	expect(html).toContain("Are you sure?");
	expect(html).toContain("Open Dialog");
	expect(html).toContain("Yes");
	expect(html).toContain("No");
});

test("PageRenderer renders drawer correctly", () => {
	const content = [
		{
			type: "drawer",
			title: "Sidebar",
			description: "Extra options.",
			triggerText: "Open Drawer",
			confirmText: "Save",
			cancelText: "Close"
		}
	];

	const html = (<PageRenderer content={content} />).toString();

	expect(html).toContain("Sidebar");
	expect(html).toContain("Extra options.");
	expect(html).toContain("Open Drawer");
	expect(html).toContain("Save");
	expect(html).toContain("Close");
});
