import { css } from "design-system/css";

// Shared typography for rendered markdown (`dangerouslySetInnerHTML` output),
// used by both blog posts and docs pages.
export const markdownContentClass = css({
	"& h1": {
		fontSize: "2xl",
		fontWeight: "bold",
		mt: "8",
		mb: "4",
		color: "fg",
		lineHeight: "tight",
	},
	"& h2": {
		fontSize: "xl",
		fontWeight: "semibold",
		mt: "6",
		mb: "3",
		color: "fg",
		lineHeight: "tight",
		paddingBottom: "2",
		borderBottomWidth: "2px",
		borderColor: "border.subtle",
	},
	"& h3": {
		fontSize: "lg",
		fontWeight: "semibold",
		mt: "5",
		mb: "2",
		color: "fg",
	},
	"& p": {
		lineHeight: "relaxed",
		mb: "4",
		color: "fg.muted",
		fontSize: "md",
	},
	"& a": {
		color: "blue.10",
		textDecoration: "none",
		_hover: {
			textDecoration: "underline",
			color: "blue.11",
		},
	},
	"& strong": {
		fontWeight: "semibold",
		color: "fg",
	},
	"& em": {
		fontStyle: "italic",
	},
	"& code": {
		bg: "gray.3",
		color: "red.10",
		px: "1.5",
		py: "0.5",
		borderRadius: "md",
		fontSize: "sm",
		fontFamily: "mono",
	},
	"& pre": {
		bg: "gray.11",
		color: "gray.3",
		p: "6",
		borderRadius: "xl",
		overflowX: "auto",
		mb: "6",
		shadow: "lg",
		"& code": {
			bg: "transparent",
			color: "inherit",
			p: "0",
		},
	},
	"& ul, & ol": {
		pl: "6",
		mb: "4",
		"& li": {
			lineHeight: "relaxed",
			mb: "2",
			color: "fg.muted",
			"&::marker": {
				color: "blue.9",
			},
		},
	},
	"& blockquote": {
		borderLeftWidth: "4px",
		borderLeftColor: "blue.9",
		pl: "6",
		py: "2",
		my: "6",
		bg: "blue.3",
		borderRadius: "sm",
		"& p": {
			color: "fg.subtle",
			fontStyle: "italic",
		},
	},
	"& img": {
		borderRadius: "xl",
		shadow: "md",
		my: "8",
		maxWidth: "full",
		height: "auto",
	},
	"& hr": {
		border: "none",
		borderTopWidth: "2px",
		borderColor: "border.subtle",
		my: "10",
	},
	"& table": {
		width: "full",
		mb: "6",
		borderCollapse: "collapse",
		// Wide tables scroll within themselves instead of stretching the page
		// horizontally on narrow viewports.
		display: "block",
		overflowX: "auto",
		"& th, & td": {
			borderWidth: "1px",
			borderColor: "border",
			px: "4",
			py: "3",
			textAlign: "left",
		},
		"& th": {
			bg: "bg.subtle",
			fontWeight: "semibold",
		},
		"& tr:hover": {
			bg: "bg.subtle",
		},
	},
});
