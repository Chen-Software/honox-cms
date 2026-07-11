import { expect, test } from "bun:test";
import { Skeleton } from "../app/components/ui/skeleton";
import { css } from "styled-system/css";

test("Skeleton component renders with shape='circle' and class and boxSize", async () => {
	const html = (await Skeleton({
		shape: "circle",
		class: css({ boxSize: "12" }),
	})) as unknown as { toString: () => string };
	const htmlString = html.toString();
	expect(htmlString).toContain("skeleton");
	expect(htmlString).toContain("skeleton--circle_true");
	expect(htmlString).toContain("size_12");
});

test("Skeleton component renders with shape='circle' and direct size prop", async () => {
	const html = (await Skeleton({
		shape: "circle",
		size: "12",
	})) as unknown as { toString: () => string };
	const htmlString = html.toString();
	expect(htmlString).toContain("skeleton");
	expect(htmlString).toContain("skeleton--circle_true");
	expect(htmlString).toContain('style="width:var(--sizes-12);height:var(--sizes-12)"');
});

test("Skeleton component renders with width and height props", async () => {
	const html = (await Skeleton({
		width: "40",
		height: "6",
	})) as unknown as { toString: () => string };
	const htmlString = html.toString();
	expect(htmlString).toContain("skeleton");
	expect(htmlString).toContain('style="width:var(--sizes-40);height:var(--sizes-6)"');
});

test("Skeleton component renders with shape='circle' and variant='shine' prop", async () => {
	const html = (await Skeleton({
		shape: "circle",
		variant: "shine",
		size: "10",
	})) as unknown as { toString: () => string };
	const htmlString = html.toString();
	expect(htmlString).toContain("skeleton");
	expect(htmlString).toContain("skeleton--circle_true");
	expect(htmlString).toContain("skeleton--variant_shine");
	expect(htmlString).toContain('style="width:var(--sizes-10);height:var(--sizes-10)"');
});

test("Skeleton component renders with shape='text' prop", async () => {
	const html = (await Skeleton({
		shape: "text",
		noOfLines: 2,
	})) as unknown as { toString: () => string };
	const htmlString = html.toString();
	expect(htmlString).toContain("skeleton");
	// Should render multiple lines (as Skeletons inside a stack)
	const skeletonOccurrences = (htmlString.match(/class="[^"]*skeleton/g) || []).length;
	// 2 inner lines = 2 skeletons total
	expect(skeletonOccurrences).toBe(2);
});
