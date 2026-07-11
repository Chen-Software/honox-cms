import type { PropsWithChildren } from "hono/jsx";
import { cx } from "styled-system/css";
import { stack } from "styled-system/patterns";
import { type SkeletonVariantProps, skeleton } from "styled-system/recipes";

interface SkeletonProps
	extends PropsWithChildren<Omit<SkeletonVariantProps, "circle">>,
		Omit<import("hono/jsx").JSX.IntrinsicElements["div"], "children" | "width" | "height" | "size"> {
	class?: string;
	width?: string | number;
	height?: string | number;
	size?: string | number;
	shape?: "circle" | "text" | "children";
	noOfLines?: number;
	gap?: string | number;
}

function getPandaSize(val: string | number) {
	if (typeof val === "number") {
		return `var(--sizes-${val})`;
	}
	if (/^\d+(\.\d+)?$/.test(val)) {
		return `var(--sizes-${val})`;
	}
	return val;
}

function Skeleton(props: SkeletonProps) {
	const [variantProps, localProps] = skeleton.splitVariantProps(props);
	const { children, class: classProp, style: styleProp, width, height, size, shape = "children", noOfLines, gap, ...restProps } = localProps;

	// Check if the shape is circle or text
	const isCircle = shape === "circle";
	const isText = shape === "text";

	if (isText) {
		return (
			<SkeletonText
				noOfLines={noOfLines}
				gap={gap}
				class={classProp}
				{...restProps}
			/>
		);
	}

	// Resolve direct dimensions using inline styles and Panda tokens
	const styles: Record<string, string> = {};
	if (size !== undefined) {
		const sizeValue = getPandaSize(size);
		styles.width = sizeValue;
		styles.height = sizeValue;
	}
	if (width !== undefined) {
		styles.width = getPandaSize(width);
	}
	if (height !== undefined) {
		styles.height = getPandaSize(height);
	}

	// Resolve inline style to string or object to be safe with Hono JSX
	let finalStyle: string | Record<string, string | number> | undefined;

	if (typeof styleProp === "object" && styleProp !== null) {
		finalStyle = {
			...styles,
			...styleProp,
		};
	} else if (typeof styleProp === "string" && styleProp) {
		const styleString = [
			...Object.entries(styles).map(([k, v]) => `${k}:${v}`),
			styleProp,
		].filter(Boolean).join(";");
		finalStyle = styleString || undefined;
	} else {
		finalStyle = Object.keys(styles).length > 0 ? styles : undefined;
	}

	return (
		<div
			class={cx(
				skeleton({
					...variantProps,
					circle: isCircle,
				}),
				classProp,
			)}
			style={finalStyle}
			{...restProps}
		>
			{children}
		</div>
	);
}

interface SkeletonCircleProps extends SkeletonProps {}

function SkeletonCircle(props: SkeletonCircleProps) {
	return <Skeleton shape="circle" {...props} />;
}

interface SkeletonTextProps extends SkeletonProps {
	/**
	 * Number of lines to display
	 * @default 3
	 */
	noOfLines?: number;
	gap?: string | number;
}

function SkeletonText(props: SkeletonTextProps) {
	const {
		noOfLines = 3,
		gap = "2",
		class: classProp,
		...skeletonProps
	} = props;

	return (
		<div class={cx(stack({ gap }), classProp)} style="width: 100%;">
			{Array.from({ length: noOfLines }).map((_, index) => (
				<Skeleton
					key={index}
					height="4"
					style={{
						maxWidth: index === noOfLines - 1 ? (noOfLines === 1 ? "100%" : "80%") : undefined,
					}}
					{...skeletonProps}
				/>
			))}
		</div>
	);
}

export {
	Skeleton,
	type SkeletonProps,
};
