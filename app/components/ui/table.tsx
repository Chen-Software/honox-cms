import TableIsland from "../../islands/table";
import { shouldHydrate } from "./island-utils";
import {
	TableBase,
	type TableColumn,
	type TableProps,
	type TableRow,
} from "./table-primitive";

export function Table<T = Record<string, unknown>>(props: TableProps<T>) {
	const hasRowClick = (props.rows ?? []).some(
		(r) => (r as unknown as TableRow).onClick != null,
	);
	if (shouldHydrate(props.interactive, hasRowClick)) {
		// `interactive` must be true on the island so TableBase wires row
		// `onclick` handlers (table-primitive gates them on this flag).
		return <TableIsland {...props} interactive={true} />;
	}
	return <TableBase {...props} />;
}

export type { TableColumn, TableProps, TableRow };
