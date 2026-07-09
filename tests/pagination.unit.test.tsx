import { expect, test } from "bun:test";
import { Pagination } from "../app/components/ui/pagination";

test("Pagination renders basic structure", () => {
	const html = (
		<Pagination count={100} pageSize={10} defaultPage={1} />
	).toString();

	expect(html).toContain("Page 1");
	expect(html).toContain("Page 2");
	expect(html).toContain("…");
	expect(html).toContain("Page 10");
});

test("Pagination applies aria-current on active page", () => {
	const html = (
		<Pagination count={50} pageSize={10} defaultPage={3} />
	).toString();

	expect(html).toContain('aria-current="page"');
	expect(html).toContain('data-selected=""');
});

test("Pagination supports custom renderItem", () => {
	const html = (
		<Pagination
			count={50}
			pageSize={10}
			defaultPage={2}
			renderItem={(page) => `Custom-${page.value}`}
		/>
	).toString();

	expect(html).toContain("Custom-1");
	expect(html).toContain("Custom-2");
	expect(html).toContain("Custom-5");
});

test("Pagination supports custom ellipsis", () => {
	const html = (
		<Pagination
			count={100}
			pageSize={10}
			defaultPage={1}
			ellipsis="CUSTOM_ELLIPSIS"
		/>
	).toString();

	expect(html).toContain("CUSTOM_ELLIPSIS");
});
