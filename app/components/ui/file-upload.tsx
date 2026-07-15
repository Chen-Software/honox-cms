import FileUploadIsland, {
	type FileUploadIslandProps,
} from "../../islands/file-upload";
import * as Primitives from "./file-upload-primitive";
import { shouldHydrate } from "./island-utils";

export interface FileUploadProps extends FileUploadIslandProps {
	/**
	 * Whether to enable interactivity (hydration).
	 * - `true`  → always hydrate (explicit opt-in)
	 * - `false` → never hydrate, render pure static markup (explicit opt-out)
	 * - omitted → hydrate (Tier-1 auto-interactive)
	 */
	interactive?: boolean;
}

/**
 * FileUpload is auto-interactive (Tier-1): the dropzone, client-side
 * validation, and the live file list all need JS, so it hydrates unless
 * explicitly opted out — in which case it degrades to a native
 * label + file input that still works for plain form submission.
 */
export function FileUpload(props: FileUploadProps) {
	const { interactive, ...rest } = props;

	if (shouldHydrate(interactive, true)) {
		return <FileUploadIsland {...rest} />;
	}

	const {
		label,
		dropzoneText = "Drag your file(s) here",
		triggerText = "Open file picker",
		showSize,
		clearable,
		acceptedFiles,
		defaultAcceptedFiles,
		preventDocumentDrop,
		validate,
		transformFiles,
		onFileAccept,
		onFileReject,
		onFileChange,
		children,
		...rootProps
	} = rest;

	return (
		<Primitives.Root {...rootProps}>
			{children || (
				<>
					{label && <Primitives.Label>{label}</Primitives.Label>}
					<Primitives.Dropzone>
						<span>{dropzoneText}</span>
						<Primitives.Trigger>{triggerText}</Primitives.Trigger>
					</Primitives.Dropzone>
					<Primitives.HiddenInput />
				</>
			)}
		</Primitives.Root>
	);
}

export type {
	FileAccept,
	FileAcceptDetails,
	FileChangeDetails,
	FileError,
	FileRejectDetails,
	FileRejection,
	FileUploadTranslations,
	FileValidateDetails,
	ItemProps,
	RootProps,
} from "./file-upload-primitive";

export const Root = Primitives.Root;
export const Label = Primitives.Label;
export const Dropzone = Primitives.Dropzone;
export const Trigger = Primitives.Trigger;
export const HiddenInput = Primitives.HiddenInput;
export const ItemGroup = Primitives.ItemGroup;
export const Item = Primitives.Item;
export const ItemName = Primitives.ItemName;
export const ItemSizeText = Primitives.ItemSizeText;
export const ItemPreview = Primitives.ItemPreview;
export const ItemPreviewImage = Primitives.ItemPreviewImage;
export const ItemDeleteTrigger = Primitives.ItemDeleteTrigger;
export const ClearTrigger = Primitives.ClearTrigger;
export const Items = Primitives.Items;
export const List = Primitives.List;
export const FileText = Primitives.FileText;
export const useFileUploadContext = Primitives.useFileUploadContext;
export const formatBytes = Primitives.formatBytes;

Object.assign(FileUpload, {
	Root: Primitives.Root,
	Label: Primitives.Label,
	Dropzone: Primitives.Dropzone,
	Trigger: Primitives.Trigger,
	HiddenInput: Primitives.HiddenInput,
	ItemGroup: Primitives.ItemGroup,
	Item: Primitives.Item,
	ItemName: Primitives.ItemName,
	ItemSizeText: Primitives.ItemSizeText,
	ItemPreview: Primitives.ItemPreview,
	ItemPreviewImage: Primitives.ItemPreviewImage,
	ItemDeleteTrigger: Primitives.ItemDeleteTrigger,
	ClearTrigger: Primitives.ClearTrigger,
	Items: Primitives.Items,
	List: Primitives.List,
	FileText: Primitives.FileText,
});
