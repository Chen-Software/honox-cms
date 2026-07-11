import DatePickerIsland from "../../islands/date-picker";
import { shouldHydrate } from "./island-utils";
import {
	DatePickerRoot as RootPrimitive,
	DatePickerLabel as Label,
	DatePickerControl as Control,
	DatePickerInput as Input,
	DatePickerTrigger as Trigger,
	DatePickerClearTrigger as ClearTrigger,
	DatePickerPositioner as Positioner,
	DatePickerContent as Content,
	DatePickerView as View,
	DatePickerViewControl as ViewControl,
	DatePickerPrevTrigger as PrevTrigger,
	DatePickerNextTrigger as NextTrigger,
	DatePickerViewTrigger as ViewTrigger,
	DatePickerRangeText as RangeText,
	DatePickerTable as Table,
	DatePickerTableHead as TableHead,
	DatePickerTableHeader as TableHeader,
	DatePickerTableRow as TableRow,
	DatePickerTableBody as TableBody,
	DatePickerTableCell as TableCell,
	DatePickerTableCellTrigger as TableCellTrigger,
	DatePickerMonthSelect as MonthSelect,
	DatePickerYearSelect as YearSelect,
	DatePickerPresetTrigger as PresetTrigger,
	DatePickerValueText as ValueText,
	DatePickerContext as Context,
	CalendarDate,
	parseDate,
	fromJSDate,
	parseValue,
	parseSingleDate,
	type DatePickerRootProps,
} from "./date-picker-primitive";

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
		const serializedValue = value
			? parseValue(value).map((v) => v.toString())
			: undefined;
		const serializedDefaultValue = defaultValue
			? parseValue(defaultValue).map((v) => v.toString())
			: undefined;
		const serializedMin = min ? parseSingleDate(min)?.toString() : undefined;
		const serializedMax = max ? parseSingleDate(max)?.toString() : undefined;
		const serializedFocusedValue = focusedValue
			? parseSingleDate(focusedValue)?.toString()
			: undefined;
		const serializedDefaultFocusedValue = defaultFocusedValue
			? parseSingleDate(defaultFocusedValue)?.toString()
			: undefined;

		const { children, ...islandRest } = rest as any;

		return (
			<DatePickerIsland
				{...islandRest}
				value={serializedValue as any}
				defaultValue={serializedDefaultValue as any}
				min={serializedMin as any}
				max={serializedMax as any}
				focusedValue={serializedFocusedValue as any}
				defaultFocusedValue={serializedDefaultFocusedValue as any}
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
	RootPrimitive as Root,
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
	CalendarDate,
	parseDate,
	fromJSDate,
};

export default DatePicker;
