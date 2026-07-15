import { defineConfig } from "@pandacss/dev";
import * as theme from "./app/theme";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ["./app/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	// Useful for theme customisation
	theme: { extend: { ...theme.config } },

	// The output directory for your css system
	outdir: "styled-system",

	staticCss: {
		// Every recipe here must keep `["*"]`: none of them (aside from alert,
		// button, skeleton, input) declare a `jsx: [...]` mapping in their recipe
		// definition, so Panda's static extractor cannot associate `<Foo size="sm">`
		// JSX usage with the recipe at all — it only sees `recipe(variantProps)`
		// calls inside the primitive files, always with a runtime-destructured
		// object, never literal args. Verified empirically: dropping force-generation
		// for e.g. `code` silently removed every non-default size/variant class
		// (`code--size_sm/lg/xl`, `code--variant_solid/surface/outline/plain`) even
		// though app/routes/index.tsx uses them all literally. A real reduction here
		// would require adding `jsx: [...]` to each recipe first — a separate,
		// larger change — not just trimming this list.
		recipes: {
			datePicker: ["*"],
			select: ["*"],
			pagination: ["*"],
			absoluteCenter: ["*"],
			avatar: ["*"],
			alert: ["*"],
			badge: ["*"],
			breadcrumb: ["*"],
			button: ["*"],
			card: ["*"],
			checkbox: ["*"],
			code: ["*"],
			collapsible: ["*"],
			combobox: ["*"],
			dialog: ["*"],
			drawer: ["*"],
			field: ["*"],
			fieldset: ["*"],
			fileUpload: ["*"],
			group: ["*"],
			heading: ["*"],
			hoverCard: ["*"],
			input: ["*"],
			link: ["*"],
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
			gridRow: ["*"],
			gridCol: ["*"],
		},
		patterns: {
			stack: ["*"],
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
