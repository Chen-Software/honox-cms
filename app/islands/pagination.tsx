import { useState } from "hono/jsx";
import { Root, type RootProps } from "../components/ui/pagination-primitive";

export interface InteractivePaginationProps extends RootProps {}

export default function PaginationIsland(props: InteractivePaginationProps) {
	const {
		page: pageProp,
		defaultPage = 1,
		onPageChange,
		children,
		...rest
	} = props;
	const [currentPage, setCurrentPage] = useState(pageProp ?? defaultPage);

	const isControlled = pageProp !== undefined;
	const page = isControlled ? pageProp : currentPage;

	const handlePageChange = (details: { page: number; pageSize: number }) => {
		if (!isControlled) {
			setCurrentPage(details.page);
		}
		onPageChange?.(details);
	};

	return (
		<Root {...rest} page={page} onPageChange={handlePageChange}>
			{children}
		</Root>
	);
}
