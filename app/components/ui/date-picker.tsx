import DatePickerIsland from "../../islands/date-picker";
import {
	CalendarDate,
	DatePickerClearTrigger as ClearTrigger,
	DatePickerContent as Content,
	DatePickerContext as Context,
	DatePickerControl as Control,
	type DatePickerRootProps,
	daysInMonth,
	fromJSDate,
	DatePickerInput as Input,
	isValidDateString,
	DatePickerLabel as Label,
	DatePickerMonthSelect as MonthSelect,
	DatePickerNextTrigger as NextTrigger,
	DatePickerPositioner as Positioner,
	DatePickerPresetTrigger as PresetTrigger,
	DatePickerPrevTrigger as PrevTrigger,
	parseDate,
	parseSingleDate,
	parseValue,
	DatePickerRangeText as RangeText,
	DatePickerRoot as RootPrimitive,
	DatePickerTable as Table,
	DatePickerTableBody as TableBody,
	DatePickerTableCell as TableCell,
	DatePickerTableCellTrigger as TableCellTrigger,
	DatePickerTableHead as TableHead,
	DatePickerTableHeader as TableHeader,
	DatePickerTableRow as TableRow,
	DatePickerTrigger as Trigger,
	DatePickerValueText as ValueText,
	DatePickerView as View,
	DatePickerViewControl as ViewControl,
	DatePickerViewTrigger as ViewTrigger,
	DatePickerYearSelect as YearSelect,
} from "./date-picker-primitive";
import { shouldHydrate } from "./island-utils";

export interface DatePickerProps extends DatePickerRootProps {
	interactive?: boolean;
}

export function DatePickerRoot(props: DatePickerProps) {
	const {
		interactive,
		value,
		defaultValue,
		min,
		max,
		focusedValue,
		defaultFocusedValue,
		isDateUnavailable,
		...rest
	} = props;
	const isInteractive = shouldHydrate(interactive, true);

	if (isInteractive) {
		const serialisedValue = value
			? parseValue(value).map((v) => v.toString())
			: undefined;
		const serialisedDefaultValue = defaultValue
			? parseValue(defaultValue).map((v) => v.toString())
			: undefined;
		const serialisedMin = min ? parseSingleDate(min)?.toString() : undefined;
		const serialisedMax = max ? parseSingleDate(max)?.toString() : undefined;
		const serialisedFocusedValue = focusedValue
			? parseSingleDate(focusedValue)?.toString()
			: undefined;
		const serialisedDefaultFocusedValue = defaultFocusedValue
			? parseSingleDate(defaultFocusedValue)?.toString()
			: undefined;

		const { children: _, ...islandRest } = rest as Record<string, unknown>;

		return (
			<DatePickerIsland
				{...(islandRest as Record<string, unknown>)}
				value={serialisedValue}
				defaultValue={serialisedDefaultValue}
				min={serialisedMin}
				max={serialisedMax}
				focusedValue={serialisedFocusedValue}
				defaultFocusedValue={serialisedDefaultFocusedValue}
			/>
		);
	}

	return <RootPrimitive {...props} />;
}

export const DatePicker = Object.assign(DatePickerRoot, {
	Root: RootPrimitive,
	Label,
	Control,
	Input,
	Trigger,
	ClearTrigger,
	Positioner,
	Content,
	View,
	ViewControl,
	PrevTrigger,
	NextTrigger,
	ViewTrigger,
	RangeText,
	Table,
	TableHead,
	TableHeader,
	TableRow,
	TableBody,
	TableCell,
	TableCellTrigger,
	MonthSelect,
	YearSelect,
	PresetTrigger,
	ValueText,
	Context,
});

export {
	CalendarDate,
	ClearTrigger,
	Content,
	Context,
	Control,
	daysInMonth,
	fromJSDate,
	Input,
	isValidDateString,
	Label,
	MonthSelect,
	NextTrigger,
	Positioner,
	PresetTrigger,
	PrevTrigger,
	parseDate,
	RangeText,
	RootPrimitive as Root,
	Table,
	TableBody,
	TableCell,
	TableCellTrigger,
	TableHead,
	TableHeader,
	TableRow,
	Trigger,
	ValueText,
	View,
	ViewControl,
	ViewTrigger,
	YearSelect,
};

export default DatePicker;
