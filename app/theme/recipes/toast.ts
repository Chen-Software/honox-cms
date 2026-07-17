import { defineSlotRecipe } from "@pandacss/dev";

export const toast = defineSlotRecipe({
	className: "toast",
	jsx: ["Toast"],
	slots: [
		"root",
		"title",
		"description",
		"actionTrigger",
		"closeTrigger",
		"indicator",
	],
	base: {
		root: {
			alignItems: "start",
			background: "gray.surface.bg",
			borderInlineStartColor: "colorPalette.solid.bg",
			borderInlineStartStyle: "solid",
			borderInlineStartWidth: "3px",
			borderRadius: "l3",
			boxShadow: "lg",
			display: "flex",
			gap: "3",
			maxWidth: "sm",
			minWidth: "sm",
			overflowWrap: "anywhere",
			p: "4",
			position: "relative",
			width: "full",
			"--x": "0",
			"--y": "0",
			translate: "var(--x) var(--y)",
			transitionProperty: "translate, opacity",
			transitionDuration: "normal",
			transitionTimingFunction: "default",
			willChange: "translate, opacity",
			_open: {
				animationDuration: "slow",
			},
			_closed: {
				animationDuration: "normal",
				pointerEvents: "none",
			},
			"&[data-swipe=move]": {
				transitionDuration: "0s",
			},
		},
		title: {
			color: "fg.default",
			fontWeight: "medium",
			textStyle: "sm",
		},
		description: {
			color: "fg.muted",
			textStyle: "sm",
		},
		actionTrigger: {
			color: "colorPalette.plain.fg",
			cursor: "pointer",
			fontWeight: "semibold",
			textStyle: "sm",
		},
		closeTrigger: {
			position: "absolute",
			top: "2",
			insetEnd: "2",
		},
		indicator: {
			alignItems: "center",
			color: "colorPalette.solid.bg",
			display: "inline-flex",
			flexShrink: "0",
			justifyContent: "center",
			_icon: { boxSize: "5" },
		},
	},
	defaultVariants: {
		type: "info",
		placement: "bottom",
	},
	variants: {
		type: {
			info: { root: { colorPalette: "blue" } },
			success: { root: { colorPalette: "green" } },
			warning: { root: { colorPalette: "orange" } },
			error: { root: { colorPalette: "red" } },
			loading: { root: { colorPalette: "gray" } },
		},
		placement: {
			top: {
				root: {
					_open: { animationName: "slide-from-top-full, fade-in" },
					_closed: { animationName: "slide-to-top-full, fade-out" },
				},
			},
			bottom: {
				root: {
					_open: { animationName: "slide-from-bottom-full, fade-in" },
					_closed: { animationName: "slide-to-bottom-full, fade-out" },
				},
			},
		},
	},
});
