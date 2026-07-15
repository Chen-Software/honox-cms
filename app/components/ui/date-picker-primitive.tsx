import {
	createContext,
	type PropsWithChildren,
	useContext,
	useId,
	useState,
} from "hono/jsx";
import { css, cx } from "styled-system/css";
import type { DatePickerVariantProps } from "styled-system/recipes";
import { datePicker } from "styled-system/recipes";

export class CalendarDate {
	constructor(
		public year: number,
		public month: number,
		public day: number,
	) {}

	toString() {
		const mm = String(this.month).padStart(2, "0");
		const dd = String(this.day).padStart(2, "0");
		return `${this.year}-${mm}-${dd}`;
	}

	toDate() {
		return new Date(this.year, this.month - 1, this.day);
	}
}

export function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

export function isValidDateString(str: string): boolean {
	if (typeof str !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
		return false;
	}
	const [year, month, day] = str.trim().split("-").map(Number);
	return (
		month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
	);
}

export function parseDate(str: string): CalendarDate {
	if (!str || typeof str !== "string") {
		return fromJSDate(new Date());
	}
	const [year, month, day] = str.trim().split("-").map(Number);
	const today = new Date();
	const safeYear = year || today.getFullYear();
	const safeMonth = Math.min(Math.max(month || 1, 1), 12);
	const safeDay = Math.min(
		Math.max(day || 1, 1),
		daysInMonth(safeYear, safeMonth),
	);
	return new CalendarDate(safeYear, safeMonth, safeDay);
}

export function fromJSDate(date: Date): CalendarDate {
	return new CalendarDate(
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
	);
}

export function parseValue(val: any): CalendarDate[] {
	if (!val) return [];
	if (Array.isArray(val)) {
		return val.map((v) => {
			if (v instanceof CalendarDate) return v;
			if (v instanceof Date) return fromJSDate(v);
			if (typeof v === "string") return parseDate(v);
			return parseDate(String(v));
		});
	}
	if (val instanceof CalendarDate) return [val];
	if (val instanceof Date) return [fromJSDate(val)];
	if (typeof val === "string") return [parseDate(val)];
	return [];
}

export function parseSingleDate(val: any): CalendarDate | undefined {
	if (!val) return undefined;
	if (val instanceof CalendarDate) return val;
	if (val instanceof Date) return fromJSDate(val);
	if (typeof val === "string") return parseDate(val);
	return undefined;
}

export type DatePickerStyles = ReturnType<typeof datePicker>;

export interface DatePickerContextValue {
	styles: DatePickerStyles;
	rootId: string;
	focused: boolean;
	open: boolean;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	inline?: boolean;
	numOfMonths: number;
	showWeekNumbers?: boolean;
	selectionMode: "single" | "multiple" | "range";
	maxSelectedDates?: number;
	isMaxSelected: boolean;
	view: "day" | "month" | "year";
	value: CalendarDate[];
	focusedValue: CalendarDate;
	weekDays: { short: string; narrow: string; long: string }[];
	weeks: CalendarDate[][];
	visibleRangeText: { start: string; end: string };
	locale: string;
	min?: CalendarDate;
	max?: CalendarDate;
	isDateUnavailable?: (date: CalendarDate, locale: string) => boolean;

	// Actions
	selectToday: () => void;
	setValue: (values: CalendarDate[]) => void;
	clearValue: () => void;
	setOpen: (open: boolean) => void;
	goToNext: () => void;
	goToPrev: () => void;
	setView: (view: "day" | "month" | "year") => void;
	setFocusedValue: (val: CalendarDate) => void;
	getMonthsGrid: (opts?: {
		columns?: number;
		format?: "short" | "long";
	}) => { value: number; label: string }[][];
	getYearsGrid: (opts?: {
		columns?: number;
	}) => { value: number; label: string }[][];
}

const DatePickerCtx = createContext<DatePickerContextValue | null>(null);

export const useDatePickerContext = () => {
	const context = useContext(DatePickerCtx);
	return context;
};

export interface DatePickerRootProps
	extends DatePickerVariantProps,
		PropsWithChildren {
	id?: string;
	open?: boolean;
	focused?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	inline?: boolean;
	numOfMonths?: number;
	showWeekNumbers?: boolean;
	selectionMode?: "single" | "multiple" | "range";
	maxSelectedDates?: number;
	view?: "day" | "month" | "year";
	value?: CalendarDate[] | string[] | string | Date[];
	defaultValue?: CalendarDate[] | string[] | string | Date[];
	focusedValue?: CalendarDate | string | Date;
	defaultFocusedValue?: CalendarDate | string | Date;
	locale?: string;
	min?: CalendarDate | string | Date;
	max?: CalendarDate | string | Date;
	isDateUnavailable?: (date: CalendarDate, locale: string) => boolean;
	onValueChange?: (details: { value: CalendarDate[] }) => void;
	onOpenChange?: (details: { open: boolean }) => void;
	class?: string;
	style?: any;
	[key: string]: any;
}

export function getMonthWeeks(
	year: number,
	month: number,
	startOfWeek = 0,
): CalendarDate[][] {
	const firstDay = new Date(year, month - 1, 1);
	const firstDayOfWeek = firstDay.getDay();
	const prevDaysCount = (firstDayOfWeek - startOfWeek + 7) % 7;
	const startDate = new Date(year, month - 1, 1 - prevDaysCount);

	const weeks: CalendarDate[][] = [];
	const current = new Date(startDate.getTime());
	for (let w = 0; w < 6; w++) {
		const week: CalendarDate[] = [];
		for (let d = 0; d < 7; d++) {
			week.push(fromJSDate(current));
			current.setDate(current.getDate() + 1);
		}
		weeks.push(week);
	}
	return weeks;
}

const DEFAULT_WEEKDAYS = [
	{ short: "Su", narrow: "S", long: "Sunday" },
	{ short: "Mo", narrow: "M", long: "Monday" },
	{ short: "Tu", narrow: "T", long: "Tuesday" },
	{ short: "We", narrow: "W", long: "Wednesday" },
	{ short: "Th", narrow: "T", long: "Thursday" },
	{ short: "Fr", narrow: "F", long: "Friday" },
	{ short: "Sa", narrow: "S", long: "Saturday" },
];

export function DatePickerRoot(props: DatePickerRootProps) {
	const [variantProps, localProps] = datePicker.splitVariantProps(props);
	const {
		children,
		id,
		open = false,
		focused = false,
		disabled,
		invalid,
		readOnly,
		inline = false,
		numOfMonths = 1,
		showWeekNumbers,
		selectionMode = "single",
		maxSelectedDates,
		view = "day",
		value: valueProp,
		defaultValue,
		focusedValue: focusedValueProp,
		defaultFocusedValue,
		locale = "en-US",
		min: minProp,
		max: maxProp,
		isDateUnavailable,
		onValueChange,
		onOpenChange,
		class: classProp,
		style,
		...rest
	} = localProps;

	const styles = datePicker(variantProps);
	const rootId = id || `date-picker-${useId()}`;

	const initialValue = parseValue(valueProp ?? defaultValue);
	const [valState, setValState] = useState<CalendarDate[]>(initialValue);
	const value = valueProp !== undefined ? parseValue(valueProp) : valState;

	const initialFocused =
		parseSingleDate(focusedValueProp ?? defaultFocusedValue) ??
		(value[0] || fromJSDate(new Date()));
	const [focusedState, setFocusedState] =
		useState<CalendarDate>(initialFocused);
	const focusedValue = parseSingleDate(focusedValueProp) ?? focusedState;

	const min = parseSingleDate(minProp);
	const max = parseSingleDate(maxProp);

	const [viewState, setViewState] = useState<"day" | "month" | "year">(view);
	const currentView = props.view ?? viewState;

	const [openState, setOpenState] = useState(open);
	const isOpen = props.open ?? openState;

	const selectToday = () => {
		const today = fromJSDate(new Date());
		setValState([today]);
		setFocusedState(today);
		onValueChange?.({ value: [today] });
	};

	const setValue = (values: CalendarDate[]) => {
		setValState(values);
		if (values[0]) {
			setFocusedState(values[0]);
		}
		onValueChange?.({ value: values });
	};

	const clearValue = () => {
		setValState([]);
		onValueChange?.({ value: [] });
	};

	const setOpen = (nextOpen: boolean) => {
		setOpenState(nextOpen);
		onOpenChange?.({ open: nextOpen });
	};

	const goToNext = () => {
		if (currentView === "day") {
			const nextMonth = focusedValue.month === 12 ? 1 : focusedValue.month + 1;
			const nextYear =
				focusedValue.month === 12 ? focusedValue.year + 1 : focusedValue.year;
			setFocusedState(new CalendarDate(nextYear, nextMonth, 1));
		} else if (currentView === "month") {
			setFocusedState(
				new CalendarDate(focusedValue.year + 1, focusedValue.month, 1),
			);
		} else {
			setFocusedState(
				new CalendarDate(focusedValue.year + 10, focusedValue.month, 1),
			);
		}
	};

	const goToPrev = () => {
		if (currentView === "day") {
			const prevMonth = focusedValue.month === 1 ? 12 : focusedValue.month - 1;
			const prevYear =
				focusedValue.month === 1 ? focusedValue.year - 1 : focusedValue.year;
			setFocusedState(new CalendarDate(prevYear, prevMonth, 1));
		} else if (currentView === "month") {
			setFocusedState(
				new CalendarDate(focusedValue.year - 1, focusedValue.month, 1),
			);
		} else {
			setFocusedState(
				new CalendarDate(focusedValue.year - 10, focusedValue.month, 1),
			);
		}
	};

	const formatMonthYear = (date: CalendarDate) => {
		const dateObj = date.toDate();
		try {
			return dateObj.toLocaleDateString(locale, {
				month: "long",
				year: "numeric",
			});
		} catch {
			const months = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			return `${months[date.month - 1]} ${date.year}`;
		}
	};

	const weeks = getMonthWeeks(focusedValue.year, focusedValue.month);
	const visibleRangeText = {
		start: formatMonthYear(focusedValue),
		end: formatMonthYear(focusedValue),
	};

	const getMonthsGrid = (opts?: {
		columns?: number;
		format?: "short" | "long";
	}) => {
		const columns = opts?.columns ?? 4;
		const format = opts?.format ?? "short";
		const months = [
			{ value: 1, label: format === "short" ? "Jan" : "January" },
			{ value: 2, label: format === "short" ? "Feb" : "February" },
			{ value: 3, label: format === "short" ? "Mar" : "March" },
			{ value: 4, label: format === "short" ? "Apr" : "April" },
			{ value: 5, label: format === "short" ? "May" : "May" },
			{ value: 6, label: format === "short" ? "Jun" : "June" },
			{ value: 7, label: format === "short" ? "Jul" : "July" },
			{ value: 8, label: format === "short" ? "Aug" : "August" },
			{ value: 9, label: format === "short" ? "Sep" : "September" },
			{ value: 10, label: format === "short" ? "Oct" : "October" },
			{ value: 11, label: format === "short" ? "Nov" : "November" },
			{ value: 12, label: format === "short" ? "Dec" : "December" },
		];
		const grid: (typeof months)[] = [];
		for (let i = 0; i < months.length; i += columns) {
			grid.push(months.slice(i, i + columns));
		}
		return grid;
	};

	const getYearsGrid = (opts?: { columns?: number }) => {
		const columns = opts?.columns ?? 4;
		const startYear = Math.floor(focusedValue.year / 10) * 10;
		const years: { value: number; label: string }[] = [];
		for (let y = startYear; y < startYear + 10; y++) {
			years.push({ value: y, label: String(y) });
		}
		const grid: (typeof years)[] = [];
		for (let i = 0; i < years.length; i += columns) {
			grid.push(years.slice(i, i + columns));
		}
		return grid;
	};

	const isMaxSelected =
		maxSelectedDates !== undefined && value.length >= maxSelectedDates;

	return (
		<DatePickerCtx.Provider
			value={{
				styles,
				rootId,
				focused,
				open: isOpen,
				disabled,
				invalid,
				readOnly,
				inline,
				numOfMonths,
				showWeekNumbers,
				selectionMode,
				maxSelectedDates,
				isMaxSelected,
				view: currentView,
				value,
				focusedValue,
				weekDays: DEFAULT_WEEKDAYS,
				weeks,
				visibleRangeText,
				locale,
				min,
				max,
				isDateUnavailable,
				selectToday,
				setValue,
				clearValue,
				setOpen,
				goToNext,
				goToPrev,
				setView: setViewState,
				setFocusedValue: setFocusedState,
				getMonthsGrid,
				getYearsGrid,
			}}
		>
			<div
				id={rootId}
				data-scope="date-picker"
				data-part="root"
				data-state={isOpen ? "open" : "closed"}
				data-disabled={disabled ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-empty={value.length === 0 ? "" : undefined}
				class={cx(styles.root, classProp)}
				style={{ position: "relative", ...style }}
				{...rest}
			>
				{children}
			</div>
		</DatePickerCtx.Provider>
	);
}

export function DatePickerLabel(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<label
			for={context ? `${context.rootId}-input-0` : undefined}
			data-scope="date-picker"
			data-part="label"
			data-state={context?.open ? "open" : "closed"}
			data-disabled={context?.disabled ? "" : undefined}
			data-readonly={context?.readOnly ? "" : undefined}
			class={cx(context?.styles.label, classProp)}
			{...rest}
		>
			{children || "Date"}
		</label>
	);
}

export function DatePickerControl(
	props: PropsWithChildren<{ class?: string }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<div
			data-scope="date-picker"
			data-part="control"
			data-disabled={context?.disabled ? "" : undefined}
			class={cx(context?.styles.control, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

export function DatePickerInput(props: {
	class?: string;
	index?: number;
	placeholder?: string;
	[key: string]: any;
}) {
	const {
		class: classProp,
		index = 0,
		placeholder = "YYYY-MM-DD",
		...rest
	} = props;
	const context = useDatePickerContext();
	const val = context?.value[index]?.toString() ?? "";

	return (
		<input
			type="text"
			id={context ? `${context.rootId}-input-${index}` : undefined}
			placeholder={placeholder}
			value={val}
			disabled={context?.disabled}
			readOnly={context?.readOnly}
			autocomplete="off"
			inputmode="numeric"
			aria-invalid={context?.invalid ? "true" : undefined}
			data-scope="date-picker"
			data-part="input"
			data-index={String(index)}
			data-state={context?.open ? "open" : "closed"}
			data-invalid={context?.invalid ? "" : undefined}
			class={cx(context?.styles.input, classProp)}
			{...rest}
		/>
	);
}

export function DatePickerTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			disabled={context?.disabled}
			aria-label="Open date picker"
			aria-haspopup="dialog"
			aria-expanded={context?.open ? "true" : "false"}
			aria-controls={context ? `${context.rootId}-content` : undefined}
			data-scope="date-picker"
			data-part="trigger"
			data-state={context?.open ? "open" : "closed"}
			class={cx(context?.styles.trigger, classProp)}
			{...rest}
		>
			{children || (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Calendar</title>
					<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
					<line x1="16" x2="16" y1="2" y2="6" />
					<line x1="8" x2="8" y1="2" y2="6" />
					<line x1="3" x2="21" y1="10" y2="10" />
				</svg>
			)}
		</button>
	);
}

export function DatePickerClearTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			disabled={context?.disabled}
			aria-label="Clear selected dates"
			data-scope="date-picker"
			data-part="clear-trigger"
			class={cx(context?.styles.clearTrigger, classProp)}
			{...rest}
		>
			{children || (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Clear</title>
					<line x1="18" x2="6" y1="6" y2="18" />
					<line x1="6" x2="18" y1="6" y2="18" />
				</svg>
			)}
		</button>
	);
}

export function DatePickerPositioner(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<div
			data-scope="date-picker"
			data-part="positioner"
			class={cx(
				context?.styles.positioner,
				classProp,
				!context?.open && css({ display: "none" }),
			)}
			style={{
				position: "absolute",
				top: "100%",
				left: "0",
				zIndex: 1000,
				display: context?.open ? "block" : "none",
			}}
			{...rest}
		>
			{children}
		</div>
	);
}

export function DatePickerContent(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<div
			id={context ? `${context.rootId}-content` : undefined}
			role="dialog"
			aria-label="Calendar"
			data-scope="date-picker"
			data-part="content"
			data-state={context?.open ? "open" : "closed"}
			class={cx(context?.styles.content, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

export function DatePickerView(
	props: PropsWithChildren<{
		class?: string;
		view: "day" | "month" | "year";
		[key: string]: any;
	}>,
) {
	const { children, class: classProp, view, ...rest } = props;
	const context = useDatePickerContext();
	const active = context?.view === view;

	return (
		<div
			data-scope="date-picker"
			data-part="view"
			data-view={view}
			class={cx(
				context?.styles.view,
				classProp,
				!active && css({ display: "none" }),
			)}
			style={{ display: active ? "flex" : "none", flexDirection: "column" }}
			{...rest}
		>
			{children}
		</div>
	);
}

export function DatePickerViewControl(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<div
			data-scope="date-picker"
			data-part="view-control"
			data-view={context?.view}
			class={cx(context?.styles.viewControl, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

export function DatePickerPrevTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			aria-label="Previous"
			data-scope="date-picker"
			data-part="prev-trigger"
			disabled={context?.disabled}
			class={cx(context?.styles.prevTrigger, classProp)}
			{...rest}
		>
			{children || (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Previous</title>
					<polyline points="15 18 9 12 15 6" />
				</svg>
			)}
		</button>
	);
}

export function DatePickerNextTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			aria-label="Next"
			data-scope="date-picker"
			data-part="next-trigger"
			disabled={context?.disabled}
			class={cx(context?.styles.nextTrigger, classProp)}
			{...rest}
		>
			{children || (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Next</title>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			)}
		</button>
	);
}

export function DatePickerViewTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			aria-label="Switch calendar view"
			data-scope="date-picker"
			data-part="view-trigger"
			data-view={context?.view}
			class={cx(context?.styles.viewTrigger, classProp)}
			{...rest}
		>
			{children}
		</button>
	);
}

export function DatePickerRangeText(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<div
			data-scope="date-picker"
			data-part="range-text"
			class={cx(context?.styles.rangeText, classProp)}
			{...rest}
		>
			{children || context?.visibleRangeText.start}
		</div>
	);
}

export function DatePickerTable(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<table
			data-scope="date-picker"
			data-part="table"
			data-view={context?.view}
			class={cx(context?.styles.table, classProp)}
			{...rest}
		>
			{children}
		</table>
	);
}

export function DatePickerTableHead(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<thead
			data-scope="date-picker"
			data-part="table-head"
			data-view={context?.view}
			class={cx(context?.styles.tableHead, classProp)}
			{...rest}
		>
			{children}
		</thead>
	);
}

export function DatePickerTableHeader(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<th
			scope="col"
			data-scope="date-picker"
			data-part="table-header"
			data-view={context?.view}
			class={cx(context?.styles.tableHeader, classProp)}
			{...rest}
		>
			{children}
		</th>
	);
}

export function DatePickerTableRow(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<tr
			data-scope="date-picker"
			data-part="table-row"
			data-view={context?.view}
			class={cx(context?.styles.tableRow, classProp)}
			{...rest}
		>
			{children}
		</tr>
	);
}

export function DatePickerTableBody(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<tbody
			data-scope="date-picker"
			data-part="table-body"
			data-view={context?.view}
			class={cx(context?.styles.tableBody, classProp)}
			{...rest}
		>
			{children}
		</tbody>
	);
}

const TableCellContext = createContext<{ value: CalendarDate | number } | null>(
	null,
);

export function DatePickerTableCell(
	props: PropsWithChildren<{ value: any; class?: string; [key: string]: any }>,
) {
	const { children, value, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<TableCellContext.Provider value={{ value }}>
			<td
				data-scope="date-picker"
				data-part="table-cell"
				class={cx(context?.styles.tableCell, classProp)}
				{...rest}
			>
				{children}
			</td>
		</TableCellContext.Provider>
	);
}

export function DatePickerTableCellTrigger(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	const cell = useContext(TableCellContext);

	if (!cell || !context) {
		return (
			<button type="button" class={classProp} {...rest}>
				{children}
			</button>
		);
	}

	const value = cell.value;
	let isSelected = false;
	let isToday = false;
	let inRange = false;
	let isOutsideRange = false;
	let isDisabled = false;

	if (value instanceof CalendarDate) {
		const valStr = value.toString();
		isToday = valStr === fromJSDate(new Date()).toString();
		isOutsideRange = value.month !== context.focusedValue.month;

		if (context.selectionMode === "single") {
			isSelected = context.value[0]?.toString() === valStr;
		} else if (context.selectionMode === "multiple") {
			isSelected = context.value.some((v) => v.toString() === valStr);
		} else if (context.selectionMode === "range") {
			const start = context.value[0];
			const end = context.value[1];
			isSelected = start?.toString() === valStr || end?.toString() === valStr;
			if (start && end) {
				const cellTime = value.toDate().getTime();
				const startTime = start.toDate().getTime();
				const endTime = end.toDate().getTime();
				inRange = cellTime >= startTime && cellTime <= endTime;
			}
		}

		if (context.min) {
			isDisabled = value.toDate().getTime() < context.min.toDate().getTime();
		}
		if (context.max) {
			isDisabled =
				isDisabled || value.toDate().getTime() > context.max.toDate().getTime();
		}
		if (context.isDateUnavailable) {
			isDisabled =
				isDisabled || context.isDateUnavailable(value, context.locale);
		}
	} else if (typeof value === "number") {
		// Month view or Year view
		if (context.view === "month") {
			isToday =
				value === new Date().getMonth() + 1 &&
				context.focusedValue.year === new Date().getFullYear();
			isSelected =
				context.value[0]?.month === value &&
				context.value[0]?.year === context.focusedValue.year;
		} else if (context.view === "year") {
			isToday = value === new Date().getFullYear();
			isSelected = context.value[0]?.year === value;
		}
	}

	let cellLabel: string | undefined;
	if (value instanceof CalendarDate) {
		try {
			cellLabel = value.toDate().toLocaleDateString(context.locale, {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			cellLabel = value.toString();
		}
	}

	return (
		<button
			type="button"
			disabled={isDisabled}
			aria-label={cellLabel}
			aria-selected={isSelected ? "true" : undefined}
			aria-current={isToday ? "date" : undefined}
			data-scope="date-picker"
			data-part="table-cell-trigger"
			data-view={context.view}
			data-value={
				value instanceof CalendarDate ? value.toString() : String(value)
			}
			data-selected={isSelected ? "" : undefined}
			data-today={isToday ? "" : undefined}
			data-in-range={inRange ? "" : undefined}
			data-outside-range={isOutsideRange ? "" : undefined}
			data-disabled={isDisabled ? "" : undefined}
			class={cx(context.styles.tableCellTrigger, classProp)}
			{...rest}
		>
			{children || (value instanceof CalendarDate ? value.day : value)}
		</button>
	);
}

export function DatePickerMonthSelect(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	const months = [
		{ value: 1, label: "January" },
		{ value: 2, label: "February" },
		{ value: 3, label: "March" },
		{ value: 4, label: "April" },
		{ value: 5, label: "May" },
		{ value: 6, label: "June" },
		{ value: 7, label: "July" },
		{ value: 8, label: "August" },
		{ value: 9, label: "September" },
		{ value: 10, label: "October" },
		{ value: 11, label: "November" },
		{ value: 12, label: "December" },
	];

	return (
		<select
			aria-label="Select month"
			data-scope="date-picker"
			data-part="month-select"
			value={String(context?.focusedValue.month ?? 1)}
			class={cx(context?.styles.monthSelect, classProp)}
			disabled={context?.disabled}
			{...rest}
		>
			{months.map((m) => (
				<option key={m.value} value={String(m.value)}>
					{m.label}
				</option>
			))}
		</select>
	);
}

export function DatePickerYearSelect(
	props: PropsWithChildren<{ class?: string; [key: string]: any }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	const currentYear = context?.focusedValue.year ?? new Date().getFullYear();
	const startYear = currentYear - 50;
	const endYear = currentYear + 50;
	const years: number[] = [];
	for (let y = startYear; y <= endYear; y++) {
		years.push(y);
	}

	return (
		<select
			aria-label="Select year"
			data-scope="date-picker"
			data-part="year-select"
			value={String(currentYear)}
			class={cx(context?.styles.yearSelect, classProp)}
			disabled={context?.disabled}
			{...rest}
		>
			{years.map((y) => (
				<option key={y} value={String(y)}>
					{y}
				</option>
			))}
		</select>
	);
}

export function DatePickerPresetTrigger(
	props: PropsWithChildren<{
		value: string;
		class?: string;
		[key: string]: any;
	}>,
) {
	const { children, value, class: classProp, ...rest } = props;
	const context = useDatePickerContext();
	return (
		<button
			type="button"
			data-scope="date-picker"
			data-part="preset-trigger"
			data-value={value}
			disabled={context?.disabled}
			class={cx(context?.styles.presetTrigger, classProp)}
			{...rest}
		>
			{children}
		</button>
	);
}

export function DatePickerValueText(
	props: PropsWithChildren<{
		class?: string;
		placeholder?: string;
		[key: string]: any;
	}>,
) {
	const {
		children,
		class: classProp,
		placeholder = "Select date",
		...rest
	} = props;
	const context = useDatePickerContext();

	let valStr = "";
	if (context && context.value.length > 0) {
		valStr = context.value.map((v) => v.toString()).join(" to ");
	} else {
		valStr = placeholder;
	}

	return (
		<span
			data-scope="date-picker"
			data-part="value-text"
			class={cx(context?.styles.valueText, classProp)}
			{...rest}
		>
			{children || valStr}
		</span>
	);
}

export function DatePickerContext(props: {
	children: (api: DatePickerContextValue) => any;
}) {
	const context = useDatePickerContext();
	if (!context) return null;
	return props.children(context);
}

export interface DatePickerFlattenedProps extends DatePickerRootProps {
	label?: string;
	placeholder?: string;
}

export function DatePickerStructure(props: DatePickerFlattenedProps) {
	const { label, placeholder = "YYYY-MM-DD", selectionMode = "single" } = props;

	return (
		<>
			{label && <DatePickerLabel>{label}</DatePickerLabel>}
			<DatePickerControl>
				{selectionMode === "range" ? (
					<>
						<DatePickerInput index={0} placeholder="Start date" />
						<DatePickerInput index={1} placeholder="End date" />
					</>
				) : (
					<DatePickerInput placeholder={placeholder} />
				)}
				<DatePickerTrigger />
				<DatePickerClearTrigger />
			</DatePickerControl>
			<DatePickerPositioner>
				<DatePickerContent>
					<DatePickerView view="day">
						<DatePickerContext>
							{(datePicker) => (
								<>
									<DatePickerViewControl>
										<DatePickerPrevTrigger />
										<DatePickerViewTrigger>
											<DatePickerRangeText />
										</DatePickerViewTrigger>
										<DatePickerNextTrigger />
									</DatePickerViewControl>
									<DatePickerTable>
										<DatePickerTableHead>
											<DatePickerTableRow>
												{datePicker.weekDays.map((weekDay, id) => (
													<DatePickerTableHeader key={id}>
														{weekDay.short}
													</DatePickerTableHeader>
												))}
											</DatePickerTableRow>
										</DatePickerTableHead>
										<DatePickerTableBody>
											{datePicker.weeks.map((week, id) => (
												<DatePickerTableRow key={id}>
													{week.map((day, id) => (
														<DatePickerTableCell key={id} value={day}>
															<DatePickerTableCellTrigger>
																{day.day}
															</DatePickerTableCellTrigger>
														</DatePickerTableCell>
													))}
												</DatePickerTableRow>
											))}
										</DatePickerTableBody>
									</DatePickerTable>
								</>
							)}
						</DatePickerContext>
					</DatePickerView>
					<DatePickerView view="month">
						<DatePickerContext>
							{(datePicker) => (
								<>
									<DatePickerViewControl>
										<DatePickerPrevTrigger />
										<DatePickerViewTrigger>
											{datePicker.focusedValue.year}
										</DatePickerViewTrigger>
										<DatePickerNextTrigger />
									</DatePickerViewControl>
									<DatePickerTable>
										<DatePickerTableBody>
											{datePicker
												.getMonthsGrid({ columns: 4, format: "short" })
												.map((row, rowId) => (
													<DatePickerTableRow key={rowId}>
														{row.map((month) => (
															<DatePickerTableCell
																key={month.value}
																value={month.value}
															>
																<DatePickerTableCellTrigger>
																	{month.label}
																</DatePickerTableCellTrigger>
															</DatePickerTableCell>
														))}
													</DatePickerTableRow>
												))}
										</DatePickerTableBody>
									</DatePickerTable>
								</>
							)}
						</DatePickerContext>
					</DatePickerView>
					<DatePickerView view="year">
						<DatePickerContext>
							{(datePicker) => {
								const startYear =
									Math.floor(datePicker.focusedValue.year / 10) * 10;
								return (
									<>
										<DatePickerViewControl>
											<DatePickerPrevTrigger />
											<DatePickerViewTrigger>
												{`${startYear} - ${startYear + 9}`}
											</DatePickerViewTrigger>
											<DatePickerNextTrigger />
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableBody>
												{datePicker
													.getYearsGrid({ columns: 4 })
													.map((row, rowId) => (
														<DatePickerTableRow key={rowId}>
															{row.map((year) => (
																<DatePickerTableCell
																	key={year.value}
																	value={year.value}
																>
																	<DatePickerTableCellTrigger>
																		{year.label}
																	</DatePickerTableCellTrigger>
																</DatePickerTableCell>
															))}
														</DatePickerTableRow>
													))}
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								);
							}}
						</DatePickerContext>
					</DatePickerView>
				</DatePickerContent>
			</DatePickerPositioner>
		</>
	);
}
