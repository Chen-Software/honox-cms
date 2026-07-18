import { describe, expect, test } from "bun:test";
import {
	DatePicker,
	daysInMonth,
	isValidDateString,
	parseDate,
} from "./date-picker";
import {
	getMonthNames,
	getMonthWeeks,
	getWeekDays,
} from "./date-picker-primitive";

describe("DatePicker Unit Tests", () => {
	test("should parse date string correctly", () => {
		const parsed = parseDate("2026-07-15");
		expect(parsed.year).toBe(2026);
		expect(parsed.month).toBe(7);
		expect(parsed.day).toBe(15);
		expect(parsed.toString()).toBe("2026-07-15");
	});

	test("should clamp out-of-range date parts when parsing", () => {
		const parsed = parseDate("2026-02-31");
		expect(parsed.month).toBe(2);
		expect(parsed.day).toBe(28);

		const clampedMonth = parseDate("2026-13-01");
		expect(clampedMonth.month).toBe(12);
	});

	test("should validate date strings", () => {
		expect(isValidDateString("2026-07-15")).toBe(true);
		expect(isValidDateString("2024-02-29")).toBe(true); // leap year
		expect(isValidDateString("2026-02-29")).toBe(false);
		expect(isValidDateString("2026-13-01")).toBe(false);
		expect(isValidDateString("2026-00-10")).toBe(false);
		expect(isValidDateString("2026-01-00")).toBe(false);
		expect(isValidDateString("not-a-date")).toBe(false);
		expect(isValidDateString("2026-7-15")).toBe(false);
		expect(isValidDateString("")).toBe(false);
	});

	test("should compute days in month", () => {
		expect(daysInMonth(2026, 7)).toBe(31);
		expect(daysInMonth(2026, 2)).toBe(28);
		expect(daysInMonth(2024, 2)).toBe(29);
		expect(daysInMonth(2026, 4)).toBe(30);
	});

	test("should build a stable 6x7 month grid", () => {
		const weeks = getMonthWeeks(2026, 7);
		expect(weeks.length).toBe(6);
		for (const week of weeks) {
			expect(week.length).toBe(7);
		}
		// July 1st 2026 is a Wednesday; the grid starts on the prior Sunday.
		expect(weeks[0][0].toString()).toBe("2026-06-28");
		expect(weeks[0][3].toString()).toBe("2026-07-01");
	});

	test("should render main anatomical structure", () => {
		const html = (
			<DatePicker interactive={false} selectionMode="single">
				<DatePicker.Label>Choose Date</DatePicker.Label>
				<DatePicker.Control>
					<DatePicker.Input placeholder="YYYY-MM-DD" />
					<DatePicker.Trigger />
					<DatePicker.ClearTrigger />
				</DatePicker.Control>
				<DatePicker.Positioner>
					<DatePicker.Content>
						<DatePicker.View view="day">
							<DatePicker.Context>
								{(datePicker) => (
									<>
										<DatePicker.ViewControl>
											<DatePicker.PrevTrigger />
											<DatePicker.ViewTrigger>
												<DatePicker.RangeText />
											</DatePicker.ViewTrigger>
											<DatePicker.NextTrigger />
										</DatePicker.ViewControl>
										<DatePicker.Table>
											<DatePicker.TableHead>
												<DatePicker.TableRow>
													{datePicker.weekDays.map((weekDay, id) => (
														<DatePicker.TableHeader key={id}>
															{weekDay.short}
														</DatePicker.TableHeader>
													))}
												</DatePicker.TableRow>
											</DatePicker.TableHead>
											<DatePicker.TableBody>
												{datePicker.weeks.map((week, id) => (
													<DatePicker.TableRow key={id}>
														{week.map((day, id) => (
															<DatePicker.TableCell key={id} value={day}>
																<DatePicker.TableCellTrigger>
																	{day.day}
																</DatePicker.TableCellTrigger>
															</DatePicker.TableCell>
														))}
													</DatePicker.TableRow>
												))}
											</DatePicker.TableBody>
										</DatePicker.Table>
									</>
								)}
							</DatePicker.Context>
						</DatePicker.View>
					</DatePicker.Content>
				</DatePicker.Positioner>
			</DatePicker>
		).toString();

		// Label and Control assertions
		expect(html).toContain('data-part="label"');
		expect(html).toContain("Choose Date");
		expect(html).toContain('data-part="control"');
		expect(html).toContain('data-part="input"');

		// Triggers assertions
		expect(html).toContain('data-part="trigger"');
		expect(html).toContain('data-part="clear-trigger"');

		// View and Positioner assertions
		expect(html).toContain('data-part="positioner"');
		expect(html).toContain('data-part="content"');
		expect(html).toContain('data-part="view"');
		expect(html).toContain('data-part="view-control"');
		expect(html).toContain('data-part="range-text"');

		// Table assertions
		expect(html).toContain('data-part="table"');
		expect(html).toContain('data-part="table-header"');
		expect(html).toContain('data-part="table-row"');
		expect(html).toContain('data-part="table-cell"');
		expect(html).toContain('data-part="table-cell-trigger"');
	});

	test("should format selected values in DatePickerValueText", () => {
		const val = [parseDate("2026-07-15")];
		const html = (
			<DatePicker interactive={false} value={val}>
				<DatePicker.ValueText />
			</DatePicker>
		).toString();

		expect(html).toContain("2026-07-15");
	});

	test("should render preset triggers", () => {
		const html = (
			<DatePicker interactive={false}>
				<DatePicker.PresetTrigger value="last7Days">
					Last 7 Days
				</DatePicker.PresetTrigger>
			</DatePicker>
		).toString();

		expect(html).toContain('data-part="preset-trigger"');
		expect(html).toContain('data-value="last7Days"');
		expect(html).toContain("Last 7 Days");
	});

	test("should render aria attributes on triggers and content", () => {
		const html = (
			<DatePicker interactive={false}>
				<DatePicker.Label>Choose Date</DatePicker.Label>
				<DatePicker.Control>
					<DatePicker.Input />
					<DatePicker.Trigger />
					<DatePicker.ClearTrigger />
				</DatePicker.Control>
				<DatePicker.Positioner>
					<DatePicker.Content />
				</DatePicker.Positioner>
			</DatePicker>
		).toString();

		expect(html).toContain('aria-haspopup="dialog"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).toContain('aria-label="Open date picker"');
		expect(html).toContain('aria-label="Clear selected dates"');
		expect(html).toContain('role="dialog"');
		expect(html).toContain('aria-label="Calendar"');
		// label is associated with the first input
		expect(html).toMatch(/for="[^"]*-input-0"/);
		expect(html).toMatch(/id="[^"]*-input-0"/);
	});

	test("should mark selected and disabled day cells", () => {
		const html = (
			<DatePicker
				interactive={false}
				value={[parseDate("2026-07-15")]}
				min="2026-07-05"
				max="2026-07-25"
			>
				<DatePicker.Content>
					<DatePicker.View view="day">
						<DatePicker.Context>
							{(datePicker) => (
								<DatePicker.Table>
									<DatePicker.TableBody>
										{datePicker.weeks.map((week, id) => (
											<DatePicker.TableRow key={id}>
												{week.map((day, id) => (
													<DatePicker.TableCell key={id} value={day}>
														<DatePicker.TableCellTrigger>
															{day.day}
														</DatePicker.TableCellTrigger>
													</DatePicker.TableCell>
												))}
											</DatePicker.TableRow>
										))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							)}
						</DatePicker.Context>
					</DatePicker.View>
				</DatePicker.Content>
			</DatePicker>
		).toString();

		// Every day cell exposes its value for the island's event delegation
		expect(html).toContain('data-value="2026-07-15"');
		expect(html).toContain("data-selected");
		expect(html).toContain('aria-selected="true"');
		// Dates before min / after max render disabled
		expect(html).toContain("data-disabled");
		expect(html).toContain("disabled");
	});

	test("should render hidden inputs for native form submission", () => {
		const html = (
			<DatePicker
				interactive={false}
				name="due"
				value={[parseDate("2026-07-15")]}
			>
				<DatePicker.Control>
					<DatePicker.Input />
				</DatePicker.Control>
			</DatePicker>
		).toString();

		// A single hidden input under the provided name carries the value
		expect(html).toContain('type="hidden"');
		expect(html).toContain('name="due"');
		expect(html).toContain('value="2026-07-15"');
		expect(html).toContain('data-part="hidden-input"');
	});

	test("should render one hidden input per selected date in range mode", () => {
		const html = (
			<DatePicker
				interactive={false}
				name="range"
				value={[parseDate("2026-07-01"), parseDate("2026-07-10")]}
				selectionMode="range"
			>
				<DatePicker.Control />
			</DatePicker>
		).toString();

		const matches = html.match(/name="range"/g) || [];
		expect(matches.length).toBe(2);
		expect(html).toContain('value="2026-07-01"');
		expect(html).toContain('value="2026-07-10"');
	});

	test("should render the default structure when static and no children given", () => {
		const html = (
			<DatePicker
				interactive={false}
				label="Due"
				value={[parseDate("2026-07-15")]}
			/>
		).toString();

		// Full anatomy renders without explicit children (mirrors the island)
		expect(html).toContain("Due</label>");
		expect(html).toContain('data-part="input"');
		expect(html).toContain('data-part="trigger"');
		expect(html).toContain('data-part="table-cell-trigger"');
		// Wrapper-only props must not leak into the DOM
		expect(html).not.toContain("interactive=");
		expect(html).not.toContain('label="Due"');
	});

	test("should render the selected value as the input's value attribute in SSR", () => {
		const html = (
			<DatePicker interactive={false} value={[parseDate("2026-07-15")]}>
				<DatePicker.Control>
					<DatePicker.Input />
				</DatePicker.Control>
			</DatePicker>
		).toString();

		// `value` must be a real HTML attribute (defaultValue would serialize
		// as a dead attribute and leave the input empty in static output)
		expect(html).toMatch(/<input[^>]*value="2026-07-15"/);
		expect(html).not.toContain("defaultValue");
	});

	test("should preselect focused month/year via option selected in SSR", () => {
		const html = (
			<DatePicker interactive={false} defaultFocusedValue="2026-07-15">
				<DatePicker.MonthSelect />
				<DatePicker.YearSelect />
			</DatePicker>
		).toString();

		expect(html).toMatch(
			/<option[^>]*value="7"[^>]*selected[^>]*>July<\/option>/,
		);
		expect(html).toMatch(/<option[^>]*value="2026"[^>]*selected/);
		// The invalid `value` attribute on <select> must be gone
		expect(html).not.toMatch(/<select[^>]*value=/);
	});

	test("should mark range endpoints with data-range-start/end", () => {
		const html = (
			<DatePicker
				interactive={false}
				selectionMode="range"
				value={[parseDate("2026-07-10"), parseDate("2026-07-20")]}
				defaultFocusedValue="2026-07-15"
			>
				<DatePicker.Content>
					<DatePicker.View view="day">
						<DatePicker.Context>
							{(datePicker) => (
								<DatePicker.Table>
									<DatePicker.TableBody>
										{datePicker.weeks.map((week, id) => (
											<DatePicker.TableRow key={id}>
												{week.map((day, id) => (
													<DatePicker.TableCell key={id} value={day}>
														<DatePicker.TableCellTrigger>
															{day.day}
														</DatePicker.TableCellTrigger>
													</DatePicker.TableCell>
												))}
											</DatePicker.TableRow>
										))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							)}
						</DatePicker.Context>
					</DatePicker.View>
				</DatePicker.Content>
			</DatePicker>
		).toString();

		expect(html).toContain("data-range-start");
		expect(html).toContain("data-range-end");
		expect(html).toContain("data-in-range");
		// Range mode is multi-selectable for assistive tech
		expect(html).toContain('aria-multiselectable="true"');
	});

	test("should localise weekday and month names", () => {
		const en = getWeekDays("en-US");
		expect(en[0].long).toBe("Sunday");
		expect(en[1].short).toBe("Mon");

		const de = getMonthNames("de-DE", "long");
		expect(de[2]).toBe("März");

		// Unknown locales fall back instead of throwing
		const fallback = getWeekDays("no-such-locale-!!!");
		expect(fallback.length).toBe(7);
	});

	test("should disable months that fall entirely outside min/max", () => {
		const html = (
			<DatePicker
				interactive={false}
				min="2026-07-01"
				max="2026-07-31"
				value={[parseDate("2026-07-15")]}
				defaultFocusedValue="2026-07-15"
				view="month"
			>
				<DatePicker.Content>
					<DatePicker.View view="month">
						<DatePicker.Context>
							{(datePicker) => (
								<DatePicker.Table>
									<DatePicker.TableBody>
										{datePicker
											.getMonthsGrid({ columns: 4, format: "short" })
											.map((row, rowId) => (
												<DatePicker.TableRow key={rowId}>
													{row.map((month) => (
														<DatePicker.TableCell
															key={month.value}
															value={month.value}
														>
															<DatePicker.TableCellTrigger>
																{month.label}
															</DatePicker.TableCellTrigger>
														</DatePicker.TableCell>
													))}
												</DatePicker.TableRow>
											))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							)}
						</DatePicker.Context>
					</DatePicker.View>
				</DatePicker.Content>
			</DatePicker>
		).toString();

		// June (month 6) is entirely before the July-only range → disabled
		expect(html).toContain('data-value="6"');
		// January is also disabled, with a disabled month cell present
		const disabledCount = (html.match(/data-disabled/g) || []).length;
		expect(disabledCount).toBeGreaterThan(0);
	});
});
