import { describe, expect, it } from "bun:test";
import { ColorPicker } from "./color-picker";
import {
	hslToHsv,
	hsvaToHslaString,
	hsvToHsl,
	parseColor,
} from "./color-picker-primitive";

describe("ColorPicker component", () => {
	it("should render a static color picker under SSR correctly with expected parts", async () => {
		const html = (await ColorPicker({
			value: "#ff0000",
			interactive: false,
			presets: ["#ff0000", "#00ff00", "#0000ff"],
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-scope="colorPicker"');
		expect(htmlString).toContain('data-part="root"');
		expect(htmlString).toContain('data-part="control"');
		expect(htmlString).toContain('data-part="area"');
		expect(htmlString).toContain('data-part="areaBackground"');
		expect(htmlString).toContain('data-part="areaThumb"');
		expect(htmlString).toContain('data-part="channel-slider"');
		expect(htmlString).toContain('data-part="channel-slider-label"');
		expect(htmlString).toContain('data-part="channel-slider-track"');
		expect(htmlString).toContain('data-part="channel-slider-thumb"');
		expect(htmlString).toContain('data-part="swatch-group"');
		expect(htmlString).toContain('data-part="swatch"');
	});

	it("should render active format views and inputs correctly", async () => {
		const html = (await ColorPicker({
			value: "#00ff00",
			format: "hex",
			interactive: false,
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-part="view"');
		expect(htmlString).toContain('data-format="hex"');
		expect(htmlString).toContain('data-part="channel-input"');
		expect(htmlString).toContain('data-channel="hex"');
		expect(htmlString).toContain('value="#00ff00"');
	});

	it("should emit real HSL values in hsla strings", () => {
		// Pure red: HSV (0, 100, 100) ↔ HSL (0, 100%, 50%)
		expect(hsvaToHslaString({ h: 0, s: 100, v: 100, a: 1 })).toBe(
			"hsla(0, 100%, 50%, 1)",
		);
		// White: HSV (0, 0, 100) ↔ HSL (0, 0%, 100%)
		expect(hsvaToHslaString({ h: 0, s: 0, v: 100, a: 0.5 })).toBe(
			"hsla(0, 0%, 100%, 0.5)",
		);
	});

	it("should round-trip HSV ↔ HSL", () => {
		for (const [h, s, v] of [
			[210, 80, 60],
			[0, 100, 100],
			[120, 0, 50],
			[300, 45, 90],
		]) {
			const hsl = hsvToHsl(h, s, v);
			const back = hslToHsv(hsl.h, hsl.s, hsl.l);
			expect(Math.abs(back.s - s)).toBeLessThanOrEqual(1);
			expect(Math.abs(back.v - v)).toBeLessThanOrEqual(1);
		}
	});

	it("should parse css colour strings into HSVA", () => {
		expect(parseColor("#ff0000")).toEqual({ h: 0, s: 100, v: 100, a: 1 });
		expect(parseColor("rgb(0, 255, 0)")).toEqual({
			h: 120,
			s: 100,
			v: 100,
			a: 1,
		});
		expect(parseColor("hsl(240, 100%, 50%)").h).toBe(240);
	});

	it("should render label when provided", async () => {
		const html = (await ColorPicker({
			label: "Choose your favorite color",
			value: "#0000ff",
			interactive: false,
		})) as any;
		const htmlString = html.toString();

		expect(htmlString).toContain('data-part="label"');
		expect(htmlString).toContain("Choose your favorite color");
	});
});
