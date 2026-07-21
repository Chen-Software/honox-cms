import type { JSX } from "hono/jsx";
import CarouselIsland from "../../islands/carousel";
import {
	AutoplayTrigger,
	Context,
	Control,
	getPageSnapPoints,
	Indicator,
	IndicatorGroup,
	Item,
	ItemGroup,
	NextTrigger,
	PrevTrigger,
	ProgressText,
	Root as RootPrimitive,
	type RootProps,
	RootProvider,
} from "./carousel-primitive";
import { shouldHydrate } from "./island-utils";

export interface CarouselProps
	extends Omit<RootProps, "children" | "slideCount"> {
	/** Forces hydration as an island. Defaults to `true`. */
	interactive?: boolean;
	/** The slide contents. `slideCount` is derived from its length. */
	slides: JSX.Element[];
	/** Renders `PrevTrigger`/`NextTrigger` in the default `Control`. Default `true`. */
	showControls?: boolean;
	/** Renders an `IndicatorGroup` dot per page in the default `Control`. Default `true`. */
	showIndicators?: boolean;
	/** Renders an `AutoplayTrigger` in the default `Control`. Default `false`. */
	showAutoplayTrigger?: boolean;
	/** Custom class applied to every generated `Item`. */
	itemClass?: string;
}

export interface CarouselRootProps extends RootProps {
	/** Forces hydration as an island. Defaults to `true`. */
	interactive?: boolean;
}

function Root(props: CarouselRootProps) {
	const { interactive, ...rest } = props;

	if (shouldHydrate(interactive, true)) {
		return <CarouselIsland {...rest} />;
	}

	return <RootPrimitive {...rest} />;
}

/**
 * Data-driven convenience component: composes `ItemGroup`/`Item` from
 * `slides` and a default `Control` with prev/next triggers and indicator
 * dots. For full manual composition, use `Carousel.Root` and the exported
 * parts directly instead.
 */
function Carousel(props: CarouselProps) {
	const {
		slides,
		showControls = true,
		showIndicators = true,
		showAutoplayTrigger = false,
		itemClass,
		interactive,
		slidesPerPage = 1,
		slidesPerMove = "auto",
		autoSize = false,
		...rest
	} = props;

	// Computed from props rather than read from context: an island's
	// `children` gets serialised into a `<template data-hono-template>`
	// snapshot and re-rendered outside any `CarouselContext.Provider` for
	// hydration, so anything that changes the *number* of indicator dots
	// based on context would silently collapse to a single fallback dot in
	// that snapshot. Deriving the count here keeps it identical either way.
	const pageSnapPoints = autoSize
		? Array.from({ length: slides.length }, (_, i) => i)
		: getPageSnapPoints(slides.length, slidesPerMove, slidesPerPage);
	const pageCount = pageSnapPoints.length || 1;

	return (
		<Root
			{...rest}
			interactive={interactive}
			slideCount={slides.length}
			slidesPerPage={slidesPerPage}
			slidesPerMove={slidesPerMove}
			autoSize={autoSize}
		>
			<ItemGroup>
				{slides.map((slide, index) => (
					<Item index={index} class={itemClass}>
						{slide}
					</Item>
				))}
			</ItemGroup>
			{(showControls || showIndicators || showAutoplayTrigger) && (
				<Control>
					{showControls && <PrevTrigger />}
					{showIndicators && (
						<IndicatorGroup>
							{Array.from({ length: pageCount }, (_, index) => (
								<Indicator index={index} />
							))}
						</IndicatorGroup>
					)}
					{showAutoplayTrigger && <AutoplayTrigger />}
					{showControls && <NextTrigger />}
				</Control>
			)}
		</Root>
	);
}

const CarouselComponent = Object.assign(Carousel, {
	Root,
	RootProvider,
	ItemGroup,
	Item,
	Control,
	PrevTrigger,
	NextTrigger,
	IndicatorGroup,
	Indicator,
	AutoplayTrigger,
	ProgressText,
	Context,
});

export {
	AutoplayTrigger,
	CarouselComponent as Carousel,
	Context,
	Control,
	Indicator,
	IndicatorGroup,
	Item,
	ItemGroup,
	NextTrigger,
	PrevTrigger,
	ProgressText,
	Root,
	RootProvider,
};

export default CarouselComponent;
