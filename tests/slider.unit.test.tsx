import { describe, expect, it } from "bun:test";
import { Slider } from "../app/components/ui/slider";

describe("Slider component", () => {
	it("should render a horizontal single-thumb slider correctly under SSR with exact range styles", async () => {
		const html = (await Slider({
			min: 0,
			max: 100,
			value: 40,
			orientation: "horizontal",
			interactive: false,
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-scope="slider"');
		expect(htmlString).toContain('data-part="root"');
		expect(htmlString).toContain('data-part="control"');
		expect(htmlString).toContain('data-part="track"');
		expect(htmlString).toContain('data-part="range"');
		expect(htmlString).toContain('data-part="thumb"');

		// Range for single thumb slider horizontal should span from 0% to the value percent
		expect(htmlString).toContain('style="position:absolute;left:0%;width:40%;height:100%;bottom:0"');
		expect(htmlString).toContain('style="left:40%;position:absolute;transform:translateX(-50%)"');
	});

	it("should render a vertical single-thumb slider correctly under SSR with exact range styles", async () => {
		const html = (await Slider({
			min: 10,
			max: 50,
			value: 30, // 30 is exactly (30-10)/(50-10) = 50%
			orientation: "vertical",
			interactive: false,
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-part="range"');
		expect(htmlString).toContain('style="position:absolute;bottom:0%;height:50%;width:100%;left:0"');
		expect(htmlString).toContain('style="bottom:50%;position:absolute;transform:translateY(50%)"');
	});

	it("should render a multi-thumb range slider correctly under SSR with correct range start and end percentage", async () => {
		const html = (await Slider({
			min: 0,
			max: 200,
			value: [50, 150], // 25% to 75%
			orientation: "horizontal",
			interactive: false,
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-part="range"');
		expect(htmlString).toContain('style="position:absolute;left:25%;width:50%;height:100%;bottom:0"');
	});
});
