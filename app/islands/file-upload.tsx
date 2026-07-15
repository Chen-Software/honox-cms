import { useEffect, useId, useRef, useState } from "hono/jsx";
import type {
	FileAcceptDetails,
	FileChangeDetails,
	FileError,
	FileRejectDetails,
	FileRejection,
	FileValidateDetails,
	RootProps,
} from "../components/ui/file-upload-primitive";
import {
	Dropzone,
	getAcceptAttr,
	HiddenInput,
	Label,
	List,
	Root,
	Trigger,
} from "../components/ui/file-upload-primitive";

const isFileEqual = (a: File, b: File) =>
	a.name === b.name && a.size === b.size && a.type === b.type;

/** Match a file against a native `accept` attribute string. */
const isFileAccepted = (file: File, accept: string | undefined): boolean => {
	if (!accept) return true;
	const mimeType = file.type.toLowerCase();
	const baseMimeType = mimeType.replace(/\/.*$/, "");
	return accept
		.split(",")
		.map((type) => type.trim().toLowerCase())
		.filter(Boolean)
		.some((type) => {
			if (type.startsWith(".")) {
				return file.name.toLowerCase().endsWith(type);
			}
			if (type.endsWith("/*")) {
				return baseMimeType === type.replace(/\/.*$/, "");
			}
			return mimeType === type;
		});
};

export interface FileUploadIslandProps
	extends Omit<RootProps, "dragging" | "acceptedFiles"> {
	/** Controlled list of accepted files. */
	acceptedFiles?: File[];
	/** Initial list of accepted files (uncontrolled). */
	defaultAcceptedFiles?: File[];
	/** Prevent drops outside the dropzone from opening the file. @default true */
	preventDocumentDrop?: boolean;
	/** Custom validation; return error codes or null. */
	validate?: (file: File, details: FileValidateDetails) => FileError[] | null;
	/** Transform accepted files (e.g. compress) before they are committed. */
	transformFiles?: (files: File[]) => Promise<File[]>;
	onFileAccept?: (details: FileAcceptDetails) => void;
	onFileReject?: (details: FileRejectDetails) => void;
	onFileChange?: (details: FileChangeDetails) => void;
	/** Label rendered above the dropzone in the default composition. */
	label?: string;
	/** Dropzone helper text in the default composition. */
	dropzoneText?: string;
	/** Trigger text in the default composition. */
	triggerText?: string;
	/** Show file sizes in the default composition's list. @default true */
	showSize?: boolean;
	/** Show per-file delete triggers in the default composition. @default true */
	clearable?: boolean;
}

export default function FileUploadIsland(props: FileUploadIslandProps) {
	const {
		acceptedFiles: acceptedFilesProp,
		defaultAcceptedFiles = [],
		preventDocumentDrop = true,
		validate,
		transformFiles,
		onFileAccept,
		onFileReject,
		onFileChange,
		label,
		dropzoneText = "Drag your file(s) here",
		triggerText = "Open file picker",
		showSize = true,
		clearable = true,
		children,
		id: idProp,
		accept,
		maxFiles = 1,
		maxFileSize = Number.POSITIVE_INFINITY,
		minFileSize = 0,
		allowDrop = true,
		disabled,
		...rest
	} = props;

	const [files, setFiles] = useState<File[]>(
		acceptedFilesProp ?? defaultAcceptedFiles,
	);
	const [dragging, setDragging] = useState(false);

	const fallbackId = useId();
	const rootId = idProp || `file-upload-${fallbackId}`;

	const filesRef = useRef<File[]>(files);
	const dragDepthRef = useRef(0);

	useEffect(() => {
		if (acceptedFilesProp !== undefined) {
			setFiles(acceptedFilesProp);
			filesRef.current = acceptedFilesProp;
		}
	}, [acceptedFilesProp]);

	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) return;

		const input = root.querySelector<HTMLInputElement>(
			'[data-part="hidden-input"]',
		);
		const dropzone = root.querySelector<HTMLElement>('[data-part="dropzone"]');

		const commit = (accepted: File[], rejected: FileRejection[]) => {
			setFiles(accepted);
			filesRef.current = accepted;
			onFileAccept?.({ files: accepted });
			if (rejected.length) onFileReject?.({ files: rejected });
			onFileChange?.({ acceptedFiles: accepted, rejectedFiles: rejected });
		};

		const processFiles = async (incoming: File[]) => {
			const multiple = maxFiles > 1;
			// Single-file mode replaces the current selection; multiple appends.
			const accepted = multiple ? [...(filesRef.current ?? [])] : [];
			const rejected: FileRejection[] = [];
			const acceptAttr = getAcceptAttr(accept);
			const added: File[] = [];

			for (const file of incoming) {
				const errors: FileError[] = [];
				if (!isFileAccepted(file, acceptAttr)) {
					errors.push("FILE_INVALID_TYPE");
				}
				if (file.size > maxFileSize) errors.push("FILE_TOO_LARGE");
				if (file.size < minFileSize) errors.push("FILE_TOO_SMALL");
				if (multiple && accepted.some((f) => isFileEqual(f, file))) {
					errors.push("FILE_EXISTS");
				}
				if (errors.length === 0 && accepted.length + added.length >= maxFiles) {
					errors.push("TOO_MANY_FILES");
				}
				if (errors.length === 0 && validate) {
					const customErrors = validate(file, {
						acceptedFiles: accepted,
						rejectedFiles: rejected,
					});
					if (customErrors?.length) errors.push(...customErrors);
				}
				if (errors.length) {
					rejected.push({ file, errors });
				} else {
					added.push(file);
				}
			}

			let committed = added;
			if (added.length && transformFiles) {
				try {
					committed = await transformFiles(added);
				} catch {
					committed = added;
				}
			}

			commit([...accepted, ...committed], rejected);
		};

		const removeFileAt = (index: number) => {
			const current = filesRef.current ?? [];
			if (index < 0 || index >= current.length) return;
			commit(
				current.filter((_, i) => i !== index),
				[],
			);
		};

		const openFilePicker = () => {
			if (disabled) return;
			input?.click();
		};

		const handleInputChange = (e: Event) => {
			const target = e.target as HTMLInputElement;
			if (!target.files) return;
			void processFiles(Array.from(target.files));
			// Allow re-selecting the same file.
			target.value = "";
		};

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Native <label for> already opens the picker for the trigger, and
			// programmatic input.click() bubbles back here — ignore both.
			if (
				target.closest(
					'[data-part="trigger"], [data-part="hidden-input"], [data-part="label"]',
				)
			) {
				return;
			}

			const deleteTrigger = target.closest<HTMLElement>(
				'[data-part="item-delete-trigger"]',
			);
			if (deleteTrigger) {
				const item = deleteTrigger.closest('[data-part="item"]');
				if (item) {
					const items = Array.from(root.querySelectorAll('[data-part="item"]'));
					removeFileAt(items.indexOf(item));
				}
				return;
			}

			if (target.closest('[data-part="clear-trigger"]')) {
				commit([], []);
				return;
			}

			const dropzone = target.closest<HTMLElement>('[data-part="dropzone"]');
			if (dropzone && !dropzone.hasAttribute("data-disable-click")) {
				openFilePicker();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target !== dropzone) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openFilePicker();
			}
		};

		const hasFiles = (e: DragEvent) =>
			Array.from(e.dataTransfer?.types ?? []).includes("Files");

		const handleDragOver = (e: DragEvent) => {
			if (!allowDrop || disabled || !hasFiles(e)) return;
			e.preventDefault();
			e.stopPropagation();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
		};

		const handleDragEnter = (e: DragEvent) => {
			if (!allowDrop || disabled || !hasFiles(e)) return;
			e.preventDefault();
			dragDepthRef.current = (dragDepthRef.current ?? 0) + 1;
			setDragging(true);
		};

		const handleDragLeave = (e: DragEvent) => {
			if (!allowDrop || disabled || !hasFiles(e)) return;
			dragDepthRef.current = Math.max(0, (dragDepthRef.current ?? 0) - 1);
			if (dragDepthRef.current === 0) setDragging(false);
		};

		const handleDrop = (e: DragEvent) => {
			if (!allowDrop || disabled) return;
			e.preventDefault();
			e.stopPropagation();
			dragDepthRef.current = 0;
			setDragging(false);
			const dropped = Array.from(e.dataTransfer?.files ?? []);
			if (dropped.length) void processFiles(dropped);
		};

		// Stop the browser from navigating to a file dropped outside the dropzone.
		const preventDocDrag = (e: DragEvent) => {
			if (hasFiles(e)) e.preventDefault();
		};

		input?.addEventListener("change", handleInputChange);
		root.addEventListener("click", handleClick);
		dropzone?.addEventListener("keydown", handleKeyDown);
		dropzone?.addEventListener("dragover", handleDragOver);
		dropzone?.addEventListener("dragenter", handleDragEnter);
		dropzone?.addEventListener("dragleave", handleDragLeave);
		dropzone?.addEventListener("drop", handleDrop);
		if (preventDocumentDrop) {
			document.addEventListener("dragover", preventDocDrag);
			document.addEventListener("drop", preventDocDrag);
		}

		return () => {
			input?.removeEventListener("change", handleInputChange);
			root.removeEventListener("click", handleClick);
			dropzone?.removeEventListener("keydown", handleKeyDown);
			dropzone?.removeEventListener("dragover", handleDragOver);
			dropzone?.removeEventListener("dragenter", handleDragEnter);
			dropzone?.removeEventListener("dragleave", handleDragLeave);
			dropzone?.removeEventListener("drop", handleDrop);
			if (preventDocumentDrop) {
				document.removeEventListener("dragover", preventDocDrag);
				document.removeEventListener("drop", preventDocDrag);
			}
		};
	}, [
		rootId,
		accept,
		maxFiles,
		maxFileSize,
		minFileSize,
		allowDrop,
		disabled,
		preventDocumentDrop,
		validate,
		transformFiles,
		onFileAccept,
		onFileReject,
		onFileChange,
	]);

	return (
		<Root
			{...rest}
			id={rootId}
			accept={accept}
			maxFiles={maxFiles}
			allowDrop={allowDrop}
			disabled={disabled}
			acceptedFiles={files}
			dragging={dragging}
			data-interactive="true"
		>
			{children || (
				<>
					{label && <Label>{label}</Label>}
					<Dropzone>
						<span>{dropzoneText}</span>
						<Trigger>{triggerText}</Trigger>
					</Dropzone>
					<List showSize={showSize} clearable={clearable} />
					<HiddenInput />
				</>
			)}
		</Root>
	);
}
