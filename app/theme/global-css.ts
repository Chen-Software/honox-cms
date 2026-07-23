export const globalCss = {
	extend: {
		"*": {
			"--global-color-border": "colors.border",
			"--global-color-placeholder": "colors.fg.subtle",
			"--global-color-selection": "colors.colorPalette.subtle.bg",
			"--global-color-focus-ring": "colors.colorPalette.solid.bg",
		},
		html: {
			colorPalette: "gray",
			colorScheme: { _light: "light", _dark: "dark" },
		},
		body: {
			background: "canvas",
			color: "fg.default",
		},
	},
};
