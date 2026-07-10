import { useState } from "hono/jsx";
import { css } from "styled-system/css";
import { Badge } from "../components/ui/badge";
import {
	NextTrigger,
	PaginationItems,
	Root as PaginationRoot,
	PrevTrigger,
} from "../components/ui/pagination-primitive";
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

export default function PaginatedTable() {
	const [page, setPage] = useState(1);
	const pageSize = 5;

	const totalItems = USERS.length;
	const startIndex = (page - 1) * pageSize;
	const endIndex = page * pageSize;
	const currentData = USERS.slice(startIndex, endIndex);

	const columns = [
		{ header: "ID", key: "id", class: css({ width: "12" }) },
		{ header: "Name", key: "name" },
		{ header: "Email", key: "email" },
		{ header: "Role", key: "role" },
		{
			header: "Status",
			key: "status",
			render: (row: User) => (
				<Badge colorPalette={row.statusColor}>{row.status}</Badge>
			),
		},
	];

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
				columns={columns}
				rows={currentData}
			/>

			<div class={css({ display: "flex", justifyContent: "center", mt: "4" })}>
				<PaginationRoot
					count={totalItems}
					pageSize={pageSize}
					page={page}
					onPageChange={(details) => setPage(details.page)}
				>
					<PrevTrigger />
					<PaginationItems />
					<NextTrigger />
				</PaginationRoot>
			</div>
		</div>
	);
}
