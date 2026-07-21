import { cx } from "design-system/css";
import { type CarouselVariantProps, carousel } from "design-system/recipes";
import {
	type Child,
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "hono/jsx";
import { ChevronLeftIcon } from "../../icons/chevron-left";
import { ChevronRightIcon } from "../../icons/chevron-right";
import { PauseIcon } from "../../icons/pause";
import { PlayIcon } from "../../icons/play";

type CarouselStyles = ReturnType<typeof carousel>;

export interface CarouselTranslations {
	nextTrigger?: string;
	prevTrigger?: string;
	indicator?: (index: number) => string;
	item?: (index: number, count: number) => string;
	autoplayStart?: string;
	autoplayStop?: string;
	progressText?: (details: { page: number; totalPages: number }) => string;
}

const defaultTranslations: Required<CarouselTranslations> = {
	nextTrigger: "Next slide",
	prevTrigger: "Previous slide",
	indicator: (index) => `Go to slide ${index + 1}`,
	item: (index, count) => `${index + 1} of ${count}`,
	autoplayStart: "Start slide rotation",
	autoplayStop: "Stop slide rotation",
	progressText: ({ page, totalPages }) => `${page} / ${totalPages}`,
};

function clampValue(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

/**
 * the item index each page "starts" at, computed structurally
 * (no layout measurement) so it's identical on the server and
 * before hydration.
 */
export function getPageSnapPoints(
	slideCount: number,
	slidesPerMove: number | "auto",
	slidesPerPage: number,
): number[] {
	if (slideCount == null || slidesPerPage <= 0) return [];
	const points: number[] = [];
	const perMove =
		slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove;
	if (perMove <= 0) return [];
	for (let i = 0; i < slideCount; i += perMove) {
		if (i + slidesPerPage > slideCount) break;
		points.push(i);
	}
	return points;
}

export interface CarouselContextValue {
	id: string;
	slideCount: number;
	slidesPerPage: number;
	slidesPerMove: number | "auto";
	orientation: "horizontal" | "vertical";
	loop: boolean;
	autoSize: boolean;
	spacing: string;
	padding?: string;
	snapType: "proximity" | "mandatory";
	disabled?: boolean;
	page: number;
	pageSnapPoints: number[];
	isPlaying: boolean;
	isDragging: boolean;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	translations: Required<CarouselTranslations>;
	styles: CarouselStyles;
	classNames?: Record<string, string>;
	ids: {
		root: string;
		itemGroup: string;
		item: (index: number) => string;
		nextTrigger: string;
		prevTrigger: string;
		indicatorGroup: string;
		indicator: (index: number) => string;
		autoplayTrigger: string;
		progressText: string;
	};
	/** Scrolls to a page (0-based). No-op until hydrated. */
	scrollTo: (index: number, instant?: boolean) => void;
	/** Scrolls to the page containing a given slide index. No-op until hydrated. */
	scrollToIndex: (index: number, instant?: boolean) => void;
	/** No-op until hydrated. */
	scrollNext: (instant?: boolean) => void;
	/** No-op until hydrated. */
	scrollPrev: (instant?: boolean) => void;
	/** No-op until hydrated. */
	play: () => void;
	/** No-op until hydrated. */
	pause: () => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export const useCarouselContext = () => useContext(CarouselContext);

function makeIds(id: string) {
	return {
		root: `carousel:${id}`,
		itemGroup: `carousel:${id}:item-group`,
		item: (index: number) => `carousel:${id}:item:${index}`,
		nextTrigger: `carousel:${id}:next-trigger`,
		prevTrigger: `carousel:${id}:prev-trigger`,
		indicatorGroup: `carousel:${id}:indicator-group`,
		indicator: (index: number) => `carousel:${id}:indicator:${index}`,
		autoplayTrigger: `carousel:${id}:autoplay-trigger`,
		progressText: `carousel:${id}:progress-text`,
	};
}

export interface RootProps extends CarouselVariantProps, PropsWithChildren {
	class?: string;
	id?: string;
	/** Total number of slides. Required. */
	slideCount: number;
	page?: number;
	/** @default 0 */
	defaultPage?: number;
	/** @default 1 */
	slidesPerPage?: number;
	/** @default "auto" */
	slidesPerMove?: number | "auto";
	/** @default "horizontal" */
	orientation?: "horizontal" | "vertical";
	/** @default false */
	loop?: boolean;
	/** @default "0px" */
	spacing?: string;
	padding?: string;
	/** @default false */
	autoSize?: boolean;
	/** @default false */
	allowMouseDrag?: boolean;
	autoplay?: boolean | { delay: number };
	/** Pauses autoplay while the pointer is over the carousel. Default `false`. */
	pauseOnHover?: boolean;
	/** @default "mandatory" */
	snapType?: "proximity" | "mandatory";
	disabled?: boolean;
	translations?: CarouselTranslations;
	classNames?: Record<string, string>;
	onPageChange?: (details: { page: number; pageSnapPoint: number }) => void;
	onAutoplayStatusChange?: (details: {
		type: string;
		isPlaying: boolean;
		page: number;
	}) => void;
	onDragStatusChange?: (details: {
		type: string;
		isDragging: boolean;
		page: number;
	}) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	pageSnapPoints?: number[];
	/** Driven by the interactive island; ignored when set by hand. */
	isPlaying?: boolean;
	/** Driven by the interactive island; ignored when set by hand. */
	isDragging?: boolean;
	/** Driven by the interactive island; ignored when set by hand. */
	onScrollTo?: (index: number, instant?: boolean) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onScrollToIndex?: (index: number, instant?: boolean) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onScrollNext?: (instant?: boolean) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onScrollPrev?: (instant?: boolean) => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onPlay?: () => void;
	/** Driven by the interactive island; ignored when set by hand. */
	onPause?: () => void;
	rootRef?: unknown;
	[key: string]: unknown;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = carousel.splitVariantProps(props);
	const {
		children,
		class: classProp,
		id: idProp,
		slideCount,
		page: pageProp,
		defaultPage = 0,
		slidesPerPage = 1,
		slidesPerMove = "auto",
		orientation = "horizontal",
		loop = false,
		spacing = "0px",
		padding,
		autoSize = false,
		snapType = "mandatory",
		disabled,
		translations,
		classNames,
		pageSnapPoints: pageSnapPointsProp,
		isPlaying = false,
		isDragging = false,
		onScrollTo,
		onScrollToIndex,
		onScrollNext,
		onScrollPrev,
		onPlay,
		onPause,
		rootRef,
		// Consumed only by the interactive island — dropped here so they never
		// leak onto the root `<div>` as unknown DOM attributes.
		allowMouseDrag: _allowMouseDrag,
		autoplay: _autoplay,
		pauseOnHover: _pauseOnHover,
		onPageChange: _onPageChange,
		onAutoplayStatusChange: _onAutoplayStatusChange,
		onDragStatusChange: _onDragStatusChange,
		...rest
	} = localProps;

	const styles = carousel(variantProps);
	const autoId = useId();
	const id = idProp || autoId;
	const page = pageProp ?? defaultPage;

	const computedSnapPoints = autoSize
		? Array.from({ length: slideCount }, (_, i) => i)
		: getPageSnapPoints(slideCount, slidesPerMove, slidesPerPage);
	const rawSnapPoints = pageSnapPointsProp ?? computedSnapPoints;
	const pageSnapPoints = rawSnapPoints.length ? rawSnapPoints : [0];
	const activePage = clampValue(page, 0, pageSnapPoints.length - 1);

	const ids = makeIds(id);

	const contextValue: CarouselContextValue = {
		id,
		slideCount,
		slidesPerPage,
		slidesPerMove,
		orientation,
		loop,
		autoSize,
		spacing,
		padding,
		snapType,
		disabled,
		page: activePage,
		pageSnapPoints,
		isPlaying,
		isDragging,
		canScrollPrev: loop || activePage > 0,
		canScrollNext: loop || activePage < pageSnapPoints.length - 1,
		translations: { ...defaultTranslations, ...translations },
		styles,
		classNames,
		ids,
		scrollTo: onScrollTo ?? (() => {}),
		scrollToIndex: onScrollToIndex ?? (() => {}),
		scrollNext: onScrollNext ?? (() => {}),
		scrollPrev: onScrollPrev ?? (() => {}),
		play: onPlay ?? (() => {}),
		pause: onPause ?? (() => {}),
	};

	return (
		<CarouselContext.Provider value={contextValue}>
			<div
				ref={rootRef as never}
				id={ids.root}
				role="region"
				aria-roledescription="carousel"
				class={cx(styles.root, classProp, classNames?.root)}
				data-scope="carousel"
				data-part="root"
				data-orientation={orientation}
				data-disabled={disabled ? "" : undefined}
				style={
					{
						// Numeric style values are serialised with a `px` suffix (even
						// for custom properties), so this must stay a string — the
						// `--slide-item-size` calc() below needs it unitless.
						"--slides-per-page": String(slidesPerPage),
						"--slide-spacing": spacing,
						"--slide-item-size": autoSize
							? "auto"
							: "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))",
					} as Record<string, string>
				}
				{...rest}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

export function RootProvider(props: RootProps) {
	return <Root {...props} />;
}

export interface ItemGroupProps extends PropsWithChildren {
	class?: string;
	itemGroupRef?: unknown;
	[key: string]: unknown;
}

export function ItemGroup(props: ItemGroupProps) {
	const { children, class: classProp, itemGroupRef, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const orientation = context?.orientation ?? "horizontal";
	const horizontal = orientation === "horizontal";
	const isPlaying = context?.isPlaying ?? false;
	const isDragging = context?.isDragging ?? false;
	const padding = context?.padding;

	return (
		<div
			ref={itemGroupRef as never}
			id={context?.ids.itemGroup}
			class={cx(styles.itemGroup, classProp, context?.classNames?.itemGroup)}
			data-scope="carousel"
			data-part="item-group"
			data-orientation={orientation}
			data-dragging={isDragging ? "" : undefined}
			aria-live={isPlaying ? "off" : "polite"}
			// Simplified vs. Ark UI's `syncTabIndex`, which flips between 0/-1
			// based on whether any slide contains a focusable element — always
			// keyboard-focusable here, which is the safer default.
			tabIndex={0}
			style={
				{
					display: context?.autoSize ? "flex" : "grid",
					gap: "var(--slide-spacing)",
					scrollSnapType: `${horizontal ? "x" : "y"} ${context?.snapType ?? "mandatory"}`,
					gridAutoFlow: horizontal ? "column" : "row",
					scrollbarWidth: "none",
					overscrollBehaviorX: "contain",
					[horizontal ? "gridAutoColumns" : "gridAutoRows"]: context?.autoSize
						? undefined
						: "var(--slide-item-size)",
					[horizontal ? "scrollPaddingInline" : "scrollPaddingBlock"]: padding,
					[horizontal ? "paddingInline" : "paddingBlock"]: padding,
					[horizontal ? "overflowX" : "overflowY"]: "auto",
				} as Record<string, string | number | undefined>
			}
			{...rest}
		>
			{children}
		</div>
	);
}

export interface ItemProps extends PropsWithChildren {
	index: number;
	/** @default "start" */
	snapAlign?: "start" | "center" | "end";
	class?: string;
	[key: string]: unknown;
}

export function Item(props: ItemProps) {
	const {
		children,
		index,
		snapAlign = "start",
		class: classProp,
		...rest
	} = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const orientation = context?.orientation ?? "horizontal";
	const horizontal = orientation === "horizontal";
	const slidesPerPage = context?.slidesPerPage ?? 1;
	const slidesPerMove = context?.slidesPerMove ?? "auto";
	const perMove =
		slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove;
	const shouldSnap = perMove > 0 && (index + perMove) % perMove === 0;

	const page = context?.page ?? 0;
	const pageSnapPoints = context?.pageSnapPoints ?? [0];
	const start = pageSnapPoints[page] ?? 0;
	const end = start + slidesPerPage;
	// Structural approximation (index range implied by the current page),
	// refined at runtime by the interactive island's IntersectionObserver.
	const isInView = index >= start && index < end;
	const slideCount = context?.slideCount ?? 0;
	const label =
		context?.translations.item(index, slideCount) ??
		`${index + 1} of ${slideCount}`;

	return (
		<div
			id={context?.ids.item(index)}
			role="group"
			aria-roledescription="slide"
			class={cx(styles.item, classProp, context?.classNames?.item)}
			data-scope="carousel"
			data-part="item"
			data-index={index}
			data-inview={isInView ? "" : undefined}
			data-orientation={orientation}
			aria-label={label}
			aria-hidden={isInView ? undefined : "true"}
			style={
				{
					flex: "0 0 auto",
					[horizontal ? "maxWidth" : "maxHeight"]: "100%",
					scrollSnapAlign: shouldSnap ? snapAlign : undefined,
				} as Record<string, string | undefined>
			}
			{...rest}
		>
			{children}
		</div>
	);
}

export interface ControlProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function Control(props: ControlProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	return (
		<div
			class={cx(styles.control, classProp, context?.classNames?.control)}
			data-scope="carousel"
			data-part="control"
			data-orientation={context?.orientation ?? "horizontal"}
			{...rest}
		>
			{children}
		</div>
	);
}

const DefaultPrevIcon = () => <ChevronLeftIcon width="16" height="16" />;

const DefaultNextIcon = () => <ChevronRightIcon width="16" height="16" />;

export interface TriggerProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function PrevTrigger(props: TriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const disabled =
		Boolean(context?.disabled) || !(context?.canScrollPrev ?? true);
	return (
		<button
			id={context?.ids.prevTrigger}
			type="button"
			disabled={disabled}
			aria-label={
				context?.translations.prevTrigger ?? defaultTranslations.prevTrigger
			}
			aria-controls={context?.ids.itemGroup}
			class={cx(
				styles.prevTrigger,
				classProp,
				context?.classNames?.prevTrigger,
			)}
			data-scope="carousel"
			data-part="prev-trigger"
			data-orientation={context?.orientation ?? "horizontal"}
			{...rest}
		>
			{children ?? <DefaultPrevIcon />}
		</button>
	);
}

export function NextTrigger(props: TriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const disabled =
		Boolean(context?.disabled) || !(context?.canScrollNext ?? true);
	return (
		<button
			id={context?.ids.nextTrigger}
			type="button"
			disabled={disabled}
			aria-label={
				context?.translations.nextTrigger ?? defaultTranslations.nextTrigger
			}
			aria-controls={context?.ids.itemGroup}
			class={cx(
				styles.nextTrigger,
				classProp,
				context?.classNames?.nextTrigger,
			)}
			data-scope="carousel"
			data-part="next-trigger"
			data-orientation={context?.orientation ?? "horizontal"}
			{...rest}
		>
			{children ?? <DefaultNextIcon />}
		</button>
	);
}

export interface IndicatorGroupProps extends PropsWithChildren {
	class?: string;
	[key: string]: unknown;
}

export function IndicatorGroup(props: IndicatorGroupProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	return (
		<div
			id={context?.ids.indicatorGroup}
			class={cx(
				styles.indicatorGroup,
				classProp,
				context?.classNames?.indicatorGroup,
			)}
			data-scope="carousel"
			data-part="indicator-group"
			data-orientation={context?.orientation ?? "horizontal"}
			{...rest}
		>
			{children}
		</div>
	);
}

export interface IndicatorProps {
	index: number;
	readOnly?: boolean;
	class?: string;
	[key: string]: unknown;
}

export function Indicator(props: IndicatorProps) {
	const { index, readOnly, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const isCurrent = (context?.page ?? 0) === index;
	return (
		<button
			id={context?.ids.indicator(index)}
			type="button"
			disabled={context?.disabled}
			class={cx(styles.indicator, classProp, context?.classNames?.indicator)}
			data-scope="carousel"
			data-part="indicator"
			data-orientation={context?.orientation ?? "horizontal"}
			data-index={index}
			data-readonly={readOnly ? "" : undefined}
			data-current={isCurrent ? "" : undefined}
			aria-label={
				context?.translations.indicator(index) ??
				defaultTranslations.indicator(index)
			}
			{...rest}
		/>
	);
}

const DefaultPlayIcon = () => <PlayIcon width="16" height="16" />;

const DefaultPauseIcon = () => <PauseIcon width="16" height="16" />;

export function AutoplayTrigger(props: TriggerProps) {
	const { children, class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const isPlaying = context?.isPlaying ?? false;
	const label = isPlaying
		? (context?.translations.autoplayStop ?? defaultTranslations.autoplayStop)
		: (context?.translations.autoplayStart ??
			defaultTranslations.autoplayStart);
	return (
		<button
			id={context?.ids.autoplayTrigger}
			type="button"
			disabled={context?.disabled}
			aria-label={label}
			class={cx(
				styles.autoplayTrigger,
				classProp,
				context?.classNames?.autoplayTrigger,
			)}
			data-scope="carousel"
			data-part="autoplay-trigger"
			data-orientation={context?.orientation ?? "horizontal"}
			data-pressed={isPlaying ? "" : undefined}
			{...rest}
		>
			{children ?? (isPlaying ? <DefaultPauseIcon /> : <DefaultPlayIcon />)}
		</button>
	);
}

export interface ProgressTextProps {
	class?: string;
	[key: string]: unknown;
}

export function ProgressText(props: ProgressTextProps) {
	const { class: classProp, ...rest } = props;
	const context = useCarouselContext();
	const styles = context?.styles ?? carousel();
	const page = context?.page ?? 0;
	const total = context?.pageSnapPoints.length ?? 1;
	const text =
		context?.translations.progressText({ page: page + 1, totalPages: total }) ??
		defaultTranslations.progressText({ page: page + 1, totalPages: total });
	return (
		<span
			id={context?.ids.progressText}
			class={cx(styles.progressText, classProp)}
			data-scope="carousel"
			data-part="progress-text"
			{...rest}
		>
			{text}
		</span>
	);
}

export function Context(props: {
	children: (context: CarouselContextValue | null) => Child;
}) {
	const context = useCarouselContext();
	return props.children(context);
}

// ============================================================================
// Interactive root
// ============================================================================

function nextPageIndex(length: number, index: number, loop: boolean) {
	if (index >= length - 1) return loop ? 0 : index;
	return index + 1;
}

function prevPageIndex(length: number, index: number, loop: boolean) {
	if (index <= 0) return loop ? length - 1 : index;
	return index - 1;
}

/** Closest item element in `itemGroup` to horizontal/vertical scroll offset `pos`. */
function closestPageIndex(
	itemGroup: HTMLElement,
	pageSnapPoints: number[],
	horizontal: boolean,
) {
	const pos = horizontal ? itemGroup.scrollLeft : itemGroup.scrollTop;
	let best = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	pageSnapPoints.forEach((itemIndex, pageIndex) => {
		const el = itemGroup.querySelector<HTMLElement>(
			`[data-index="${itemIndex}"]`,
		);
		if (!el) return;
		const itemPos = horizontal
			? el.offsetLeft - itemGroup.offsetLeft
			: el.offsetTop - itemGroup.offsetTop;
		const distance = Math.abs(itemPos - pos);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = pageIndex;
		}
	});
	return best;
}

function scrollToItemIndex(
	itemGroup: HTMLElement,
	itemIndex: number,
	horizontal: boolean,
	instant: boolean,
) {
	const el = itemGroup.querySelector<HTMLElement>(
		`[data-index="${itemIndex}"]`,
	);
	if (!el) return;
	const target = horizontal
		? el.offsetLeft - itemGroup.offsetLeft
		: el.offsetTop - itemGroup.offsetTop;
	itemGroup.scrollTo({
		[horizontal ? "left" : "top"]: target,
		behavior: instant ? "instant" : "smooth",
	} as ScrollToOptions);
}

function isFocusableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	return Boolean(
		target.closest("button, a[href], input, textarea, select, [tabindex]"),
	);
}

export interface InteractiveCarouselRootProps extends RootProps {}

export function InteractiveCarouselRoot(props: InteractiveCarouselRootProps) {
	const {
		children,
		id: idProp,
		slideCount,
		page: pageProp,
		defaultPage = 0,
		slidesPerPage = 1,
		slidesPerMove = "auto",
		orientation = "horizontal",
		loop = false,
		autoSize = false,
		allowMouseDrag = false,
		autoplay = false,
		pauseOnHover = false,
		snapType = "mandatory",
		disabled = false,
		onPageChange,
		onAutoplayStatusChange,
		onDragStatusChange,
		...rest
	} = props;

	const horizontal = orientation === "horizontal";
	const computedSnapPoints = autoSize
		? Array.from({ length: slideCount }, (_, i) => i)
		: getPageSnapPoints(slideCount, slidesPerMove, slidesPerPage);
	const pageSnapPoints = computedSnapPoints.length ? computedSnapPoints : [0];

	const isControlled = pageProp !== undefined;
	const [page, setPage] = useState(
		clampValue(pageProp ?? defaultPage, 0, pageSnapPoints.length - 1),
	);
	const activePage = isControlled
		? clampValue(pageProp as number, 0, pageSnapPoints.length - 1)
		: page;

	const initialAutoplay = Boolean(autoplay) && !disabled;
	const [isPlaying, setIsPlaying] = useState(initialAutoplay);
	const [isDragging, setIsDragging] = useState(false);

	const fallbackId = useId();
	const rootIdRef = useRef<string | null>(null);
	if (!rootIdRef.current)
		rootIdRef.current = idProp || `carousel-${fallbackId}`;
	const id = rootIdRef.current;

	const rootRef = useRef<HTMLElement | null>(null);
	// `ItemGroup` is rendered by whatever composed `children` (either by hand,
	// or by the top-level `Carousel`'s auto-composition) rather than by this
	// island directly, so there's no ref to attach at JSX-construction time —
	// it's resolved from the mounted root instead.
	const getItemGroup = () =>
		rootRef.current?.querySelector<HTMLElement>('[data-part="item-group"]') ??
		null;
	const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
		active: false,
		lastX: 0,
		lastY: 0,
	});
	const wasPlayingBeforeHoverRef = useRef(false);

	const onPageChangeRef = useRef(onPageChange);
	onPageChangeRef.current = onPageChange;
	const onAutoplayStatusChangeRef = useRef(onAutoplayStatusChange);
	onAutoplayStatusChangeRef.current = onAutoplayStatusChange;
	const onDragStatusChangeRef = useRef(onDragStatusChange);
	onDragStatusChangeRef.current = onDragStatusChange;

	const applyPageState = (nextPage: number) => {
		const root = rootRef.current;
		if (!root) return;
		root
			.querySelectorAll<HTMLElement>('[data-part="indicator"]')
			.forEach((el) => {
				const isCurrent = Number(el.dataset.index) === nextPage;
				if (isCurrent) el.setAttribute("data-current", "");
				else el.removeAttribute("data-current");
			});
		const canScrollPrev = loop || nextPage > 0;
		const canScrollNext = loop || nextPage < pageSnapPoints.length - 1;
		const prevTrigger = root.querySelector<HTMLButtonElement>(
			'[data-part="prev-trigger"]',
		);
		if (prevTrigger) prevTrigger.disabled = disabled || !canScrollPrev;
		const nextTrigger = root.querySelector<HTMLButtonElement>(
			'[data-part="next-trigger"]',
		);
		if (nextTrigger) nextTrigger.disabled = disabled || !canScrollNext;

		const start = pageSnapPoints[nextPage] ?? 0;
		const end = start + slidesPerPage;
		root.querySelectorAll<HTMLElement>('[data-part="item"]').forEach((el) => {
			const index = Number(el.dataset.index);
			const isInView = index >= start && index < end;
			if (isInView) {
				el.setAttribute("data-inview", "");
				el.removeAttribute("aria-hidden");
			} else {
				el.removeAttribute("data-inview");
				el.setAttribute("aria-hidden", "true");
			}
		});

		const progressText = root.querySelector<HTMLElement>(
			'[data-part="progress-text"]',
		);
		if (progressText) {
			progressText.textContent = (
				rest.translations?.progressText ?? defaultTranslations.progressText
			)({ page: nextPage + 1, totalPages: pageSnapPoints.length });
		}
	};

	const setPageState = (nextPage: number) => {
		const clamped = clampValue(nextPage, 0, pageSnapPoints.length - 1);
		if (!isControlled) setPage(clamped);
		applyPageState(clamped);
		onPageChangeRef.current?.({
			page: clamped,
			pageSnapPoint: pageSnapPoints[clamped] ?? 0,
		});
	};

	const scrollTo = (index: number, instant = false) => {
		const itemGroup = getItemGroup();
		if (!itemGroup) return;
		const clamped = clampValue(index, 0, pageSnapPoints.length - 1);
		scrollToItemIndex(
			itemGroup,
			pageSnapPoints[clamped] ?? 0,
			horizontal,
			instant,
		);
		setPageState(clamped);
	};

	const scrollToIndex = (index: number, instant = false) => {
		let target = 0;
		pageSnapPoints.forEach((itemIndex, pageIndex) => {
			if (itemIndex <= index) target = pageIndex;
		});
		scrollTo(target, instant);
	};

	const scrollNext = (instant = false, opts?: { forceLoop?: boolean }) => {
		const next = nextPageIndex(
			pageSnapPoints.length,
			activePage,
			Boolean(opts?.forceLoop) || loop,
		);
		scrollTo(next, instant);
	};

	const scrollPrev = (instant = false) => {
		const prev = prevPageIndex(pageSnapPoints.length, activePage, loop);
		scrollTo(prev, instant);
	};

	const clearAutoplayTimer = () => {
		if (autoplayTimerRef.current != null) {
			clearInterval(autoplayTimerRef.current);
			autoplayTimerRef.current = null;
		}
	};

	const play = () => {
		if (disabled || pageSnapPoints.length <= 1) return;
		setIsPlaying(true);
		onAutoplayStatusChangeRef.current?.({
			type: "autoplay.start",
			isPlaying: true,
			page: activePage,
		});
	};

	const pause = () => {
		clearAutoplayTimer();
		setIsPlaying(false);
		onAutoplayStatusChangeRef.current?.({
			type: "autoplay.stop",
			isPlaying: false,
			page: activePage,
		});
	};

	// Latest-value refs read by the mount-once effects below. Every listener
	// that's attached to the root/itemGroup/document mounts exactly once
	// (empty, or orientation-only, dependency arrays) and reads current
	// state through these instead of closing over render-scoped values —
	// otherwise a state update mid-gesture (e.g. `pauseOnHover`'s
	// `setIsPlaying`, fired by `pointerenter` just before a paired click)
	// tears the listener down and reattaches it via its dependency array,
	// landing the gesture's own event in the gap between the two.
	const scrollPrevRef = useRef(scrollPrev);
	scrollPrevRef.current = scrollPrev;
	const scrollNextRef = useRef(scrollNext);
	scrollNextRef.current = scrollNext;
	const scrollToRef = useRef(scrollTo);
	scrollToRef.current = scrollTo;
	const playRef = useRef(play);
	playRef.current = play;
	const pauseRef = useRef(pause);
	pauseRef.current = pause;
	const isPlayingRef = useRef(isPlaying);
	isPlayingRef.current = isPlaying;
	const activePageRef = useRef(activePage);
	activePageRef.current = activePage;
	const pageSnapPointsRef = useRef(pageSnapPoints);
	pageSnapPointsRef.current = pageSnapPoints;
	const setPageStateRef = useRef(setPageState);
	setPageStateRef.current = setPageState;

	// Autoplay ticking. Always wraps around at the end (mirrors Ark UI: the
	// machine's `setNextPage` treats the "autoplay" state as implicitly
	// looping regardless of the `loop` prop) and pauses when the tab is hidden.
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (!isPlaying) return;
		const delay =
			typeof autoplay === "object" && autoplay ? autoplay.delay : 4000;
		autoplayTimerRef.current = setInterval(() => {
			scrollNextRef.current(false, { forceLoop: true });
			onAutoplayStatusChangeRef.current?.({
				type: "autoplay",
				isPlaying: true,
				page: activePageRef.current,
			});
		}, delay);
		const onVisibilityChange = () => {
			if (document.visibilityState !== "visible") pause();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			clearAutoplayTimer();
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
		// eslint-disable-next-line
	}, [isPlaying]);

	// Debounced scroll-end sync: whatever moved the scroll position (trigger
	// click, indicator click, wheel, touch swipe, keyboard, or a drag release)
	// settles here into a single, consistent page update. Mounts once per
	// orientation rather than on every `activePage` change — see the refs
	// comment above.
	useEffect(() => {
		if (typeof document === "undefined") return;
		const itemGroup = getItemGroup();
		if (!itemGroup) return;
		const onScroll = () => {
			if (dragRef.current.active) return;
			if (scrollEndTimerRef.current != null)
				clearTimeout(scrollEndTimerRef.current);
			scrollEndTimerRef.current = setTimeout(() => {
				const closest = closestPageIndex(
					itemGroup,
					pageSnapPointsRef.current,
					horizontal,
				);
				if (closest !== activePageRef.current) setPageStateRef.current(closest);
			}, 150);
		};
		itemGroup.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			itemGroup.removeEventListener("scroll", onScroll);
			if (scrollEndTimerRef.current != null)
				clearTimeout(scrollEndTimerRef.current);
		};
	}, [horizontal]);

	// Trigger/indicator clicks, delegated from the root rather than bound via
	// JSX `onClick` on the individual buttons. `PrevTrigger`/`NextTrigger`/
	// `Indicator`/`AutoplayTrigger` are composed as children of this island's
	// `<Root>`, and HonoX hydrates an island's children from a serialised HTML
	// snapshot rather than by reconciling hono/jsx/dom's own synthetic props
	// onto those already-mounted nodes — so a JSX `onClick` on them never
	// actually attaches. Delegation from the root (which *is* the live,
	// freshly-mounted element) sidesteps that entirely; mirrors the pattern
	// `dropdown-primitive.tsx`/`combobox-primitive.tsx` already use.
	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = rootRef.current;
		if (!root) return;
		const onClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const prevTrigger = target.closest<HTMLButtonElement>(
				'[data-part="prev-trigger"]',
			);
			if (prevTrigger && !prevTrigger.disabled) {
				scrollPrevRef.current();
				return;
			}
			const nextTrigger = target.closest<HTMLButtonElement>(
				'[data-part="next-trigger"]',
			);
			if (nextTrigger && !nextTrigger.disabled) {
				scrollNextRef.current();
				return;
			}
			const indicator = target.closest<HTMLButtonElement>(
				'[data-part="indicator"]',
			);
			if (
				indicator &&
				!indicator.disabled &&
				!indicator.hasAttribute("data-readonly")
			) {
				const index = Number(indicator.dataset.index);
				if (!Number.isNaN(index)) scrollToRef.current(index);
				return;
			}
			const autoplayTrigger = target.closest<HTMLButtonElement>(
				'[data-part="autoplay-trigger"]',
			);
			if (autoplayTrigger && !autoplayTrigger.disabled) {
				if (isPlayingRef.current) pauseRef.current();
				else playRef.current();
			}
		};
		root.addEventListener("click", onClick);
		return () => root.removeEventListener("click", onClick);
	}, []);

	// Keyboard paging (ArrowLeft/Right or ArrowUp/Down, Home/End) on the
	// scrollable item group and the indicator group. Mounts once per
	// orientation — see the refs comment above.
	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = rootRef.current;
		if (!root) return;
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				!target.closest(
					'[data-part="item-group"], [data-part="indicator-group"]',
				)
			)
				return;
			const forward = horizontal ? "ArrowRight" : "ArrowDown";
			const backward = horizontal ? "ArrowLeft" : "ArrowUp";
			if (e.key === forward) {
				e.preventDefault();
				scrollNextRef.current();
			} else if (e.key === backward) {
				e.preventDefault();
				scrollPrevRef.current();
			} else if (e.key === "Home") {
				e.preventDefault();
				scrollToRef.current(0);
			} else if (e.key === "End") {
				e.preventDefault();
				scrollToRef.current(pageSnapPointsRef.current.length - 1);
			}
		};
		root.addEventListener("keydown", onKeyDown);
		return () => root.removeEventListener("keydown", onKeyDown);
	}, [horizontal]);

	// Pointer-drag scrolling (opt-in via `allowMouseDrag`). Mounts once per
	// `allowMouseDrag`/orientation — see the refs comment above.
	useEffect(() => {
		if (typeof document === "undefined" || !allowMouseDrag) return;
		const itemGroup = getItemGroup();
		if (!itemGroup) return;
		let originalSnapType = "";

		const onPointerDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			if (isFocusableTarget(e.target) && e.target !== itemGroup) return;
			e.preventDefault();
			itemGroup.setPointerCapture(e.pointerId);
			dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
			originalSnapType = itemGroup.style.scrollSnapType;
			itemGroup.style.scrollSnapType = "none";
			setIsDragging(true);
			itemGroup.setAttribute("data-dragging", "");
			onDragStatusChangeRef.current?.({
				type: "dragging.start",
				isDragging: true,
				page: activePageRef.current,
			});
		};
		const onPointerMove = (e: PointerEvent) => {
			if (!dragRef.current.active) return;
			const dx = e.clientX - dragRef.current.lastX;
			const dy = e.clientY - dragRef.current.lastY;
			itemGroup.scrollBy({
				left: horizontal ? -dx : 0,
				top: horizontal ? 0 : -dy,
				behavior: "instant" as ScrollBehavior,
			});
			dragRef.current.lastX = e.clientX;
			dragRef.current.lastY = e.clientY;
			onDragStatusChangeRef.current?.({
				type: "dragging",
				isDragging: true,
				page: activePageRef.current,
			});
		};
		const endDrag = () => {
			if (!dragRef.current.active) return;
			dragRef.current.active = false;
			itemGroup.style.scrollSnapType = originalSnapType;
			setIsDragging(false);
			itemGroup.removeAttribute("data-dragging");
			const closest = closestPageIndex(
				itemGroup,
				pageSnapPointsRef.current,
				horizontal,
			);
			scrollToRef.current(closest);
			onDragStatusChangeRef.current?.({
				type: "dragging.end",
				isDragging: false,
				page: closest,
			});
		};

		itemGroup.addEventListener("pointerdown", onPointerDown);
		itemGroup.addEventListener("pointermove", onPointerMove);
		itemGroup.addEventListener("pointerup", endDrag);
		itemGroup.addEventListener("pointercancel", endDrag);
		return () => {
			itemGroup.removeEventListener("pointerdown", onPointerDown);
			itemGroup.removeEventListener("pointermove", onPointerMove);
			itemGroup.removeEventListener("pointerup", endDrag);
			itemGroup.removeEventListener("pointercancel", endDrag);
		};
	}, [allowMouseDrag, horizontal]);

	// Pause autoplay while hovered (opt-in via `pauseOnHover`), resuming only
	// if autoplay was actually running when the pointer entered. Mounts once
	// (like the click-delegation effect above) and reads `isPlaying` via a
	// ref — otherwise its own `setIsPlaying` call would tear this effect
	// down mid-gesture, same class of race as the click listener.
	useEffect(() => {
		if (typeof document === "undefined" || !pauseOnHover) return;
		const root = rootRef.current;
		if (!root) return;
		const onEnter = () => {
			wasPlayingBeforeHoverRef.current = isPlayingRef.current;
			if (isPlayingRef.current) pauseRef.current();
		};
		const onLeave = () => {
			if (wasPlayingBeforeHoverRef.current) playRef.current();
		};
		root.addEventListener("pointerenter", onEnter);
		root.addEventListener("pointerleave", onLeave);
		return () => {
			root.removeEventListener("pointerenter", onEnter);
			root.removeEventListener("pointerleave", onLeave);
		};
	}, [pauseOnHover]);

	// A controlled `page` prop moving is reflected into the DOM the same way
	// an internal scroll/trigger action would be.
	const isFirstRenderRef = useRef(true);
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (!isFirstRenderRef.current && isControlled) {
			scrollTo(activePage as number, false);
		}
		isFirstRenderRef.current = false;
		// eslint-disable-next-line
	}, [pageProp]);

	return (
		<Root
			{...rest}
			id={id}
			rootRef={rootRef}
			slideCount={slideCount}
			page={activePage}
			slidesPerPage={slidesPerPage}
			slidesPerMove={slidesPerMove}
			orientation={orientation}
			loop={loop}
			autoSize={autoSize}
			snapType={snapType}
			disabled={disabled}
			pageSnapPoints={pageSnapPoints}
			isPlaying={isPlaying}
			isDragging={isDragging}
			onScrollTo={scrollTo}
			onScrollToIndex={scrollToIndex}
			onScrollNext={() => scrollNext()}
			onScrollPrev={() => scrollPrev()}
			onPlay={play}
			onPause={pause}
			data-hydrated="true"
		>
			{children}
		</Root>
	);
}

export type { CarouselStyles };
