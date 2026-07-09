import type { Child, PropsWithChildren } from "hono/jsx";
import { createContext, useContext, useId } from "hono/jsx";
import { cx } from "styled-system/css";
import { type PaginationVariantProps, pagination } from "styled-system/recipes";

type PaginationStyles = ReturnType<typeof pagination>;

export interface PageRangeItem {
	type: "page" | "ellipsis";
	value: number;
}

const range = (start: number, end: number) => {
	const length = end - start + 1;
	return Array.from({ length }, (_, idx) => start + idx);
};

export function getPagesList(options: {
	page: number;
	totalPages: number;
	siblingCount?: number;
	boundaryCount?: number;
}) {
	const { page, totalPages, siblingCount = 1, boundaryCount = 1 } = options;
	const maxButtons = boundaryCount * 2 + siblingCount * 2 + 3;

	if (totalPages <= maxButtons) {
		return range(1, totalPages).map((v) => ({ type: "page" as const, value: v }));
	}

	const leftSiblingIndex = Math.max(page - siblingCount, boundaryCount + 1);
	const rightSiblingIndex = Math.min(
		page + siblingCount,
		totalPages - boundaryCount,
	);

	const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
	const shouldShowRightEllipsis =
		rightSiblingIndex < totalPages - boundaryCount - 1;

	const firstPages = range(1, boundaryCount);
	const lastPages = range(totalPages - boundaryCount + 1, totalPages);

	if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
		const leftItemCount = boundaryCount * 2 + siblingCount * 2 + 1;
		const leftRange = range(1, leftItemCount);
		return [
			...leftRange.map((v) => ({ type: "page" as const, value: v })),
			{ type: "ellipsis" as const, value: -1 },
			...lastPages.map((v) => ({ type: "page" as const, value: v })),
		];
	}

	if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
		const rightItemCount = boundaryCount * 2 + siblingCount * 2 + 1;
		const rightRange = range(totalPages - rightItemCount + 1, totalPages);
		return [
			...firstPages.map((v) => ({ type: "page" as const, value: v })),
			{ type: "ellipsis" as const, value: -1 },
			...rightRange.map((v) => ({ type: "page" as const, value: v })),
		];
	}

	const middleRange = range(leftSiblingIndex, rightSiblingIndex);
	return [
		...firstPages.map((v) => ({ type: "page" as const, value: v })),
		{ type: "ellipsis" as const, value: -1 },
		...middleRange.map((v) => ({ type: "page" as const, value: v })),
		{ type: "ellipsis" as const, value: -2 },
		...lastPages.map((v) => ({ type: "page" as const, value: v })),
	];
}

interface PaginationContextValue {
	styles: PaginationStyles;
	page: number;
	totalPages: number;
	pageSize: number;
	count: number;
	type: "button" | "link";
	getPageUrl?: (details: { page: number }) => string;
	onPageChange?: (details: { page: number; pageSize: number }) => void;
	siblingCount: number;
	boundaryCount: number;
	id: string;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);

export const usePaginationContext = () => {
	const context = useContext(PaginationContext);
	if (!context) {
		if (typeof window === "undefined") {
			return {
				id: "ssr-pagination",
				styles: pagination({}),
				page: 1,
				totalPages: 1,
				pageSize: 10,
				count: 0,
				type: "button",
				siblingCount: 1,
				boundaryCount: 1,
			} as PaginationContextValue;
		}
		throw new Error(
			"Pagination components must be wrapped in <Pagination.Root />",
		);
	}
	return context;
};

export interface RootProps extends PaginationVariantProps, PropsWithChildren {
	count: number;
	pageSize?: number;
	defaultPageSize?: number;
	page?: number;
	defaultPage?: number;
	siblingCount?: number;
	boundaryCount?: number;
	type?: "button" | "link";
	getPageUrl?: (details: { page: number }) => string;
	onPageChange?: (details: { page: number; pageSize: number }) => void;
	class?: string;
	id?: string;
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = pagination.splitVariantProps(props);
	const {
		children,
		count,
		pageSize = props.defaultPageSize ?? 10,
		page: pageProp,
		defaultPage = 1,
		siblingCount = 1,
		boundaryCount = 1,
		type = "button",
		getPageUrl,
		onPageChange,
		id: idProp,
		class: classProp,
		...restProps
	} = localProps;

	const styles = pagination(variantProps);
	const fallbackId = useId();
	const id = idProp || `pagination-root-${fallbackId}`;

	const totalPages = Math.max(1, Math.ceil(count / pageSize));
	const currentPage = pageProp ?? defaultPage;

	const contextValue: PaginationContextValue = {
		styles,
		page: currentPage,
		totalPages,
		pageSize,
		count,
		type,
		getPageUrl,
		onPageChange,
		siblingCount,
		boundaryCount,
		id,
	};

	return (
		<PaginationContext.Provider value={contextValue}>
			<nav
				id={id}
				role="navigation"
				aria-label="Pagination Navigation"
				class={cx(styles.root, classProp)}
				data-scope="pagination"
				data-part="root"
				{...restProps}
			>
				{children}
			</nav>
		</PaginationContext.Provider>
	);
}

export interface ItemProps extends PropsWithChildren {
	type: "page";
	value: number;
	class?: string;
}

export function Item(props: ItemProps) {
	const { value, children, class: classProp } = props;
	const context = usePaginationContext();
	const isSelected = context.page === value;

	const itemProps = {
		"data-scope": "pagination",
		"data-part": "item",
		"data-value": String(value),
		"data-selected": isSelected ? "" : undefined,
		"aria-current": isSelected ? ("page" as const) : undefined,
		"aria-label": `Page ${value}`,
	};

	if (context.type === "link" && context.getPageUrl) {
		return (
			<a
				href={context.getPageUrl({ page: value })}
				class={cx(context.styles.item, classProp)}
				{...itemProps}
			>
				{children || String(value)}
			</a>
		);
	}

	return (
		<button
			type="button"
			class={cx(context.styles.item, classProp)}
			{...itemProps}
			onClick={() => {
				context.onPageChange?.({ page: value, pageSize: context.pageSize });
			}}
		>
			{children || String(value)}
		</button>
	);
}

export interface EllipsisProps extends PropsWithChildren {
	index: number;
	class?: string;
}

export function Ellipsis(props: EllipsisProps) {
	const { children, index, class: classProp } = props;
	const context = usePaginationContext();

	return (
		<div
			data-scope="pagination"
			data-part="ellipsis"
			data-index={String(index)}
			class={cx(context.styles.ellipsis, classProp)}
		>
			{children || "…"}
		</div>
	);
}

export interface TriggerProps extends PropsWithChildren {
	class?: string;
}

export function PrevTrigger(props: TriggerProps) {
	const { children, class: classProp } = props;
	const context = usePaginationContext();
	const isDisabled = context.page <= 1;

	const triggerProps = {
		"data-scope": "pagination",
		"data-part": "prev-trigger",
		"aria-label": "Previous Page",
		"data-disabled": isDisabled ? "" : undefined,
		disabled: isDisabled ? true : undefined,
	};

	if (context.type === "link" && context.getPageUrl && !isDisabled) {
		return (
			<a
				href={context.getPageUrl({ page: context.page - 1 })}
				class={cx(context.styles.prevTrigger, classProp)}
				{...triggerProps}
			>
				{children || <ChevronLeftIcon />}
			</a>
		);
	}

	return (
		<button
			type="button"
			class={cx(context.styles.prevTrigger, classProp)}
			{...triggerProps}
			onClick={() => {
				if (!isDisabled) {
					context.onPageChange?.({
						page: context.page - 1,
						pageSize: context.pageSize,
					});
				}
			}}
		>
			{children || <ChevronLeftIcon />}
		</button>
	);
}

export function NextTrigger(props: TriggerProps) {
	const { children, class: classProp } = props;
	const context = usePaginationContext();
	const isDisabled = context.page >= context.totalPages;

	const triggerProps = {
		"data-scope": "pagination",
		"data-part": "next-trigger",
		"aria-label": "Next Page",
		"data-disabled": isDisabled ? "" : undefined,
		disabled: isDisabled ? true : undefined,
	};

	if (context.type === "link" && context.getPageUrl && !isDisabled) {
		return (
			<a
				href={context.getPageUrl({ page: context.page + 1 })}
				class={cx(context.styles.nextTrigger, classProp)}
				{...triggerProps}
			>
				{children || <ChevronRightIcon />}
			</a>
		);
	}

	return (
		<button
			type="button"
			class={cx(context.styles.nextTrigger, classProp)}
			{...triggerProps}
			onClick={() => {
				if (!isDisabled) {
					context.onPageChange?.({
						page: context.page + 1,
						pageSize: context.pageSize,
					});
				}
			}}
		>
			{children || <ChevronRightIcon />}
		</button>
	);
}

export function FirstTrigger(props: TriggerProps) {
	const { children, class: classProp } = props;
	const context = usePaginationContext();
	const isDisabled = context.page <= 1;

	const triggerProps = {
		"data-scope": "pagination",
		"data-part": "first-trigger",
		"aria-label": "First Page",
		"data-disabled": isDisabled ? "" : undefined,
		disabled: isDisabled ? true : undefined,
	};

	if (context.type === "link" && context.getPageUrl && !isDisabled) {
		return (
			<a
				href={context.getPageUrl({ page: 1 })}
				class={cx(context.styles.firstTrigger, classProp)}
				{...triggerProps}
			>
				{children || <ChevronsLeftIcon />}
			</a>
		);
	}

	return (
		<button
			type="button"
			class={cx(context.styles.firstTrigger, classProp)}
			{...triggerProps}
			onClick={() => {
				if (!isDisabled) {
					context.onPageChange?.({
						page: 1,
						pageSize: context.pageSize,
					});
				}
			}}
		>
			{children || <ChevronsLeftIcon />}
		</button>
	);
}

export function LastTrigger(props: TriggerProps) {
	const { children, class: classProp } = props;
	const context = usePaginationContext();
	const isDisabled = context.page >= context.totalPages;

	const triggerProps = {
		"data-scope": "pagination",
		"data-part": "last-trigger",
		"aria-label": "Last Page",
		"data-disabled": isDisabled ? "" : undefined,
		disabled: isDisabled ? true : undefined,
	};

	if (context.type === "link" && context.getPageUrl && !isDisabled) {
		return (
			<a
				href={context.getPageUrl({ page: context.totalPages })}
				class={cx(context.styles.lastTrigger, classProp)}
				{...triggerProps}
			>
				{children || <ChevronsRightIcon />}
			</a>
		);
	}

	return (
		<button
			type="button"
			class={cx(context.styles.lastTrigger, classProp)}
			{...triggerProps}
			onClick={() => {
				if (!isDisabled) {
					context.onPageChange?.({
						page: context.totalPages,
						pageSize: context.pageSize,
					});
				}
			}}
		>
			{children || <ChevronsRightIcon />}
		</button>
	);
}

export interface PaginationItemsProps {
	render?: (page: {
		type: "page";
		value: number;
		selected: boolean;
	}) => Child;
	ellipsis?: Child;
}

export function PaginationItems(props: PaginationItemsProps) {
	const context = usePaginationContext();
	const { render, ellipsis } = props;

	const pages = getPagesList({
		page: context.page,
		totalPages: context.totalPages,
		siblingCount: context.siblingCount,
		boundaryCount: context.boundaryCount,
	});

	return (
		<>
			{pages.map((pageItem, index) => {
				if (pageItem.type === "ellipsis") {
					return (
						<Ellipsis key={`ellipsis-${index}`} index={index}>
							{ellipsis}
						</Ellipsis>
					);
				}

				return (
					<Item
						key={`page-${pageItem.value}`}
						type="page"
						value={pageItem.value}
					>
						{render
							? render({
									type: "page",
									value: pageItem.value,
									selected: context.page === pageItem.value,
								})
							: String(pageItem.value)}
					</Item>
				);
			})}
		</>
	);
}

function ChevronLeftIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Chevron Left</title>
			<path d="m15 18-6-6 6-6" />
		</svg>
	);
}

function ChevronRightIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Chevron Right</title>
			<path d="m9 18 6-6-6-6" />
		</svg>
	);
}

function ChevronsLeftIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Chevrons Left</title>
			<path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
		</svg>
	);
}

function ChevronsRightIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<title>Chevrons Right</title>
			<path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
		</svg>
	);
}
