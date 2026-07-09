import { defineConfig } from "@pandacss/dev";
import * as theme from "./app/theme";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ["./app/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: { extend: { ...theme.config } },

	// The output directory for your css system
	outdir: "styled-system",

	// Force-generate the `colorPalette` utility for every palette.
	// Components (Badge, Button, ...) pass `colorPalette` as a runtime value to
	// `css()`, so the PostCSS extractor cannot statically discover which palettes
	// are used and would only emit the gray default. Without this, every badge
	// renders with the same fallback color regardless of its colorPalette prop.
	staticCss: {
		// utilities: ["colorPalette"],
		recipes: {
			pagination: ["*"],
			absoluteCenter: ["*"],
			avatar: ["*"],
			alert: ["*"],
			badge: ["*"],
			breadcrumb: ["*"],
			button: ["*"],
			card: ["*"],
			checkbox: ["*"],
			collapsible: ["*"],
			combobox: ["*"],
			dialog: ["*"],
			drawer: ["*"],
			field: ["*"],
			fieldset: ["*"],
			group: ["*"],
			heading: ["*"],
			hoverCard: ["*"],
			input: ["*"],
			menu: ["*"],
			popover: ["*"],
			progress: ["*"],
			segmentGroup: ["*"],
			skeleton: ["*"],
			slider: ["*"],
			spinner: ["*"],
			splitter: ["*"],
			switch: ["*"],
			table: ["*"],
			tabs: ["*"],
			text: ["*"],
			textarea: ["*"],
			toast: ["*"],
			toggleGroup: ["*"],
			tooltip: ["*"],
		},
	},

	// Disable JSX framework (using Hono JSX instead)
	jsxFramework: undefined,

	plugins: [
		{
			name: "Remove Panda Preset Colors",
			hooks: {
				"preset:resolved": ({ utils, preset, name }) =>
					name === "@pandacss/preset-panda"
						? utils.omit(preset, [
								"theme.tokens.colors",
								"theme.semanticTokens.colors",
							])
						: preset,
			},
		},
	],

	globalCss: theme.globalCss,
	conditions: theme.conditions,
});