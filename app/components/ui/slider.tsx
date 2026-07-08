import type { JSX } from "hono/jsx";
import { css, cx } from "styled-system/css";
import SliderIsland from "../../islands/slider";
import { shouldHydrate } from "./island-utils";
import {
	Control,
	Label,
	Marker,
	MarkerGroup,
	MarkerIndicator,
	Range,
	Root as SliderPrimitiveRoot,
	Thumb,
	Track,
	toValueArray,
	ValueText,
} from "./slider-primitive";

interface SliderProps {
	// Value
	value?: number | number[];
	defaultValue?: number | number[];
	min?: number;
	max?: number;
	step?: number;

	// Event
	onChange?: (details: { value: number[] }) => void;
	onDraggingChange?: (details: { dragging: boolean }) => void;

	// Display
	label?: string | JSX.Element;
	showValueText?: boolean;
	formatValue?: (value: number) => string;

	// Marks
	marks?: { value: number; label: string | JSX.Element }[];

	// Orientation
	orientation?: "horizontal" | "vertical";
	height?: string; // Required for vertical

	// State
	disabled?: boolean;
	readOnly?: boolean;
	interactive?: boolean; // For SSG compatibility

	// Styling
	class?: string;
	trackClass?: string;
	rangeClass?: string;
	thumbClass?: string;
	labelClass?: string;
	valueTextClass?: string;
	markClass?: string;

	// Size
	size?: "sm" | "md" | "lg";
	colorPalette?: string;
}

const serializeValue = (v: any) => {
	if (Array.isArray(v)) return v.join(",");
	if (typeof v === "number" || typeof v === "string") return String(v);
	return undefined;
};

function Slider(props: SliderProps) {
	const {
		label,
		showValueText,
		formatValue,
		marks,
		value,
		defaultValue,
		onChange,
		onDraggingChange,
		interactive,
		orientation = "horizontal",
		height,
		class: classProp,
		trackClass,
		rangeClass,
		thumbClass,
		labelClass,
		valueTextClass,
		markClass,
		size,
		colorPalette,
		min,
		max,
		step,
		disabled,
		readOnly,
		...rest
	} = props;

	const hasSignal =
		onChange !== undefined ||
		onDraggingChange !== undefined ||
		value !== undefined ||
		defaultValue !== undefined;
	const isInteractive = shouldHydrate(interactive, hasSignal);

	const values = toValueArray(value, toValueArray(defaultValue, [min ?? 0]));

	const rootProps = {
		min,
		max,
		step,
		disabled,
		readOnly,
		orientation,
		size,
		colorPalette,
		class: classProp,
		style: orientation === "vertical" && height ? { height } : undefined,
		...rest,
	};

	const content = (
		<>
			{(label || showValueText) && (
				<div
					class={cx(
						css({
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: "2",
							mb: orientation === "horizontal" ? "1" : "0",
						}),
					)}
				>
					{label && <Label class={labelClass}>{label}</Label>}
					{showValueText && (
						<ValueText class={valueTextClass}>
							{formatValue
								? values.map(formatValue).join(", ")
								: values.join(", ")}
						</ValueText>
					)}
				</div>
			)}
			<Control>
				<Track class={trackClass}>
					<Range class={rangeClass} />
				</Track>
				{values.map((_, index) => (
					<Thumb key={index} index={index} class={thumbClass} />
				))}
				{marks && marks.length > 0 && (
					<MarkerGroup>
						{marks.map((mark) => (
							<Marker key={mark.value} value={mark.value} class={markClass}>
								<MarkerIndicator />
								<span>{mark.label}</span>
							</Marker>
						))}
					</MarkerGroup>
				)}
			</Control>
		</>
	);

	if (isInteractive) {
		return (
			<SliderIsland
				{...rootProps}
				value={serializeValue(value)}
				defaultValue={serializeValue(defaultValue)}
				onValueChange={onChange}
				onDraggingChange={onDraggingChange}
				formatValue={formatValue}
			>
				{content}
			</SliderIsland>
		);
	}

	return (
		<SliderPrimitiveRoot
			{...rootProps}
			value={value}
			defaultValue={defaultValue}
		>
			{content}
		</SliderPrimitiveRoot>
	);
}

export { Slider, type SliderProps };
export default Slider;
