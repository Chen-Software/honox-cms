import type { PropsWithChildren } from "hono/jsx";
import {
	createContext,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "hono/jsx";
import { cx } from "styled-system/css";
import type { SliderVariantProps } from "styled-system/recipes";
import { slider } from "styled-system/recipes";

type SliderStyles = ReturnType<typeof slider>;

interface SliderContextValue {
	styles: SliderStyles;
	orientation: "horizontal" | "vertical";
	value: number[];
	min: number;
	max: number;
}

const SliderContext = createContext<SliderContextValue | null>(null);

// Note: Event handlers are attached directly via addEventListener in useEffect,
// not through JSX props, so no interaction context is needed

const useSliderContext = () => {
	const context = useContext(SliderContext);
	return context;
};

export type SliderValue = number[] | number | string;

export const toValueArray = (
	value: SliderValue | undefined,
	fallback: number[],
) => {
	if (Array.isArray(value)) {
		const parsed = value.map(Number).filter(Number.isFinite);
		return parsed.length > 0 ? parsed : fallback;
	}

	if (typeof value === "string") {
		const parsed = value.split(",").map(Number).filter(Number.isFinite);
		return parsed.length > 0 ? parsed : fallback;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return [value];
	}

	return fallback;
};

export interface RootProps extends SliderVariantProps, PropsWithChildren {
	orientation?: "horizontal" | "vertical";
	value?: SliderValue;
	defaultValue?: SliderValue;
	min?: number;
	max?: number;
	step?: number;
	class?: string;
	id?: string;
	style?: Record<string, string | number>;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = slider.splitVariantProps(props);
	const {
		children,
		value: valueProp,
		defaultValue,
		min = 0,
		max = 100,
		class: classProp,
		id: idProp,
		...restProps
	} = localProps;
	const orientation = props.orientation ?? "horizontal";
	const value = toValueArray(valueProp, toValueArray(defaultValue, [min]));
	const styles = slider(variantProps);
	const fallbackId = useId();
	const id = idProp || `slider-root-${fallbackId}`;

	const contextValue = {
		styles,
		orientation,
		value,
		min,
		max,
	};

	return (
		<SliderContext.Provider value={contextValue}>
			<div
				id={id}
				data-scope="slider"
				data-part="root"
				class={cx(styles.root, classProp)}
				data-orientation={orientation}
				style={{
					...(restProps.style || {}),
				}}
				{...restProps}
			>
				{children}
			</div>
		</SliderContext.Provider>
	);
}

export function Label(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useSliderContext();
	return (
		<span
			data-part="label"
			class={cx(context?.styles.label, classProp)}
			{...rest}
		>
			{children}
		</span>
	);
}

export function Control(
	props: PropsWithChildren<{ class?: string; style?: any }>,
) {
	const { children, class: classProp, style, ...rest } = props;
	const context = useSliderContext();
	return (
		<div
			data-part="control"
			class={cx(context?.styles.control, classProp)}
			data-orientation={context?.orientation}
			style={{ position: "relative", ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function Track(
	props: PropsWithChildren<{ class?: string; style?: any }>,
) {
	const { children, class: classProp, style, ...rest } = props;
	const context = useSliderContext();
	return (
		<div
			data-part="track"
			class={cx(context?.styles.track, classProp)}
			data-orientation={context?.orientation}
			style={{ position: "relative", ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function Range(
	props: PropsWithChildren<{ class?: string; style?: any }>,
) {
	const { children, class: classProp, style, ...rest } = props;
	const context = useSliderContext();
	const min = context?.min ?? 0;
	const max = context?.max ?? 100;
	const values = context?.value ?? [min];

	let rangeStyle: any = {
		position: "absolute",
	};

	if (values.length === 1) {
		const percent = (((values[0] ?? min) - min) / (max - min)) * 100;
		if (context?.orientation === "horizontal") {
			rangeStyle = {
				...rangeStyle,
				left: "0%",
				width: `${percent}%`,
				height: "100%",
				bottom: "0",
			};
		} else {
			rangeStyle = {
				...rangeStyle,
				bottom: "0%",
				height: `${percent}%`,
				width: "100%",
				left: "0",
			};
		}
	} else {
		const startPercent = (((values[0] ?? min) - min) / (max - min)) * 100;
		const endPercent =
			(((values[values.length - 1] ?? min) - min) / (max - min)) * 100;
		if (context?.orientation === "horizontal") {
			rangeStyle = {
				...rangeStyle,
				left: `${startPercent}%`,
				width: `${endPercent - startPercent}%`,
				height: "100%",
				bottom: "0",
			};
		} else {
			rangeStyle = {
				...rangeStyle,
				bottom: `${startPercent}%`,
				height: `${endPercent - startPercent}%`,
				width: "100%",
				left: "0",
			};
		}
	}

	return (
		<div
			data-part="range"
			class={cx(context?.styles.range, classProp)}
			data-orientation={context?.orientation}
			style={{ ...rangeStyle, ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function Thumb(
	props: PropsWithChildren<{
		class?: string;
		index: number;
		name?: string;
		style?: any;
	}>,
) {
	const { children, index, name, class: classProp, style, ...rest } = props;
	const context = useSliderContext();

	const min = context?.min ?? 0;
	const max = context?.max ?? 100;
	const value = context?.value[index] ?? 0;
	const percent = ((value - min) / (max - min)) * 100;

	const thumbStyle =
		context?.orientation === "horizontal"
			? {
					left: `${percent}%`,
					position: "absolute",
					transform: "translateX(-50%)",
				}
			: {
					bottom: `${percent}%`,
					position: "absolute",
					transform: "translateY(50%)",
				};

	return (
		<div
			role="slider"
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={value}
			aria-orientation={context?.orientation}
			data-scope="slider"
			data-part="thumb"
			class={cx(context?.styles.thumb, classProp)}
			data-orientation={context?.orientation}
			tabIndex={0}
			style={{ ...thumbStyle, ...style }}
			{...rest}
		>
			<input type="hidden" name={name} value={value} />
			{children}
		</div>
	);
}

export function ValueText(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useSliderContext();
	return (
		<span
			data-part="value-text"
			class={cx(context?.styles.valueText, classProp)}
			{...rest}
		>
			{children || context?.value.join(", ")}
		</span>
	);
}

export function MarkerGroup(
	props: PropsWithChildren<{ class?: string; style?: any }>,
) {
	const { children, class: classProp, style, ...rest } = props;
	const context = useSliderContext();
	const markerGroupStyle: any = {
		position: "absolute",
		width: "100%",
		height: "100%",
		top: "0",
		left: "0",
		pointerEvents: "none",
	};

	return (
		<div
			data-part="marker-group"
			class={cx(context?.styles.markerGroup, classProp)}
			data-orientation={context?.orientation}
			style={{ ...markerGroupStyle, ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function Marker(
	props: PropsWithChildren<{
		class?: string;
		value: number;
		style?: any;
	}>,
) {
	const { children, class: classProp, value, style, ...rest } = props;
	const context = useSliderContext();
	const min = context?.min ?? 0;
	const max = context?.max ?? 100;
	const percent = ((value - min) / (max - min)) * 100;
	const markerStyle =
		context?.orientation === "horizontal"
			? {
					left: `${percent}%`,
					position: "absolute",
					transform: "translateX(-50%)",
				}
			: {
					bottom: `${percent}%`,
					position: "absolute",
					transform: "translateY(50%)",
				};

	return (
		<div
			data-part="marker"
			data-value={value}
			class={cx(context?.styles.marker, classProp)}
			data-orientation={context?.orientation}
			style={{ ...markerStyle, ...style }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function MarkerIndicator(props: PropsWithChildren<{ class?: string }>) {
	const { class: classProp, ...rest } = props;
	const context = useSliderContext();
	return (
		<div
			data-part="marker-indicator"
			class={cx(context?.styles.markerIndicator, classProp)}
			{...rest}
		/>
	);
}

export interface InteractiveSliderProps extends RootProps {
	onValueChange?: (details: { value: number[] }) => void;
	onDraggingChange?: (details: { dragging: boolean }) => void;
	formatValue?: (value: number) => string;
}

export function InteractiveSlider(props: InteractiveSliderProps) {
	const {
		value: valueProp,
		defaultValue,
		onValueChange,
		onDraggingChange,
		formatValue,
		children,
		min = 0,
		max = 100,
		step = 1,
		orientation = "horizontal",
		...rootProps
	} = props;

	// Use a stable ID to avoid hydration mismatches
	// Create a deterministic ID based on props if possible
	const fallbackId = useId();
	const rootId = rootProps.id || `slider-${fallbackId}`;
	const initialValue = toValueArray(
		valueProp,
		toValueArray(defaultValue, [min]),
	);
	const [value, setValue] = useState<number[]>(initialValue);
	const isControlled = valueProp !== undefined;
	const currentValue = isControlled
		? toValueArray(valueProp, toValueArray(defaultValue, [min]))
		: value;
	const valueRef = useRef<number[]>(currentValue);
	const activeThumbIndex = useRef<number | null>(null);

	// Create stable handler functions
	const handleControlPointerDown = useRef<(e: MouseEvent | TouchEvent) => void>(
		() => {},
	);
	const handleThumbKeyDownFactory = useRef<
		(index: number) => (e: KeyboardEvent) => void
	>(() => () => {});

	useEffect(() => {
		valueRef.current = currentValue;
		const root = document.getElementById(rootId);
		if (!root) {
			return;
		}

		const [variantProps] = slider.splitVariantProps({
			...rootProps,
			orientation,
		});
		const styles = slider(variantProps);
		const addClass = (element: Element | null, className?: string) => {
			if (!element || !className) return;
			element.classList.add(...className.split(/\s+/).filter(Boolean));
		};
		const percentForValue = (item: number) =>
			((item - min) / Math.max(1, max - min)) * 100;
		const syncDom = (values: number[]) => {
			addClass(root, styles.root);

			for (const element of Array.from(
				root.querySelectorAll('[data-part="label"]'),
			)) {
				addClass(element, styles.label);
			}
			for (const element of Array.from(
				root.querySelectorAll('[data-part="control"]'),
			)) {
				addClass(element, styles.control);
				element.setAttribute("data-orientation", orientation);
			}
			for (const element of Array.from(
				root.querySelectorAll('[data-part="track"]'),
			)) {
				addClass(element, styles.track);
				element.setAttribute("data-orientation", orientation);
			}
			for (const element of Array.from(
				root.querySelectorAll('[data-part="marker-group"]'),
			)) {
				addClass(element, styles.markerGroup);
				element.setAttribute("data-orientation", orientation);
			}
			for (const element of Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="marker"]'),
			)) {
				addClass(element, styles.marker);
				element.setAttribute("data-orientation", orientation);
				const markerValue = Number(element.getAttribute("data-value"));
				if (Number.isFinite(markerValue)) {
					const percent = percentForValue(markerValue);
					if (orientation === "horizontal") {
						element.style.left = `${percent}%`;
						element.style.bottom = "";
						element.style.transform = "translateX(-50%)";
					} else {
						element.style.bottom = `${percent}%`;
						element.style.left = "";
						element.style.transform = "translateY(50%)";
					}
					element.style.position = "absolute";
				}
			}
			for (const element of Array.from(
				root.querySelectorAll('[data-part="marker-indicator"]'),
			)) {
				addClass(element, styles.markerIndicator);
				element.setAttribute("data-orientation", orientation);
			}

			const valueText = root.querySelector('[data-part="value-text"]');
			addClass(valueText, styles.valueText);
			if (valueText) {
				valueText.textContent = formatValue
					? values.map(formatValue).join(", ")
					: values.join(", ");
			}

			const range = root.querySelector<HTMLElement>('[data-part="range"]');
			addClass(range, styles.range);
			range?.setAttribute("data-orientation", orientation);
			if (range) {
				const start = percentForValue(
					values.length > 1 ? (values[0] ?? min) : min,
				);
				const end = percentForValue(values[values.length - 1] ?? min);
				if (orientation === "horizontal") {
					range.style.left = `${start}%`;
					range.style.width = `${end - start}%`;
					range.style.height = "100%";
					range.style.bottom = "";
				} else {
					range.style.bottom = `${start}%`;
					range.style.height = `${end - start}%`;
					range.style.width = "100%";
					range.style.left = "";
				}
				range.style.position = "absolute";
			}

			const thumbs = Array.from(
				root.querySelectorAll<HTMLElement>('[data-part="thumb"]'),
			);
			thumbs.forEach((thumb, index) => {
				const item = values[index] ?? min;
				const percent = percentForValue(item);
				addClass(thumb, styles.thumb);
				thumb.setAttribute("aria-valuemin", String(min));
				thumb.setAttribute("aria-valuemax", String(max));
				thumb.setAttribute("aria-valuenow", String(item));
				thumb.setAttribute("aria-orientation", orientation);
				thumb.setAttribute("data-orientation", orientation);
				thumb.tabIndex = 0;
				if (orientation === "horizontal") {
					thumb.style.left = `${percent}%`;
					thumb.style.bottom = "";
					thumb.style.transform = "translateX(-50%)";
				} else {
					thumb.style.bottom = `${percent}%`;
					thumb.style.left = "";
					thumb.style.transform = "translateY(50%)";
				}
				thumb.style.position = "absolute";
				const input = thumb.querySelector<HTMLInputElement>(
					'input[type="hidden"]',
				);
				if (input) input.value = String(item);
			});
		};
		syncDom(currentValue);

		const control = root.querySelector<HTMLElement>('[data-part="control"]');
		if (!control) return;
		const getValueFromPoint = (clientX: number, clientY: number) => {
			const rect = control.getBoundingClientRect();
			const length = orientation === "horizontal" ? rect.width : rect.height;
			if (length <= 0) return null;

			const rawPercent =
				orientation === "horizontal"
					? (clientX - rect.left) / rect.width
					: 1 - (clientY - rect.top) / rect.height;
			const percent = Math.max(0, Math.min(1, rawPercent));
			const effectiveStep = step > 0 ? step : 1;
			const next = min + percent * (max - min);
			const rounded =
				Math.round((next - min) / effectiveStep) * effectiveStep + min;
			return Math.max(min, Math.min(max, rounded));
		};
		const updateThumbValue = (index: number, newValue: number) => {
			const newValues = [...(valueRef.current ?? [min])];
			newValues[index] = newValue;
			const previousValue = newValues[index - 1];
			const nextValue = newValues[index + 1];
			if (
				index > 0 &&
				previousValue !== undefined &&
				newValue < previousValue
			) {
				newValues[index] = previousValue;
			}
			if (index < newValues.length - 1 && nextValue !== undefined) {
				const item = newValues[index] ?? newValue;
				if (item > nextValue) newValues[index] = nextValue;
			}
			valueRef.current = newValues;
			syncDom(newValues);
			if (!isControlled) setValue(newValues);
			onValueChange?.({ value: newValues });
		};
		const handleMove = (e: MouseEvent | TouchEvent) => {
			if (activeThumbIndex.current === null) return;
			const point = "touches" in e ? e.touches[0] : e;
			if (!point) return;
			const newValue = getValueFromPoint(point.clientX, point.clientY);
			if (newValue !== null)
				updateThumbValue(activeThumbIndex.current, newValue);
			if ("touches" in e) e.preventDefault();
		};
		const handleEnd = () => {
			activeThumbIndex.current = null;
			onDraggingChange?.({ dragging: false });
			document.removeEventListener("mousemove", handleMove);
			document.removeEventListener("mouseup", handleEnd);
			document.removeEventListener("touchmove", handleMove);
			document.removeEventListener("touchend", handleEnd);
		};
		const handleControlPointerDownImpl = (e: MouseEvent | TouchEvent) => {
			const point = "touches" in e ? e.touches[0] : e;
			if (!point) return;
			const newValue = getValueFromPoint(point.clientX, point.clientY);
			if (newValue === null) return;

			const values = valueRef.current ?? [min];
			let closestIndex = 0;
			let minDistance = Math.abs((values[0] ?? min) - newValue);
			for (let i = 1; i < values.length; i++) {
				const distance = Math.abs((values[i] ?? min) - newValue);
				if (distance < minDistance) {
					minDistance = distance;
					closestIndex = i;
				}
			}

			activeThumbIndex.current = closestIndex;
			onDraggingChange?.({ dragging: true });
			updateThumbValue(closestIndex, newValue);
			document.addEventListener("mousemove", handleMove);
			document.addEventListener("mouseup", handleEnd);
			document.addEventListener("touchmove", handleMove, { passive: false });
			document.addEventListener("touchend", handleEnd);
			e.preventDefault();
		};
		handleControlPointerDown.current = handleControlPointerDownImpl;

		const handleThumbKeyDownImpl = (index: number) => (e: KeyboardEvent) => {
			const stepValue = e.shiftKey ? step * 10 : step;
			let newValue = (valueRef.current ?? [min])[index] ?? min;
			if (e.key === "ArrowRight" || e.key === "ArrowUp") {
				newValue = Math.min(max, newValue + stepValue);
			} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
				newValue = Math.max(min, newValue - stepValue);
			} else if (e.key === "Home") {
				newValue = min;
			} else if (e.key === "End") {
				newValue = max;
			} else {
				return;
			}
			e.preventDefault();
			updateThumbValue(index, newValue);
		};
		handleThumbKeyDownFactory.current = handleThumbKeyDownImpl;
	}, [
		currentValue,
		isControlled,
		max,
		min,
		onValueChange,
		orientation,
		rootId,
		rootProps,
		step,
	]);

	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) {
			return;
		}

		const control = root.querySelector<HTMLElement>('[data-part="control"]');
		if (!control) {
			return;
		}

		const thumbs = Array.from(
			root.querySelectorAll<HTMLElement>('[data-part="thumb"]'),
		);

		// Attach event listeners to control element
		const handleControlDown = (e: Event) => {
			if (handleControlPointerDown.current) {
				handleControlPointerDown.current(e as MouseEvent | TouchEvent);
			}
		};

		control.addEventListener("mousedown", handleControlDown);
		control.addEventListener("touchstart", handleControlDown, {
			passive: false,
		});

		// Attach keydown listeners to thumb elements
		const thumbKeydownListeners: Array<{
			thumb: HTMLElement;
			handler: (e: Event) => void;
		}> = [];

		thumbs.forEach((thumb, index) => {
			const handler = (e: Event) => {
				if (handleThumbKeyDownFactory.current) {
					handleThumbKeyDownFactory.current(index)(e as KeyboardEvent);
				}
			};
			thumb.addEventListener("keydown", handler);
			thumbKeydownListeners.push({ thumb, handler });
		});


		return () => {
			control.removeEventListener("mousedown", handleControlDown);
			control.removeEventListener("touchstart", handleControlDown);
			thumbKeydownListeners.forEach(({ thumb, handler }) => {
				thumb.removeEventListener("keydown", handler);
			});
		};
	}, [rootId]);

	return (
		<Root
			{...rootProps}
			id={rootId}
			orientation={orientation}
			value={currentValue}
			min={min}
			max={max}
			step={step}
		>
			{children}
		</Root>
	);
}
