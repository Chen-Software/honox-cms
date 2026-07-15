import type { PropsWithChildren } from "hono/jsx";
import {
	createContext,
	useContext,
	useEffect,
	useId,
	useState,
} from "hono/jsx";
import { cx } from "styled-system/css";
import type { FileUploadVariantProps } from "styled-system/recipes";
import { fileUpload } from "styled-system/recipes";

type FileUploadStyles = ReturnType<typeof fileUpload>;

/** Accepted-file MIME descriptor, mirroring Ark UI's `accept` prop. */
export type FileAccept = string | string[] | Record<string, string[]>;

export type FileError =
	| "TOO_MANY_FILES"
	| "FILE_INVALID_TYPE"
	| "FILE_TOO_LARGE"
	| "FILE_TOO_SMALL"
	| "FILE_INVALID"
	| "FILE_EXISTS";

export interface FileRejection {
	file: File;
	errors: FileError[];
}

export interface FileChangeDetails {
	acceptedFiles: File[];
	rejectedFiles: FileRejection[];
}

export interface FileAcceptDetails {
	files: File[];
}

export interface FileRejectDetails {
	files: FileRejection[];
}

export interface FileValidateDetails {
	acceptedFiles: File[];
	rejectedFiles: FileRejection[];
}

export interface FileUploadTranslations {
	dropzone: string;
	itemPreview: (file: File) => string;
	deleteFile: (file: File) => string;
	clearFiles: string;
}

const defaultTranslations: FileUploadTranslations = {
	dropzone: "drag and drop files here",
	itemPreview: (file) => `preview of ${file.name}`,
	deleteFile: (file) => `delete file ${file.name}`,
	clearFiles: "clear files",
};

/** Normalize the `accept` prop into the native `accept` attribute string. */
export function getAcceptAttr(accept: FileAccept | undefined) {
	if (accept === undefined) return undefined;
	if (typeof accept === "string") return accept;
	if (Array.isArray(accept)) return accept.join(",");
	return Object.entries(accept)
		.flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
		.join(",");
}

/**
 * Format a byte count for display, matching Ark UI's `ItemSizeText`
 * output (e.g. "1.2 MB"). Falls back to a plain suffix when the
 * runtime lacks `Intl.NumberFormat` unit support.
 */
export function formatBytes(bytes: number, locale = "en-US"): string {
	if (!Number.isFinite(bytes) || bytes < 0) return "";
	if (bytes === 0) return "0 B";
	const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
	const suffixes = ["B", "KB", "MB", "GB", "TB"];
	const exponent = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1,
	);
	const value = bytes / 1024 ** exponent;
	try {
		return new Intl.NumberFormat(locale, {
			style: "unit",
			unit: units[exponent],
			unitDisplay: "short",
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${Math.round(value * 100) / 100} ${suffixes[exponent]}`;
	}
}

interface FileUploadContextValue {
	styles: FileUploadStyles;
	inputId: string;
	acceptedFiles: File[];
	multiple: boolean;
	locale: string;
	translations: FileUploadTranslations;
	accept?: FileAccept;
	name?: string;
	disabled?: boolean;
	invalid?: boolean;
	required?: boolean;
	readOnly?: boolean;
	dragging?: boolean;
	allowDrop?: boolean;
	capture?: "user" | "environment";
	directory?: boolean;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export const useFileUploadContext = () => useContext(FileUploadContext);

interface ItemContextValue {
	file: File;
}

const ItemContext = createContext<ItemContextValue | null>(null);

const useItemContext = () => {
	const context = useContext(ItemContext);
	if (!context) {
		throw new Error("useItemContext must be used within a FileUpload.Item");
	}
	return context;
};

type DataAttrs = Record<string, string | undefined>;

const stateAttrs = (
	context: Partial<FileUploadContextValue> | null,
): DataAttrs => ({
	"data-scope": "file-upload",
	"data-disabled": context?.disabled ? "" : undefined,
	"data-invalid": context?.invalid ? "" : undefined,
	"data-required": context?.required ? "" : undefined,
	"data-readonly": context?.readOnly ? "" : undefined,
	"data-dragging": context?.dragging ? "" : undefined,
});

export interface RootProps extends FileUploadVariantProps, PropsWithChildren {
	/** Accepted file types (MIME string, list, or MIME→extensions record). */
	accept?: FileAccept;
	/** Whether to allow drag and drop in the dropzone. @default true */
	allowDrop?: boolean;
	/** The default camera to use when capturing media. */
	capture?: "user" | "environment";
	/** Whether to accept directories (webkitdirectory). */
	directory?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	required?: boolean;
	/** Maximum number of files. @default 1 */
	maxFiles?: number;
	/** Maximum file size in bytes. @default Infinity */
	maxFileSize?: number;
	/** Minimum file size in bytes. @default 0 */
	minFileSize?: number;
	/** The name of the underlying file input, for form submission. */
	name?: string;
	/** BCP-47 locale used for file-size formatting. @default "en-US" */
	locale?: string;
	translations?: Partial<FileUploadTranslations>;
	/** Currently accepted files (supplied by the island's state). */
	acceptedFiles?: File[];
	/** Whether a drag is in progress (supplied by the island's state). */
	dragging?: boolean;
	class?: string;
	id?: string;
	dir?: "ltr" | "rtl";
}

export function Root(props: RootProps) {
	const [variantProps, localProps] = fileUpload.splitVariantProps(props);
	const {
		children,
		accept,
		allowDrop = true,
		capture,
		directory,
		disabled,
		invalid,
		required,
		maxFiles = 1,
		name,
		locale = "en-US",
		translations,
		acceptedFiles = [],
		dragging,
		class: classProp,
		id: idProp,
		// Validation bounds are consumed by the island, not the markup.
		maxFileSize: _maxFileSize,
		minFileSize: _minFileSize,
		...restProps
	} = localProps;

	const styles = fileUpload(variantProps);
	const fallbackId = useId();
	const id = idProp || `file-upload-${fallbackId}`;

	const contextValue: FileUploadContextValue = {
		styles,
		inputId: `${id}--input`,
		acceptedFiles,
		multiple: maxFiles > 1,
		locale,
		translations: { ...defaultTranslations, ...translations },
		accept,
		name,
		disabled,
		invalid,
		required,
		dragging,
		allowDrop,
		capture,
		directory,
	};

	return (
		<FileUploadContext.Provider value={contextValue}>
			<div
				id={id}
				data-part="root"
				data-allow-drop={allowDrop ? "" : undefined}
				{...stateAttrs(contextValue)}
				class={cx(styles.root, classProp)}
				{...restProps}
			>
				{children}
			</div>
		</FileUploadContext.Provider>
	);
}

export function Label(
	props: PropsWithChildren<{ class?: string; for?: string }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<label
			data-part="label"
			for={context?.inputId}
			{...stateAttrs(context)}
			class={cx(context?.styles.label, classProp)}
			{...rest}
		>
			{children}
		</label>
	);
}

export interface DropzoneProps extends PropsWithChildren {
	class?: string;
	/** Whether clicking the dropzone should open the file picker. @default false */
	disableClick?: boolean;
}

export function Dropzone(props: DropzoneProps) {
	const { children, class: classProp, disableClick, ...rest } = props;
	const context = useFileUploadContext();
	const interactive = !context?.disabled && !disableClick;
	return (
		// biome-ignore lint/a11y/useSemanticElements: a <button> can't nest the Trigger <label>; Ark UI renders the dropzone as div[role=button] too
		<div
			data-part="dropzone"
			role="button"
			aria-label={context?.translations.dropzone}
			aria-disabled={context?.disabled ? "true" : undefined}
			tabIndex={interactive ? 0 : undefined}
			data-disable-click={disableClick ? "" : undefined}
			{...stateAttrs(context)}
			class={cx(context?.styles.dropzone, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

/**
 * Opens the file picker. Rendered as a `<label for>` bound to the hidden
 * input (rather than Ark UI's `<button>`) so it keeps working without
 * client-side JavaScript; the recipe styles it as a button.
 */
export function Trigger(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<label
			data-part="trigger"
			for={context?.inputId}
			{...stateAttrs(context)}
			class={cx(context?.styles.trigger, classProp)}
			{...rest}
		>
			{children}
		</label>
	);
}

const visuallyHidden = {
	border: "0",
	clip: "rect(0 0 0 0)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: "0",
	position: "absolute",
	width: "1px",
	"white-space": "nowrap",
} as const;

export function HiddenInput(props: { class?: string; name?: string }) {
	const { name: nameProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<input
			type="file"
			id={context?.inputId}
			name={nameProp ?? context?.name}
			accept={getAcceptAttr(context?.accept)}
			multiple={context?.multiple}
			disabled={context?.disabled}
			required={context?.required}
			capture={context?.capture}
			webkitdirectory={context?.directory ? "" : undefined}
			data-part="hidden-input"
			{...stateAttrs(context)}
			style={visuallyHidden}
			{...rest}
		/>
	);
}

export function ItemGroup(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<ul
			data-part="item-group"
			{...stateAttrs(context)}
			class={cx(context?.styles.itemGroup, classProp)}
			{...rest}
		>
			{children}
		</ul>
	);
}

export interface ItemProps extends PropsWithChildren {
	file: File;
	class?: string;
}

export function Item(props: ItemProps) {
	const { children, file, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<ItemContext.Provider value={{ file }}>
			<li
				data-part="item"
				data-file={file.name}
				{...stateAttrs(context)}
				class={cx(context?.styles.item, classProp)}
				{...rest}
			>
				{children}
			</li>
		</ItemContext.Provider>
	);
}

export function ItemName(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	const { file } = useItemContext();
	return (
		<div
			data-part="item-name"
			{...stateAttrs(context)}
			class={cx(context?.styles.itemName, classProp)}
			{...rest}
		>
			{children ?? file.name}
		</div>
	);
}

export function ItemSizeText(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	const { file } = useItemContext();
	return (
		<div
			data-part="item-size-text"
			{...stateAttrs(context)}
			class={cx(context?.styles.itemSizeText, classProp)}
			{...rest}
		>
			{children ?? formatBytes(file.size, context?.locale)}
		</div>
	);
}

export interface ItemPreviewProps extends PropsWithChildren {
	class?: string;
	/** Regex source matched against the file's MIME type. @default ".*" */
	type?: string;
}

export function ItemPreview(props: ItemPreviewProps) {
	const { children, class: classProp, type = ".*", ...rest } = props;
	const context = useFileUploadContext();
	const { file } = useItemContext();
	if (!new RegExp(type).test(file.type)) return null;
	return (
		<div
			data-part="item-preview"
			{...stateAttrs(context)}
			class={cx(context?.styles.itemPreview, classProp)}
			{...rest}
		>
			{children}
		</div>
	);
}

/**
 * Renders an object-URL preview of the item's file. The URL is created
 * on the client and revoked when the item unmounts or the file changes,
 * so nothing renders during SSR.
 */
export function ItemPreviewImage(props: { class?: string; alt?: string }) {
	const { class: classProp, alt, ...rest } = props;
	const context = useFileUploadContext();
	const { file } = useItemContext();
	const [src, setSrc] = useState<string | null>(null);

	useEffect(() => {
		if (typeof URL === "undefined" || !file.type.startsWith("image/")) {
			return;
		}
		const url = URL.createObjectURL(file);
		setSrc(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	if (!src) return null;
	return (
		<img
			src={src}
			alt={alt ?? context?.translations.itemPreview(file) ?? file.name}
			data-part="item-preview-image"
			{...stateAttrs(context)}
			class={cx(context?.styles.itemPreviewImage, classProp)}
			{...rest}
		/>
	);
}

const XIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		style={{ width: "1em", height: "1em" }}
	>
		<title>Remove</title>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

const FileIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		style={{ width: "1em", height: "1em" }}
	>
		<title>File</title>
		<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
		<path d="M14 2v4a2 2 0 0 0 2 2h4" />
	</svg>
);

export function ItemDeleteTrigger(
	props: PropsWithChildren<{ class?: string }>,
) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	const { file } = useItemContext();
	return (
		<button
			type="button"
			data-part="item-delete-trigger"
			aria-label={context?.translations.deleteFile(file)}
			disabled={context?.disabled}
			{...stateAttrs(context)}
			class={cx(context?.styles.itemDeleteTrigger, classProp)}
			{...rest}
		>
			{children || <XIcon />}
		</button>
	);
}

export function ClearTrigger(props: PropsWithChildren<{ class?: string }>) {
	const { children, class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	return (
		<button
			type="button"
			data-part="clear-trigger"
			aria-label={context?.translations.clearFiles}
			disabled={context?.disabled}
			hidden={!context?.acceptedFiles.length}
			{...stateAttrs(context)}
			class={cx(context?.styles.clearTrigger, classProp)}
			{...rest}
		>
			{children ?? "Clear"}
		</button>
	);
}

interface ItemsBaseProps {
	/** Show each file's formatted size. */
	showSize?: boolean;
	/** Show a delete trigger on each file. */
	clearable?: boolean;
	/** Files to render; defaults to the context's accepted files. */
	files?: File[];
}

export interface ItemsProps extends ItemsBaseProps {
	class?: string;
}

/** Park UI composite: renders the accepted files as preview items. */
export function Items(props: ItemsProps) {
	const { showSize, clearable, files, ...rest } = props;
	const context = useFileUploadContext();
	const acceptedFiles = files ?? context?.acceptedFiles ?? [];
	return (
		<>
			{acceptedFiles.map((file) => (
				<Item file={file} key={file.name} {...rest}>
					<ItemPreview type="image/.*">
						<ItemPreviewImage />
					</ItemPreview>
					<ItemPreview type="^(?!image/).*">
						<FileIcon />
					</ItemPreview>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							flex: "1",
							gap: "2px",
							minWidth: "0",
						}}
					>
						<ItemName />
						{showSize && <ItemSizeText />}
					</div>
					{clearable && <ItemDeleteTrigger />}
				</Item>
			))}
		</>
	);
}

export interface ListProps extends ItemsBaseProps {
	class?: string;
}

/** Park UI composite: `ItemGroup` wrapping `Items`. */
export function List(props: ListProps) {
	const { showSize, clearable, files, ...rest } = props;
	return (
		<ItemGroup {...rest}>
			<Items showSize={showSize} clearable={clearable} files={files} />
		</ItemGroup>
	);
}

export interface FileTextProps {
	class?: string;
	/** Text shown when no file is selected. @default "Select file(s)" */
	fallback?: string;
}

/** Park UI composite: shows the selected file name, count, or a fallback. */
export function FileText(props: FileTextProps) {
	const { fallback = "Select file(s)", class: classProp, ...rest } = props;
	const context = useFileUploadContext();
	const acceptedFiles = context?.acceptedFiles ?? [];

	const firstFile = acceptedFiles[0];
	const fileText =
		acceptedFiles.length > 1
			? `${acceptedFiles.length} files`
			: (firstFile?.name ?? fallback);

	return (
		<span
			data-scope="file-upload"
			data-part="file-text"
			data-placeholder={fileText === fallback ? "" : undefined}
			class={classProp}
			{...rest}
		>
			{fileText}
		</span>
	);
}
