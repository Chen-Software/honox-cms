import { useEffect, useRef, useState, useId } from "hono/jsx";
import {
	CalendarDate,
	fromJSDate,
	DatePickerRoot,
	type DatePickerRootProps,
	parseDate,
	parseValue,
	parseSingleDate,
	getMonthWeeks,
	DatePickerStructure,
} from "../components/ui/date-picker-primitive";

export default function DatePickerIsland(props: DatePickerRootProps) {
	const {
		open: openProp,
		value: valueProp,
		defaultValue,
		focusedValue: focusedValueProp,
		defaultFocusedValue,
		view: viewProp,
		selectionMode = "single",
		closeOnSelect = true,
		onValueChange,
		onOpenChange,
		id: idProp,
		children,
		...rest
	} = props;

	const fallbackId = useId();
	const rootId = idProp || `date-picker-${fallbackId}`;

	// open state
	const [isOpen, setIsOpen] = useState(openProp ?? false);
	const open = openProp !== undefined ? openProp : isOpen;

	// value state
	const initialValue = parseValue(valueProp ?? defaultValue);
	const [value, setValue] = useState<CalendarDate[]>(initialValue);
	const currentValue = valueProp !== undefined ? parseValue(valueProp) : value;

	// view state
	const [view, setView] = useState<"day" | "month" | "year">(viewProp ?? "day");
	const currentView = viewProp !== undefined ? viewProp : view;

	// focusedValue state
	const initialFocused =
		parseSingleDate(focusedValueProp ?? defaultFocusedValue) ??
		(currentValue[0] || fromJSDate(new Date()));
	const [focusedValue, setFocusedValue] =
		useState<CalendarDate>(initialFocused);
	const currentFocusedValue =
		focusedValueProp !== undefined
			? parseSingleDate(focusedValueProp)!
			: focusedValue;

	// Keep refs for event handlers to avoid closure stale state
	const stateRef = useRef({
		open,
		value: currentValue,
		view: currentView,
		focusedValue: currentFocusedValue,
		selectionMode,
		closeOnSelect,
	});

	useEffect(() => {
		stateRef.current = {
			open,
			value: currentValue,
			view: currentView,
			focusedValue: currentFocusedValue,
			selectionMode,
			closeOnSelect,
		};
	}, [
		open,
		currentValue,
		currentView,
		currentFocusedValue,
		selectionMode,
		closeOnSelect,
	]);

	const updateValue = (nextValues: CalendarDate[]) => {
		setValue(nextValues);
		onValueChange?.({ value: nextValues });
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setIsOpen(nextOpen);
		onOpenChange?.({ open: nextOpen });
	};

	const handleGoToNext = () => {
		const { view: activeView, focusedValue: fv } = stateRef.current;
		if (activeView === "day") {
			const nextMonth = fv.month === 12 ? 1 : fv.month + 1;
			const nextYear = fv.month === 12 ? fv.year + 1 : fv.year;
			setFocusedValue(new CalendarDate(nextYear, nextMonth, 1));
		} else if (activeView === "month") {
			setFocusedValue(new CalendarDate(fv.year + 1, fv.month, 1));
		} else {
			setFocusedValue(new CalendarDate(fv.year + 10, fv.month, 1));
		}
	};

	const handleGoToPrev = () => {
		const { view: activeView, focusedValue: fv } = stateRef.current;
		if (activeView === "day") {
			const prevMonth = fv.month === 1 ? 12 : fv.month - 1;
			const prevYear = fv.month === 1 ? fv.year - 1 : fv.year;
			setFocusedValue(new CalendarDate(prevYear, prevMonth, 1));
		} else if (activeView === "month") {
			setFocusedValue(new CalendarDate(fv.year - 1, fv.month, 1));
		} else {
			setFocusedValue(new CalendarDate(fv.year - 10, fv.month, 1));
		}
	};

	const handleViewTrigger = () => {
		const { view: activeView } = stateRef.current;
		if (activeView === "day") {
			setView("month");
		} else if (activeView === "month") {
			setView("year");
		} else {
			setView("day");
		}
	};

	const handleCellClick = (cellVal: CalendarDate | number) => {
		const {
			view: activeView,
			value: vals,
			selectionMode: mode,
			closeOnSelect: cos,
		} = stateRef.current;

		if (activeView === "day" && cellVal instanceof CalendarDate) {
			let nextValues: CalendarDate[] = [];
			if (mode === "single") {
				nextValues = [cellVal];
				if (cos) {
					handleOpenChange(false);
				}
			} else if (mode === "multiple") {
				const valStr = cellVal.toString();
				if (vals.some((v) => v.toString() === valStr)) {
					nextValues = vals.filter((v) => v.toString() !== valStr);
				} else {
					nextValues = [...vals, cellVal];
				}
			} else if (mode === "range") {
				if (vals.length === 0 || vals.length === 2) {
					nextValues = [cellVal];
				} else {
					const start = vals[0];
					const end = cellVal;
					if (start.toDate().getTime() <= end.toDate().getTime()) {
						nextValues = [start, end];
					} else {
						nextValues = [end, start];
					}
					if (cos) {
						handleOpenChange(false);
					}
				}
			}
			updateValue(nextValues);
			setFocusedValue(cellVal);
		} else if (activeView === "month" && typeof cellVal === "number") {
			const { focusedValue: fv } = stateRef.current;
			setFocusedValue(new CalendarDate(fv.year, cellVal, 1));
			setView("day");
		} else if (activeView === "year" && typeof cellVal === "number") {
			const { focusedValue: fv } = stateRef.current;
			setFocusedValue(new CalendarDate(cellVal, fv.month, 1));
			setView("month");
		}
	};

	const handlePresetClick = (presetType: string) => {
		const today = new Date();
		let start = new Date();
		if (presetType === "last3Days") {
			start.setDate(today.getDate() - 3);
		} else if (presetType === "last7Days") {
			start.setDate(today.getDate() - 7);
		} else if (presetType === "last14Days") {
			start.setDate(today.getDate() - 14);
		} else if (presetType === "last30Days") {
			start.setDate(today.getDate() - 30);
		} else if (presetType === "last90Days") {
			start.setDate(today.getDate() - 90);
		} else {
			return;
		}
		const startVal = fromJSDate(start);
		const endVal = fromJSDate(today);
		updateValue([startVal, endVal]);
		setFocusedValue(endVal);
		if (closeOnSelect) {
			handleOpenChange(false);
		}
	};

	// DOM interaction effects
	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) return;

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Close trigger
			if (target.closest('[data-part="clear-trigger"]')) {
				updateValue([]);
				return;
			}

			// Main popover trigger
			if (target.closest('[data-part="trigger"]')) {
				handleOpenChange(!stateRef.current.open);
				return;
			}

			// View triggers
			if (target.closest('[data-part="prev-trigger"]')) {
				handleGoToPrev();
				return;
			}
			if (target.closest('[data-part="next-trigger"]')) {
				handleGoToNext();
				return;
			}
			if (target.closest('[data-part="view-trigger"]')) {
				handleViewTrigger();
				return;
			}

			// Preset triggers
			const preset = target.closest('[data-part="preset-trigger"]');
			if (preset) {
				const val = preset.getAttribute("data-value") || "";
				handlePresetClick(val);
				return;
			}

			// Cell triggers
			const cellTrigger = target.closest('[data-part="table-cell-trigger"]');
			if (cellTrigger && !cellTrigger.hasAttribute("data-disabled")) {
				const activeView = stateRef.current.view;
				if (activeView === "day") {
					const cell = cellTrigger.closest('[data-part="table-cell"]');
					const dayCellIndex = Array.from(
						root.querySelectorAll('[data-part="table-cell"]'),
					).indexOf(cell as any);
					if (dayCellIndex !== -1) {
						const flatWeeks = stateRef.current.focusedValue
							? getMonthWeeks(
									stateRef.current.focusedValue.year,
									stateRef.current.focusedValue.month,
								).flat()
							: [];
						const dateValue = flatWeeks[dayCellIndex];
						if (dateValue) {
							handleCellClick(dateValue);
						}
					}
				} else if (activeView === "month") {
					const cells = Array.from(
						root.querySelectorAll(
							'[data-part="table-cell-trigger"][data-view="month"]',
						),
					);
					const idx = cells.indexOf(cellTrigger);
					if (idx !== -1) {
						handleCellClick(idx + 1); // 1-based month value
					}
				} else if (activeView === "year") {
					const yearVal = Number(cellTrigger.textContent?.trim() || "2025");
					handleCellClick(yearVal);
				}
			}
		};

		const handleSelectChange = (e: Event) => {
			const target = e.target as HTMLSelectElement;
			if (target.getAttribute("data-part") === "month-select") {
				const monthVal = Number(target.value);
				setFocusedValue(
					new CalendarDate(stateRef.current.focusedValue.year, monthVal, 1),
				);
			} else if (target.getAttribute("data-part") === "year-select") {
				const yearVal = Number(target.value);
				setFocusedValue(
					new CalendarDate(yearVal, stateRef.current.focusedValue.month, 1),
				);
			}
		};

		const handleDocumentClick = (e: MouseEvent) => {
			if (!root.contains(e.target as Node)) {
				handleOpenChange(false);
			}
		};

		root.addEventListener("click", handleClick);
		root.addEventListener("change", handleSelectChange);
		document.addEventListener("click", handleDocumentClick);

		return () => {
			root.removeEventListener("click", handleClick);
			root.removeEventListener("change", handleSelectChange);
			document.removeEventListener("click", handleDocumentClick);
		};
	}, [rootId]);

	return (
		<DatePickerRoot
			{...rest}
			id={rootId}
			open={open}
			value={currentValue}
			focusedValue={currentFocusedValue}
			view={currentView}
			selectionMode={selectionMode}
		>
			{children || (
				<DatePickerStructure selectionMode={selectionMode} {...rest} />
			)}
		</DatePickerRoot>
	);
}
