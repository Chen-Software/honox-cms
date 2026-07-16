import { defineSlotRecipe } from "@pandacss/dev";

export const tabs = defineSlotRecipe({
	slots: ["root", "list", "trigger", "content", "indicator", "close", "add"],
	className: "tabs",
	base: {
		root: {
			position: "relative",
			display: "flex",
			alignItems: "start",
			_horizontal: {
				flexDirection: "column",
				gap: "2",
			},
			_vertical: {
				flexDirection: "row",
				gap: "4",
			},
		},
		list: {
			display: "flex",
			position: "relative",
			isolation: "isolate",
			scrollbarWidth: "none",
			_horizontal: {
				flexDirection: "row",
				overflowX: "auto",
			},
			_vertical: {
				flexDirection: "column",
				overflowY: "auto",
			},
			"&::-webkit-scrollbar": {
				display: "none",
			},
		},
		trigger: {
			alignItems: "center",
			cursor: "pointer",
			display: "flex",
			flexShrink: 0,
			fontWeight: "semibold",
			outline: "0",
			position: "relative",
			_icon: {
				flexShrink: 0,
			},
			_focusVisible: {
				zIndex: 1,
				focusVisibleRing: "outside",
			},
			_disabled: {
				layerStyle: "disabled",
			},
		},
		close: {
			alignItems: "center",
			borderRadius: "l1",
			color: "fg.muted",
			display: "inline-flex",
			flexShrink: 0,
			justifyContent: "center",
			outline: "0",
			_hover: {
				bg: "bg.emphasized",
				color: "fg.default",
			},
			_focusVisible: {
				focusVisibleRing: "outside",
			},
		},
		add: {
			alignItems: "center",
			borderRadius: "l2",
			color: "fg.muted",
			cursor: "pointer",
			display: "inline-flex",
			flexShrink: 0,
			justifyContent: "center",
			outline: "0",
			_hover: {
				bg: "bg.subtle",
				color: "fg.default",
			},
			_focusVisible: {
				focusVisibleRing: "outside",
			},
			_disabled: {
				layerStyle: "disabled",
			},
		},
		content: {
			focusVisibleRing: "inside",

			_horizontal: {
				width: "100%",
			},
			_vertical: {
				height: "100%",
			},
		},
		indicator: {
			position: "absolute",
			width: "var(--width)",
			height: "var(--height)",
			left: "var(--left)",
			top: "var(--top)",
			zIndex: -1,
			transitionDuration: "normal",
			transitionProperty: "all",
			transitionTimingFunction: "default",
		},
	},

	variants: {
		colorPalette: {
			blue: { root: { colorPalette: "blue" } },
			green: { root: { colorPalette: "green" } },
			red: { root: { colorPalette: "red" } },
			orange: { root: { colorPalette: "orange" } },
			gray: { root: { colorPalette: "gray" } },
			cyan: { root: { colorPalette: "cyan" } },
			amber: { root: { colorPalette: "amber" } },
			purple: { root: { colorPalette: "purple" } },
		},
		size: {
			xs: {
				list: { gap: "1" },
				trigger: { h: "8", minW: "8", textStyle: "xs", px: "3", gap: "2" },
				close: { boxSize: "4" },
				add: { boxSize: "6" },
			},
			sm: {
				list: { gap: "1" },
				trigger: { h: "9", minW: "9", textStyle: "sm", px: "3.5", gap: "2" },
				close: { boxSize: "4.5" },
				add: { boxSize: "7" },
			},
			md: {
				list: { gap: "1" },
				trigger: { h: "10", minW: "10", textStyle: "sm", px: "4", gap: "2" },
				close: { boxSize: "5" },
				add: { boxSize: "8" },
			},
			lg: {
				list: { gap: "1" },
				trigger: { h: "11", minW: "11", textStyle: "md", px: "4.5", gap: "2" },
				close: { boxSize: "5.5" },
				add: { boxSize: "9" },
			},
		},
		variant: {
			line: {
				root: {
					alignItems: "stretch",
				},
				list: {
					_horizontal: {
						borderBottomWidth: "1px",
					},
					_vertical: {
						borderStartWidth: "1px",
					},
				},
				indicator: {
					background: "colorPalette.solid.bg",
					_horizontal: {
						bottom: "0",
						height: "0.5",
						transform: "translateY(1px)",
					},
					_vertical: {
						left: "0",
						width: "0.5",
						transform: "translateX(-1px)",
					},
				},
				trigger: {
					color: "fg.muted",
					_selected: {
						color: "colorPalette.plain.fg",
					},
				},
			},
			subtle: {
				trigger: {
					color: "fg.muted",
					_selected: {
						color: "colorPalette.subtle.fg",
					},
				},
				indicator: {
					bg: "colorPalette.subtle.bg",
					color: "colorPalette.subtle.fg",
					borderRadius: "l2",
				},
			},
			enclosed: {
				list: {
					bg: {
						_light: "gray.2",
						_dark: "gray.1",
					},
					boxShadow: "inset 0 0 0px 1px var(--shadow-color)",
					boxShadowColor: "border",
					borderRadius: "l3",
					p: "1",
				},
				trigger: {
					color: "fg.muted",
					_selected: {
						color: "colorPalette.surface.fg",
					},
				},
				indicator: {
					borderRadius: "l2",
					boxShadow: {
						_light: "xs",
						_dark: "none",
					},
					bg: {
						_light: "white",
						_dark: "gray.2",
					},
				},
			},
			card: {
				root: {
					alignItems: "stretch",
				},
				list: {
					gap: "1",
					_horizontal: {
						borderBottomWidth: "1px",
					},
					_vertical: {
						borderStartWidth: "1px",
					},
				},
				indicator: {
					display: "none",
				},
				trigger: {
					bg: "bg.subtle",
					borderWidth: "1px",
					borderColor: "border",
					color: "fg.muted",
					_horizontal: {
						borderTopRadius: "l2",
						mb: "-1px",
					},
					_vertical: {
						borderStartRadius: "l2",
						me: "-1px",
					},
					_selected: {
						bg: "bg.default",
						borderColor: "border",
						color: "colorPalette.plain.fg",
						zIndex: 1,
						_horizontal: {
							borderBottomColor: "bg.default",
						},
						_vertical: {
							borderInlineEndColor: "bg.default",
						},
					},
				},
			},
		},
		centered: {
			true: {
				list: {
					justifyContent: "center",
				},
			},
		},
		fitted: {
			true: {
				root: {
					alignItems: "stretch",
				},
				trigger: {
					flex: 1,
					textAlign: "center",
					justifyContent: "center",
				},
			},
		},
	},

	defaultVariants: {
		size: "md",
		colorPalette: "gray",
		variant: "line",
	},
});
