import { expect, test } from "bun:test";
import { FileUpload } from "../app/components/ui/file-upload";
import {
	Dropzone,
	FileText,
	formatBytes,
	getAcceptAttr,
	HiddenInput,
	Label,
	List,
	Root,
	Trigger,
} from "../app/components/ui/file-upload-primitive";

test("FileUpload renders interactive island by default (Tier-1)", () => {
	const html = (<FileUpload label="Attachments" />).toString();

	expect(html).toContain('data-interactive="true"');
	expect(html).toContain('data-scope="file-upload"');
	expect(html).toContain('data-part="root"');
	expect(html).toContain('data-part="dropzone"');
	expect(html).toContain('data-part="trigger"');
	expect(html).toContain('data-part="hidden-input"');
	expect(html).toContain("Attachments");
	expect(html).toContain("Drag your file(s) here");
});

test("FileUpload renders static markup when interactive is false", () => {
	const html = (
		<FileUpload interactive={false} label="Resume" name="resume" />
	).toString();

	expect(html).not.toContain('data-interactive="true"');
	expect(html).toContain('data-part="root"');
	expect(html).toContain('data-part="hidden-input"');
	expect(html).toContain('name="resume"');
	// The trigger degrades to a native <label for> bound to the input.
	expect(html).toMatch(/<label[^>]*data-part="trigger"[^>]*for="/);
});

test("FileUpload forwards accept and maxFiles to the hidden input", () => {
	const html = (
		<FileUpload
			interactive={false}
			accept={["image/png", "image/jpeg"]}
			maxFiles={3}
		/>
	).toString();

	expect(html).toContain('accept="image/png,image/jpeg"');
	expect(html).toContain("multiple");
});

test("FileUpload applies size variant recipe classes", () => {
	const html = (<FileUpload interactive={false} size="sm" />).toString();
	expect(html).toContain("file-upload__root--size_sm");
});

test("FileUpload marks disabled state on parts", () => {
	const html = (<FileUpload interactive={false} disabled />).toString();
	expect(html).toContain("data-disabled");
	expect(html).toMatch(/<input[^>]*disabled/);
});

test("List renders accepted files with name, size and delete trigger", () => {
	const files = [
		new File(["a".repeat(2048)], "report.pdf", { type: "application/pdf" }),
	];
	const html = (
		<Root acceptedFiles={files}>
			<List showSize clearable />
		</Root>
	).toString();

	expect(html).toContain('data-part="item"');
	expect(html).toContain("report.pdf");
	expect(html).toContain('data-part="item-size-text"');
	expect(html).toContain("2 kB");
	expect(html).toContain('data-part="item-delete-trigger"');
});

test("FileText shows fallback, file name, or count", () => {
	const render = (files: File[]) =>
		(
			<Root acceptedFiles={files}>
				<FileText />
			</Root>
		).toString();

	expect(render([])).toContain("Select file(s)");
	expect(render([new File(["x"], "a.txt")])).toContain("a.txt");
	expect(
		render([new File(["x"], "a.txt"), new File(["y"], "b.txt")]),
	).toContain("2 files");
});

test("custom composition renders all parts", () => {
	const html = (
		<Root maxFiles={2} invalid>
			<Label>Upload</Label>
			<Dropzone>
				<Trigger>Browse</Trigger>
			</Dropzone>
			<HiddenInput />
		</Root>
	).toString();

	expect(html).toContain('data-part="label"');
	expect(html).toContain('role="button"');
	expect(html).toContain("data-invalid");
	expect(html).toContain("Browse");
});

test("getAcceptAttr normalizes all accept shapes", () => {
	expect(getAcceptAttr(undefined)).toBeUndefined();
	expect(getAcceptAttr("image/*")).toBe("image/*");
	expect(getAcceptAttr(["image/png", ".pdf"])).toBe("image/png,.pdf");
	expect(getAcceptAttr({ "image/png": [".png"] })).toBe("image/png,.png");
});

test("formatBytes formats sizes like Ark UI", () => {
	expect(formatBytes(0)).toBe("0 B");
	expect(formatBytes(1024)).toBe("1 kB");
	expect(formatBytes(1536)).toBe("1.5 kB");
	expect(formatBytes(1048576)).toBe("1 MB");
	expect(formatBytes(-1)).toBe("");
});
