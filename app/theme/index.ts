import { animationStyles } from "./animation-styles";
import { cyan } from "./colors/cyan";
import { green } from "./colors/green";
import { red } from "./colors/red";
import { slate } from "./colors/slate";
import { conditions } from "./conditions";
import { globalCss } from "./global-css";
import { keyframes } from "./keyframes";
import { layerStyles } from "./layer-styles";
import { recipes, slotRecipes } from "./recipes";
import { textStyles } from "./text-styles";
import { colors } from "./tokens/colors";
import { durations } from "./tokens/durations";
import { shadows } from "./tokens/shadows";
import { zIndex } from "./tokens/z-index";

const config = {
	animationStyles,
	recipes,
	slotRecipes,
	keyframes,
	layerStyles,
	textStyles,

	tokens: {
		colors,
		durations,
		zIndex,
	},

	semanticTokens: {
		colors: {
			fg: {
				default: {
					value: {
						_light: "{colors.gray.12}",
						_dark: "{colors.gray.12}",
					},
				},

				muted: {
					value: {
						_light: "{colors.gray.11}",
						_dark: "{colors.gray.11}",
					},
				},

				subtle: {
					value: {
						_light: "{colors.gray.10}",
						_dark: "{colors.gray.10}",
					},
				},
			},

			border: {
				value: {
					_light: "{colors.gray.4}",
					_dark: "{colors.gray.4}",
				},
			},

			error: {
				value: {
					_light: "{colors.red.9}",
					_dark: "{colors.red.9}",
				},
			},

			cyan,
			gray: slate,
			red,
			green,
		},

		shadows,

		radii: {
			l1: {
				value: "{radii.xs}",
			},

			l2: {
				value: "{radii.sm}",
			},

			l3: {
				value: "{radii.md}",
			},
		},
	},
};

export {
	animationStyles,
	colors,
	conditions,
	config,
	cyan,
	durations,
	globalCss,
	green,
	keyframes,
	layerStyles,
	recipes,
	red,
	shadows,
	slate,
	slotRecipes,
	textStyles,
	zIndex,
};
