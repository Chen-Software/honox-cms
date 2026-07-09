import { paginationAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const pagination = defineSlotRecipe({
	className: "pagination",
	slots: paginationAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			alignItems: "center",
			gap: "1",
			width: "full",
			justifyContent: "center",
		},
		item: {
			borderRadius: "l2",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			h: "10",
			minW: "10",
			fontWeight: "semibold",
			textStyle: "sm",
			transition: "colors",
			_hover: {
				bg: "bg.subtle",
			},
			_selected: {
				bg: "accent.default",
				color: "accent.fg",
				_hover: {
					bg: "accent.default",
				},
			},
			_disabled: {
				layerStyle: "disabled",
			},
		},
		ellipsis: {
			alignItems: "center",
			color: "fg.muted",
			display: "inline-flex",
			justifyContent: "center",
			fontWeight: "semibold",
			h: "10",
			minW: "10",
		},
		prevTrigger: {
			borderRadius: "l2",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			h: "10",
			minW: "10",
			transition: "colors",
			_hover: {
				bg: "bg.subtle",
			},
			_disabled: {
				layerStyle: "disabled",
				opacity: 0.4,
				cursor: "not-allowed",
			},
		},
		nextTrigger: {
			borderRadius: "l2",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			h: "10",
			minW: "10",
			transition: "colors",
			_hover: {
				bg: "bg.subtle",
			},
			_disabled: {
				layerStyle: "disabled",
				opacity: 0.4,
				cursor: "not-allowed",
			},
		},
		firstTrigger: {
			borderRadius: "l2",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			h: "10",
			minW: "10",
			transition: "colors",
			_hover: {
				bg: "bg.subtle",
			},
			_disabled: {
				layerStyle: "disabled",
				opacity: 0.4,
				cursor: "not-allowed",
			},
		},
		lastTrigger: {
			borderRadius: "l2",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			h: "10",
			minW: "10",
			transition: "colors",
			_hover: {
				bg: "bg.subtle",
			},
			_disabled: {
				layerStyle: "disabled",
				opacity: 0.4,
				cursor: "not-allowed",
			},
		},
	},
});
