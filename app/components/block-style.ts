import { css } from "design-system/css";

// Validated inline styling for CMS-authored layout blocks (Stack/Grid/Layout).
//
// PandaCSS's `css()` only extracts values it can see statically in source,
// so it can't read content/pages/*.json directly. Rather than bypassing
// Panda with a raw inline `style` string, this follows Panda's own guidance
// for runtime values (https://panda-css.com/docs/guides/dynamic-styling):
// a single *static* `css()` call below — visible to Panda's extractor at
// build time, so it's a real generated/shared/purge-safe class — whose
// declarations read from `var(--cms-*, initial)` custom properties. The
// actual per-instance values are then injected only as those custom
// properties via the `style` prop, which every layout component already
// spreads onto its root element via `...rest`.
//
// Structured fields are validated against an allowlist pattern before
// reaching the DOM, since (unlike the rest of the CMS schema) these values
// are free-text and this is the only place they're checked.

// Every `--cms-*` custom property this class reads must also be reset to
// `initial` right here. Custom properties inherit through the DOM by
// default, so without this reset, a nested block that also carries this
// class (e.g. a `heading`/`text` inside a hero `stack` that sets
// `--cms-bg-image`) silently inherits its *ancestor's* --cms-* values —
// its own `var(--cms-x, initial)` fallback never kicks in because
// `--cms-x` isn't actually unset, just inherited. Declaring `initial` here
// makes it guaranteed-invalid on every element using this class, which
// this same element's own inline `style` (higher specificity) still wins
// over when it sets that var itself.
const layoutStyleClass = css({
	"--cms-margin": "initial",
	"--cms-padding": "initial",
	"--cms-max-width": "initial",
	"--cms-border-radius": "initial",
	"--cms-bg-color": "initial",
	"--cms-bg-image": "initial",
	"--cms-bg-image-light": "initial",
	"--cms-bg-fit": "initial",
	"--cms-text-align": "initial",
	"--cms-opacity": "initial",
	"--cms-box-shadow": "initial",
	"--cms-border-width": "initial",
	"--cms-border-style": "initial",
	"--cms-border-color": "initial",
	"--cms-margin-bottom": "initial",
	"--cms-padding-bottom": "initial",
	"--cms-min-width": "initial",
	"--cms-row-gap": "initial",
	"--cms-width": "initial",
	"--cms-font-size": "initial",
	margin: "var(--cms-margin, initial)",
	padding: "var(--cms-padding, initial)",
	maxWidth: "var(--cms-max-width, initial)",
	borderRadius: "var(--cms-border-radius, initial)",
	backgroundColor: "var(--cms-bg-color, initial)",
	backgroundImage: {
		_dark: "var(--cms-bg-image, initial)",
		_light: "var(--cms-bg-image-light, var(--cms-bg-image, initial))",
	},
	backgroundSize: "var(--cms-bg-fit, initial)",
	backgroundPosition: "center",
	backgroundRepeat: "no-repeat",
	textAlign: "var(--cms-text-align, initial)",
	opacity: "var(--cms-opacity, initial)",
	boxShadow: "var(--cms-box-shadow, initial)",
	// Width defaults to 0 (invisible regardless of style/color) rather than
	// `initial` — CSS's own initial border-width is "medium" (~3px), which
	// would draw an unexpected border on any existing block that only ever
	// set borderColor/borderStyle... but until now no block set any of the
	// three, so this default only matters once authors start using them.
	borderWidth: "var(--cms-border-width, 0)",
	borderStyle: "var(--cms-border-style, solid)",
	borderColor: "var(--cms-border-color, var(--colors-border))",
	// Continuous free-text `style`-string fields (see resolveStyleString below) —
	// same bridge technique, just fed from the parsed manual string instead of
	// a structured CMS field.
	marginBottom: "var(--cms-margin-bottom, initial)",
	paddingBottom: "var(--cms-padding-bottom, initial)",
	minWidth: "var(--cms-min-width, initial)",
	rowGap: "var(--cms-row-gap, initial)",
	width: "var(--cms-width, initial)",
	fontSize: "var(--cms-font-size, initial)",
});

const SPACING =
	/^(-?\d+(\.\d+)?(px|rem|em|%)|0|auto)(\s+(-?\d+(\.\d+)?(px|rem|em|%)|0|auto)){0,3}$/;
const LENGTH = /^(-?\d+(\.\d+)?(px|rem|em|%|vw|vh)|0|none)$/;
const COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s]+\)|[a-zA-Z]+)$/;
// https:// for externally-hosted images, or a root-relative path for ones
// uploaded through the CMS media picker (media_folder -> public_folder: /media).
const SAFE_URL = /^(https:\/\/|\/)[^\s"'()]+$/;
const FIT_VALUES = new Set(["cover", "contain", "auto"]);
const TEXT_ALIGN_VALUES = new Set([
	"left",
	"center",
	"right",
	"justify",
	"start",
	"end",
]);
// Real design-system shadow tokens (design-system/tokens) — a select, not
// freeform CSS, since box-shadow syntax is too complex to safely allowlist
// with a regex. This also gets box-shadow the token consistency margin/
// padding don't have: an editor can only ever pick a real design-system value.
const SHADOW_TOKENS: Record<string, string> = {
	none: "none",
	"2xs": "var(--shadows-2xs)",
	xs: "var(--shadows-xs)",
	sm: "var(--shadows-sm)",
	md: "var(--shadows-md)",
	lg: "var(--shadows-lg)",
	xl: "var(--shadows-xl)",
	"2xl": "var(--shadows-2xl)",
};
const BORDER_STYLE_VALUES = new Set(["solid", "dashed", "dotted"]);
// Same reasoning as SHADOW_TOKENS: a select of real, theme-aware semantic
// border tokens rather than a raw color field, so a border set here still
// looks right in dark mode instead of a CMS editor hardcoding a light-mode hex.
const BORDER_COLOR_TOKENS: Record<string, string> = {
	default: "var(--colors-border)",
	error: "var(--colors-border-error)",
};

// Free-text `style`-string vocabulary measured across content/pages/**/*.json
// (279 blocks, 31 distinct strings, 36 distinct (property, value) pairs,
// 21 properties — see content/tasks/cms-static-css-generalised-bridge.md).
// Small, closed-set properties are validated against an exact allowlist and
// routed to real static Panda classes (registered in panda.config.ts's
// staticCss.css) via `cmsCategoricalClass` below — the same "runtime value,
// pre-generated class" mechanism `colorPaletteClass` already uses for
// `colorPalette`. Continuous properties (margin/padding/lengths) stay on the
// `--cms-*` custom-property bridge above; enumerating arbitrary lengths would
// be the wrong tool for that shape of data.
//
// Hardcoded hexes found in content (#71717a, #6b7280, #e5e7eb) are normalized
// to the semantic tokens the same content already uses elsewhere for the same
// visual intent (`color: var(--colors-fg-muted)` ×36, `border-bottom: 1px
// solid var(--colors-border)` ×6) — this is de-duplicating inconsistent
// authoring, not a fresh design choice.
const COLOR_TOKEN_MAP: Record<string, string> = {
	"var(--colors-fg-muted)": "var(--colors-fg-muted)",
	"#71717a": "var(--colors-fg-muted)",
	"#6b7280": "var(--colors-fg-muted)",
};

const BORDER_SHORTHAND_MAP: Record<string, string> = {
	"1px solid var(--colors-border)": "1px solid var(--colors-border)",
	"1px solid #e5e7eb": "1px solid var(--colors-border)",
};

const FONT_WEIGHT_VALUES = new Set(["600", "bold"]);
const JUSTIFY_CONTENT_VALUES = new Set(["flex-end"]);
const FLEX_WRAP_VALUES = new Set(["wrap"]);
const LETTER_SPACING_VALUES = new Set(["0.05em"]);

interface CategoricalMatch {
	prop: string;
	value: string;
}

// One validator per measured categorical property. Each returns the resolved
// Panda-property/value pair on a match, or `undefined` to drop the
// declaration silently (a bad or novel CMS value shouldn't take the page
// down — same philosophy as `safe()` below). These values are pre-generated
// as real static classes via `panda.config.ts`'s `staticCss.css` — the same
// "runtime value, pre-generated class" mechanism `colorPaletteClass` already
// uses for `colorPalette`, applied via `cmsCategoricalClass` below. Keeping
// this and the `staticCss.css` enumeration in lockstep is what the anti-drift
// check (scripts/check-cms-style-vocab.mjs) guards.
//
// NOTE for anyone verifying this against generated CSS: `panda codegen` only
// rebuilds the `design-system/css`/`tokens`/`patterns`/`recipes` *functions*,
// not `design-system/styles.css` — that file is a separate build artifact
// (`panda cssgen`, or the Vite/PostCSS pipeline via `app/style.css`) and goes
// stale silently. Use `bunx panda cssgen --clean -o design-system/styles.css`
// to check what's actually pre-generated.
const CATEGORICAL_VALIDATORS: Record<
	string,
	(value: string) => CategoricalMatch | undefined
> = {
	"text-align": (v) =>
		TEXT_ALIGN_VALUES.has(v) ? { prop: "textAlign", value: v } : undefined,
	"font-weight": (v) =>
		FONT_WEIGHT_VALUES.has(v) ? { prop: "fontWeight", value: v } : undefined,
	"text-transform": (v) =>
		v === "uppercase" ? { prop: "textTransform", value: v } : undefined,
	"text-decoration": (v) =>
		v === "none" ? { prop: "textDecoration", value: v } : undefined,
	"justify-content": (v) =>
		JUSTIFY_CONTENT_VALUES.has(v)
			? { prop: "justifyContent", value: v }
			: undefined,
	"flex-wrap": (v) =>
		FLEX_WRAP_VALUES.has(v) ? { prop: "flexWrap", value: v } : undefined,
	"flex-shrink": (v) =>
		v === "0" ? { prop: "flexShrink", value: v } : undefined,
	"letter-spacing": (v) =>
		LETTER_SPACING_VALUES.has(v)
			? { prop: "letterSpacing", value: v }
			: undefined,
	"border-radius": (v) =>
		v === "9999px" ? { prop: "borderRadius", value: v } : undefined,
	color: (v) => {
		const mapped = COLOR_TOKEN_MAP[v.toLowerCase()];
		return mapped ? { prop: "color", value: mapped } : undefined;
	},
	"border-bottom": (v) => {
		const mapped = BORDER_SHORTHAND_MAP[v.toLowerCase()];
		return mapped ? { prop: "borderBottom", value: mapped } : undefined;
	},
	"border-top": (v) => {
		const mapped = BORDER_SHORTHAND_MAP[v.toLowerCase()];
		return mapped ? { prop: "borderTop", value: mapped } : undefined;
	},
};

// Continuous free-text properties, validated the same way the structured
// layout fields are (reusing SPACING/LENGTH), then routed to the `--cms-*`
// vars added to `layoutStyleClass` above.
const CONTINUOUS_VALIDATORS: Record<
	string,
	{ cssVar: string; pattern: RegExp }
> = {
	margin: { cssVar: "--cms-margin", pattern: SPACING },
	padding: { cssVar: "--cms-padding", pattern: SPACING },
	"max-width": { cssVar: "--cms-max-width", pattern: LENGTH },
	"margin-bottom": { cssVar: "--cms-margin-bottom", pattern: SPACING },
	"padding-bottom": { cssVar: "--cms-padding-bottom", pattern: SPACING },
	"min-width": { cssVar: "--cms-min-width", pattern: LENGTH },
	"row-gap": { cssVar: "--cms-row-gap", pattern: LENGTH },
	width: { cssVar: "--cms-width", pattern: LENGTH },
	"font-size": { cssVar: "--cms-font-size", pattern: LENGTH },
};

/**
 * Parses a raw CSS-declaration-list string (`"color:#71717a;max-width:42rem"`)
 * into `{ property: value }` pairs. Kebab-case property names are kept as-is
 * here — callers look them up against the kebab-case validator tables above.
 */
function parseStyleDeclarations(style: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const decl of style.split(";")) {
		const idx = decl.indexOf(":");
		if (idx === -1) continue;
		const prop = decl.slice(0, idx).trim().toLowerCase();
		const value = decl.slice(idx + 1).trim();
		if (prop && value) out[prop] = value;
	}
	return out;
}

export interface ResolvedStyleString {
	/** Validated `--cms-*` custom-property assignments from continuous fields. */
	vars: string[];
	/** Validated categorical `{ pandaProp: value }` pairs for a real static class. */
	categorical: Record<string, string>;
}

/**
 * Validates every declaration in a free-text CMS `style` string against the
 * measured, allowlisted vocabulary above. Anything that isn't recognized —
 * an unmeasured property, or a value outside the enumerated set — is
 * silently dropped rather than reaching the DOM unsanitised.
 */
export function resolveStyleString(
	style: string | undefined,
): ResolvedStyleString {
	const vars: string[] = [];
	const categorical: Record<string, string> = {};
	if (!style) return { vars, categorical };

	for (const [prop, value] of Object.entries(parseStyleDeclarations(style))) {
		const categoricalValidator = CATEGORICAL_VALIDATORS[prop];
		if (categoricalValidator) {
			const match = categoricalValidator(value);
			if (match) categorical[match.prop] = match.value;
			continue;
		}

		const continuous = CONTINUOUS_VALIDATORS[prop];
		if (continuous?.pattern.test(value)) {
			vars.push(`${continuous.cssVar}: ${value}`);
		}
	}

	return { vars, categorical };
}

/**
 * Generalizes `colorPaletteClass`'s pattern (app/components/ui/color-palette.ts)
 * past a single property: a literal-shaped `css()` call whose values are only
 * known at runtime (from CMS content) still resolves to a real, pre-generated
 * static class, as long as every value it can produce is enumerated in
 * `panda.config.ts`'s `staticCss.css`. Values that were never enumerated
 * (drift) produce a class with no backing CSS — silently invisible, not
 * broken — which is what the anti-drift script guards against.
 */
export function cmsCategoricalClass(
	entries: Record<string, string>,
): string | undefined {
	if (Object.keys(entries).length === 0) return undefined;
	return css(entries);
}

function safe(value: unknown, pattern: RegExp): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed !== "" && pattern.test(trimmed) ? trimmed : undefined;
}

function safeOpacity(value: unknown): string | undefined {
	const num = typeof value === "number" ? value : Number(value);
	if (typeof value !== "number" && typeof value !== "string") return undefined;
	if (Number.isNaN(num) || num < 0 || num > 1) return undefined;
	return String(num);
}

const STYLE_KEYS = [
	"margin",
	"padding",
	"maxWidth",
	"borderRadius",
	"borderWidth",
	"borderStyle",
	"borderColor",
	"backgroundColor",
	"backgroundImage",
	"backgroundImageLight",
	"backgroundFit",
	"textAlign",
	"opacity",
	"boxShadow",
] as const;

export interface ExtractedLayoutStyle {
	/** The static Panda class to add — only set when there's a var to back it. */
	class?: string;
	/** Inline `--cms-*` custom-property assignments, plus any manual `style`. */
	style?: string;
}

/**
 * Pulls the structured style fields out of `props` (so they don't leak onto
 * the DOM as unknown attributes) and returns the shared Panda class plus a
 * validated inline `style` of `--cms-*` custom properties, composed from
 * them, plus any raw hand-authored `style` value. Values that fail
 * validation are silently dropped rather than thrown — a bad CMS entry
 * shouldn't take the page down.
 */
export function extractLayoutStyle(
	props: Record<string, unknown>,
): ExtractedLayoutStyle {
	const vars: string[] = [];

	const margin = safe(props.margin, SPACING);
	if (margin) vars.push(`--cms-margin: ${margin}`);

	const padding = safe(props.padding, SPACING);
	if (padding) vars.push(`--cms-padding: ${padding}`);

	const maxWidth = safe(props.maxWidth, LENGTH);
	if (maxWidth) vars.push(`--cms-max-width: ${maxWidth}`);

	const borderRadius = safe(props.borderRadius, LENGTH);
	if (borderRadius) vars.push(`--cms-border-radius: ${borderRadius}`);

	const borderWidth = safe(props.borderWidth, LENGTH);
	if (borderWidth) vars.push(`--cms-border-width: ${borderWidth}`);

	if (
		typeof props.borderStyle === "string" &&
		BORDER_STYLE_VALUES.has(props.borderStyle)
	) {
		vars.push(`--cms-border-style: ${props.borderStyle}`);
	}

	if (
		typeof props.borderColor === "string" &&
		props.borderColor in BORDER_COLOR_TOKENS
	) {
		vars.push(`--cms-border-color: ${BORDER_COLOR_TOKENS[props.borderColor]}`);
	}

	const backgroundColor = safe(props.backgroundColor, COLOR);
	if (backgroundColor) vars.push(`--cms-bg-color: ${backgroundColor}`);

	const backgroundImage = safe(props.backgroundImage, SAFE_URL);
	if (backgroundImage) vars.push(`--cms-bg-image: url("${backgroundImage}")`);

	// Optional light-theme override — falls back to `backgroundImage` above
	// when omitted, so existing content with only one image is unaffected.
	const backgroundImageLight = safe(props.backgroundImageLight, SAFE_URL);
	if (backgroundImageLight) {
		vars.push(`--cms-bg-image-light: url("${backgroundImageLight}")`);
	}

	if (backgroundImage || backgroundImageLight) {
		const fit =
			typeof props.backgroundFit === "string" &&
			FIT_VALUES.has(props.backgroundFit)
				? props.backgroundFit
				: "cover";
		vars.push(`--cms-bg-fit: ${fit}`);
	}

	if (
		typeof props.textAlign === "string" &&
		TEXT_ALIGN_VALUES.has(props.textAlign)
	) {
		vars.push(`--cms-text-align: ${props.textAlign}`);
	}

	const opacity = safeOpacity(props.opacity);
	if (opacity) vars.push(`--cms-opacity: ${opacity}`);

	if (typeof props.boxShadow === "string" && props.boxShadow in SHADOW_TOKENS) {
		vars.push(`--cms-box-shadow: ${SHADOW_TOKENS[props.boxShadow]}`);
	}

	for (const key of STYLE_KEYS) {
		delete props[key];
	}

	const manual = typeof props.style === "string" ? props.style : undefined;
	delete props.style;

	const resolved = resolveStyleString(manual);
	vars.push(...resolved.vars);
	const categoricalClass = cmsCategoricalClass(resolved.categorical);

	const varsStyle = vars.join("; ");

	return {
		class:
			[varsStyle ? layoutStyleClass : undefined, categoricalClass]
				.filter(Boolean)
				.join(" ") || undefined,
		style: varsStyle || undefined,
	};
}

/**
 * Same validated pipeline as `extractLayoutStyle`, for block types that have
 * no structured layout fields of their own (heading/text/badge/…) — just a
 * free-text `style` string. Strips `style` off `props` so it never leaks
 * onto the DOM as a raw attribute (the leak `extractLayoutStyle` already
 * closed for layout blocks).
 */
export function extractCmsStyle(
	props: Record<string, unknown>,
): ExtractedLayoutStyle {
	const manual = typeof props.style === "string" ? props.style : undefined;
	delete props.style;

	const resolved = resolveStyleString(manual);
	const categoricalClass = cmsCategoricalClass(resolved.categorical);
	const varsStyle = resolved.vars.join("; ");

	return {
		class:
			[varsStyle ? layoutStyleClass : undefined, categoricalClass]
				.filter(Boolean)
				.join(" ") || undefined,
		style: varsStyle || undefined,
	};
}
