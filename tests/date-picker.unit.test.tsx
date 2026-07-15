import { expect, test, describe } from "bun:test";
import {
	DatePicker,
	daysInMonth,
	isValidDateString,
	parseDate,
} from "../app/components/ui/date-picker";
import { getMonthWeeks } from "../app/components/ui/date-picker-primitive";

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
				<DatePicker.PresetTrigger value="last7Days">Last 7 Days</DatePicker.PresetTrigger>
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
});
