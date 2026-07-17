import { defineSlotRecipe } from "@pandacss/dev";

export const radioCardGroup = defineSlotRecipe({
	className: "radio-card-group",
	slots: ["root", "label", "item", "itemText", "itemControl", "indicator"],
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			gap: "1.5",
			width: "full",
		},
		item: {
			alignItems: "center",
			borderRadius: "l2",
			cursor: "pointer",
			display: "flex",
			justifyContent: "space-between",
			userSelect: "none",
			width: "full",
			transitionDuration: "normal",
			transitionProperty: "background, border-color, box-shadow, color",
			_disabled: {
				layerStyle: "disabled",
				cursor: "not-allowed",
			},
		},
		label: {
			textStyle: "label",
		},
		itemControl: {
			alignItems: "center",
			borderRadius: "full",
			display: "inline-flex",
			flexShrink: 0,
			justifyContent: "center",
			verticalAlign: "top",
			transitionDuration: "normal",
			transitionProperty: "border-color, background, box-shadow",
			_after: {
				content: '""',
				display: "block",
				borderRadius: "full",
				transitionDuration: "normal",
				transitionProperty: "background",
			},
			_focusVisible: {
				focusVisibleRing: "outside",
			},
		},
		itemText: {
			textStyle: "label",
		},
		indicator: {
			transitionDuration: "normal",
			transitionProperty: "all",
			transitionTimingFunction: "default",
		},
	},
	defaultVariants: {
		variant: "outline",
		size: "md",
	},
	variants: {
		variant: {
			subtle: {
				item: {
					background: "gray.subtle.bg",
					color: "gray.subtle.fg",
					_checked: {
						background: "colorPalette.subtle.bg",
						color: "colorPalette.subtle.fg",
					},
				},
				itemControl: {
					borderWidth: "1px",
					// The theme's `gray` (slate) palette defines no `subtle.border`
					// token, so Park UI's upstream reference would resolve to an
					// undefined CSS variable; `outline.border` is the same hairline.
					borderColor: "gray.outline.border",
					_checked: {
						borderColor: "colorPalette.solid.bg",
						_after: {
							bg: "colorPalette.solid.bg",
						},
					},
				},
			},
			outline: {
				item: {
					borderWidth: "1px",
					borderColor: "gray.outline.border",
					_checked: {
						boxShadow: "0 0 0 1px var(--shadow-color)",
						boxShadowColor: "colorPalette.solid.bg",
						borderColor: "colorPalette.solid.bg",
					},
				},
				itemControl: {
					borderWidth: "1px",
					borderColor: "gray.outline.border",
					_checked: {
						bg: "colorPalette.solid.bg",
						borderColor: "colorPalette.solid.bg",
						_after: {
							background: "colorPalette.solid.fg",
						},
					},
				},
			},
			surface: {
				item: {
					borderWidth: "1px",
					background: "gray.surface.bg",
					borderColor: "gray.surface.border",
					color: "gray.surface.fg",
					_checked: {
						boxShadow: "0 0 0 1px var(--shadow-color)",
						boxShadowColor: "colorPalette.solid.bg",
						borderColor: "colorPalette.solid.bg",
					},
				},
				itemControl: {
					borderWidth: "1px",
					borderColor: "gray.outline.border",
					_checked: {
						background: "colorPalette.solid.bg",
						borderColor: "colorPalette.solid.bg",
						_after: {
							background: "colorPalette.solid.fg",
						},
					},
				},
			},
			solid: {
				item: {
					borderWidth: "1px",
					borderColor: "gray.outline.border",
					_checked: {
						bg: "colorPalette.solid.bg",
						color: "colorPalette.solid.fg",
						borderColor: "colorPalette.solid.bg",
					},
				},
				itemControl: {
					borderWidth: "1px",
					borderColor: "gray.outline.border",
					_checked: {
						background: "colorPalette.solid.fg",
						borderColor: "colorPalette.solid.fg",
						_after: {
							bg: "colorPalette.solid.bg",
						},
					},
				},
			},
		},
		size: {
			md: {
				item: { gap: "2", p: "4" },
				itemControl: { boxSize: "5", _after: { boxSize: "2" } },
				itemText: { textStyle: "sm" },
			},
		},
		// Slot-keyed like tabs/date-picker (a bare style object would be
		// silently dropped by Panda's slot-recipe compiler, as in carousel).
		// The theme has no top-level `slate` palette — it's registered as
		// `gray` — so the CMS's `slate` option maps to the gray tokens.
		colorPalette: {
			blue: { root: { colorPalette: "blue" } },
			green: { root: { colorPalette: "green" } },
			red: { root: { colorPalette: "red" } },
			purple: { root: { colorPalette: "purple" } },
			orange: { root: { colorPalette: "orange" } },
			amber: { root: { colorPalette: "amber" } },
			cyan: { root: { colorPalette: "cyan" } },
			slate: { root: { colorPalette: "gray" } },
			gray: { root: { colorPalette: "gray" } },
		},
	},
});
