import { css } from "design-system/css";
import { useEffect, useState } from "hono/jsx";
import { Badge } from "../components/ui/badge";
import {
	NextTrigger,
	PaginationItems,
	Root as PaginationRoot,
	PrevTrigger,
} from "../components/ui/pagination-primitive";
import { Skeleton } from "../components/ui/skeleton";
import { TableBase } from "../components/ui/table-primitive";

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	status: string;
	statusColor: "green" | "amber" | "gray";
}

const USERS: User[] = [
	{
		id: 1,
		name: "Alice Johnson",
		email: "alice@example.com",
		role: "Developer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 2,
		name: "Bob Smith",
		email: "bob@example.com",
		role: "Designer",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 3,
		name: "Charlie Brown",
		email: "charlie@example.com",
		role: "Manager",
		status: "Offline",
		statusColor: "gray",
	},
	{
		id: 4,
		name: "Diana Prince",
		email: "diana@example.com",
		role: "QA Engineer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 5,
		name: "Evan Wright",
		email: "evan@example.com",
		role: "Developer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 6,
		name: "Fiona Gallagher",
		email: "fiona@example.com",
		role: "Product Owner",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 7,
		name: "George Costanza",
		email: "george@example.com",
		role: "Architect",
		status: "Offline",
		statusColor: "gray",
	},
	{
		id: 8,
		name: "Hannah Abbott",
		email: "hannah@example.com",
		role: "Developer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 9,
		name: "Ian Malcolm",
		email: "ian@example.com",
		role: "Data Scientist",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 10,
		name: "Julia Roberts",
		email: "julia@example.com",
		role: "Designer",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 11,
		name: "Kevin Bacon",
		email: "kevin@example.com",
		role: "Developer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 12,
		name: "Laura Croft",
		email: "laura@example.com",
		role: "Security Analyst",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 13,
		name: "Michael Scott",
		email: "michael@example.com",
		role: "Manager",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 14,
		name: "Nina Simone",
		email: "nina@example.com",
		role: "DevOps Engineer",
		status: "Offline",
		statusColor: "gray",
	},
	{
		id: 15,
		name: "Oscar Martinez",
		email: "oscar@example.com",
		role: "Accountant",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 16,
		name: "Pam Beesly",
		email: "pam@example.com",
		role: "Office Manager",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 17,
		name: "Quentin Tarantino",
		email: "quentin@example.com",
		role: "Director",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 18,
		name: "Rachel Green",
		email: "rachel@example.com",
		role: "Designer",
		status: "Offline",
		statusColor: "gray",
	},
	{
		id: 19,
		name: "Steve Rogers",
		email: "steve@example.com",
		role: "Developer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 20,
		name: "Tony Stark",
		email: "tony@example.com",
		role: "Architect",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 21,
		name: "Ursula Buffay",
		email: "ursula@example.com",
		role: "Masseuse",
		status: "Offline",
		statusColor: "gray",
	},
	{
		id: 22,
		name: "Victor Stone",
		email: "victor@example.com",
		role: "QA Engineer",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 23,
		name: "Wendy Darling",
		email: "wendy@example.com",
		role: "Writer",
		status: "Away",
		statusColor: "amber",
	},
	{
		id: 24,
		name: "Xavier Charles",
		email: "xavier@example.com",
		role: "Researcher",
		status: "Active",
		statusColor: "green",
	},
	{
		id: 25,
		name: "Yolanda Adams",
		email: "yolanda@example.com",
		role: "Support",
		status: "Active",
		statusColor: "green",
	},
];

interface PaginatedTableProps {
	url?: string;
	dataKey?: string;
	columns?: any[];
	pageSize?: number;
	initialPage?: number;
}

export default function PaginatedTable(props: PaginatedTableProps) {
	const {
		url,
		dataKey,
		columns: columnsProp,
		pageSize: pageSizeProp,
		initialPage,
	} = props;
	const limit = pageSizeProp ?? 5;

	const [data, setData] = useState<any[]>(url ? [] : USERS);
	const [isLoading, setIsLoading] = useState(Boolean(url));
	const [page, setPage] = useState(initialPage ?? 1);

	const fetchData = async () => {
		if (!url) return;
		setIsLoading(true);
		try {
			const res = await fetch(url);
			const json = await res.json();

			// Simulate a small loading delay for a visible and satisfying skeleton pulse/re-flash
			await new Promise((resolve) => setTimeout(resolve, 800));

			let list: any[] = [];
			if (dataKey && json[dataKey] && Array.isArray(json[dataKey])) {
				list = json[dataKey];
			} else {
				// Auto-detect array in response object
				const firstArrayKey = Object.keys(json).find((key) =>
					Array.isArray(json[key]),
				);
				if (firstArrayKey) {
					list = json[firstArrayKey];
				} else if (Array.isArray(json)) {
					list = json;
				}
			}
			setData(list);
			setPage(1); // Reset page on reload/refetch
		} catch (error) {
			console.error("Error fetching paginated table data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (url) {
			fetchData();
		}
	}, [url]);

	// Register window listener for re-fetching on the reload event
	useEffect(() => {
		const handleReload = () => {
			fetchData();
		};
		window.addEventListener("paginated-table:reload", handleReload);
		return () => {
			window.removeEventListener("paginated-table:reload", handleReload);
		};
	}, [url, dataKey]);

	const totalItems = data.length;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	// Use empty dummy objects if loading to render standard-sized skeleton rows
	const displayRows = isLoading
		? Array.from({ length: limit }).map(() => ({}))
		: data.slice(startIndex, endIndex);

	const defaultColumns = [
		{ header: "ID", key: "id", class: css({ width: "12" }) },
		{ header: "Name", key: "name" },
		{ header: "Email", key: "email" },
		{ header: "Role", key: "role" },
		{
			header: "Status",
			key: "status",
			render: (row: any) => (
				<Badge colorPalette={row.statusColor || "blue"}>{row.status}</Badge>
			),
		},
	];

	const activeColumns = columnsProp || defaultColumns;

	// Map columns to inject skeletons when loading and handle generic cell styling/rendering
	const mappedColumns = activeColumns.map((col, colIndex) => ({
		...col,
		render: (row: any, rowIndex: number) => {
			if (isLoading) {
				return <Skeleton height="4" shape="text" noOfLines={1} />;
			}

			// Custom render function provided in the prop
			if (col.render && typeof col.render === "function") {
				return col.render(row, rowIndex);
			}

			const val = row[col.key];

			// Handle generic column types
			if (col.type === "badge") {
				return <Badge colorPalette={col.colorPalette || "blue"}>{val}</Badge>;
			}

			if (col.type === "badge-list" && Array.isArray(val)) {
				return (
					<div class={css({ display: "flex", gap: "1", flexWrap: "wrap" })}>
						{val.map((item: any) => (
							<Badge
								key={item}
								size="sm"
								colorPalette={col.colorPalette || "blue"}
								variant="subtle"
							>
								{item}
							</Badge>
						))}
					</div>
				);
			}

			return val;
		},
	}));

	return (
		<div
			class={css({
				display: "flex",
				flexDirection: "column",
				gap: "4",
				width: "full",
				maxWidth: "3xl",
				mx: "auto",
				alignItems: "center",
			})}
		>
			<TableBase
				variant="surface"
				striped
				columns={mappedColumns}
				rows={displayRows}
			/>

			{!isLoading && totalItems > limit && (
				<div
					class={css({ display: "flex", justifyContent: "center", mt: "4" })}
				>
					<PaginationRoot
						count={totalItems}
						pageSize={limit}
						page={page}
						onPageChange={(details) => setPage(details.page)}
					>
						<PrevTrigger />
						<PaginationItems />
						<NextTrigger />
					</PaginationRoot>
				</div>
			)}
		</div>
	);
}
