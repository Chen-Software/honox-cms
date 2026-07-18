import { describe, expect, test } from "bun:test";
import { createToaster, Toast, Toaster } from "./toast";

describe("Toast component and createToaster store", () => {
	test("createToaster should initialize with default configuration", () => {
		const toasterInstance = createToaster();
		expect(toasterInstance.placement).toBe("bottom-end");
		expect(toasterInstance.overlap).toBe(false);
		expect(toasterInstance.max).toBe(24);
		expect(toasterInstance.getCount()).toBe(0);
		expect(toasterInstance.getToasts()).toEqual([]);
	});

	test("createToaster should respect custom configuration", () => {
		const toasterInstance = createToaster({
			placement: "top-start",
			overlap: true,
			max: 10,
		});
		expect(toasterInstance.placement).toBe("top-start");
		expect(toasterInstance.overlap).toBe(true);
		expect(toasterInstance.max).toBe(10);
	});

	test("toaster.create should add a toast and notify listeners", () => {
		const toasterInstance = createToaster();
		let notifiedToasts: any[] = [];
		const unsubscribe = toasterInstance.subscribe((toasts) => {
			notifiedToasts = toasts;
		});

		const id = toasterInstance.create({
			title: "Hello World",
			description: "This is a test toast",
		});

		expect(id).toBeDefined();
		expect(toasterInstance.getCount()).toBe(1);
		expect(toasterInstance.getToasts()[0]?.title).toBe("Hello World");
		expect(notifiedToasts.length).toBe(1);
		expect(notifiedToasts[0]?.id).toBe(id);

		unsubscribe();
	});

	test("toaster.success, error, warning, info and loading should add appropriate types", () => {
		const toasterInstance = createToaster();

		// test with string title
		toasterInstance.success("Success title");
		expect(toasterInstance.getToasts()[0]?.type).toBe("success");
		expect(toasterInstance.getToasts()[0]?.title).toBe("Success title");

		// test with options object
		toasterInstance.error({
			title: "Error title",
			description: "Something failed",
		});
		expect(toasterInstance.getToasts()[1]?.type).toBe("error");
		expect(toasterInstance.getToasts()[1]?.title).toBe("Error title");

		toasterInstance.warning("Warning message");
		expect(toasterInstance.getToasts()[2]?.type).toBe("warning");

		toasterInstance.info("Info message");
		expect(toasterInstance.getToasts()[3]?.type).toBe("info");

		toasterInstance.loading("Loading message");
		expect(toasterInstance.getToasts()[4]?.type).toBe("loading");
	});

	test("toaster.update should modify an existing toast", () => {
		const toasterInstance = createToaster();
		const id = toasterInstance.create({
			title: "Old Title",
			description: "Old description",
		});

		expect(toasterInstance.getToasts()[0]?.title).toBe("Old Title");

		toasterInstance.update(id, { title: "New Title" });
		expect(toasterInstance.getToasts()[0]?.title).toBe("New Title");
		expect(toasterInstance.getToasts()[0]?.description).toBe("Old description");
	});

	test("toaster.dismiss should remove a toast or all toasts", () => {
		const toasterInstance = createToaster();
		const id1 = toasterInstance.create({ title: "Toast 1" });
		const id2 = toasterInstance.create({ title: "Toast 2" });

		expect(toasterInstance.getCount()).toBe(2);

		toasterInstance.dismiss(id1);
		expect(toasterInstance.getCount()).toBe(1);
		expect(toasterInstance.getToasts()[0]?.id).toBe(id2);

		toasterInstance.dismiss();
		expect(toasterInstance.getCount()).toBe(0);
	});

	test("toaster.promise should handle loading, success and error states of a promise", async () => {
		const toasterInstance = createToaster();

		// Test success promise
		const successPromise = Promise.resolve("Data loaded successfully!");
		await toasterInstance.promise(successPromise, {
			loading: { title: "Loading data..." },
			success: (data) => ({ title: "Success!", description: data }),
			error: "Failed to load",
		});

		// Small tick to ensure promise microtasks have fully drained
		await new Promise((resolve) => setTimeout(resolve, 5));

		const toasts = toasterInstance.getToasts();
		expect(toasts.length).toBe(1);
		expect(toasts[0]?.type).toBe("success");
		expect(toasts[0]?.title).toBe("Success!");
		expect(toasts[0]?.description).toBe("Data loaded successfully!");

		// Test error promise
		toasterInstance.dismiss();
		const errorPromise = Promise.reject(new Error("Network Error"));
		try {
			await toasterInstance.promise(errorPromise, {
				loading: { title: "Loading data..." },
				success: "Loaded!",
				error: (err) => ({ title: "Error occurred", description: err.message }),
			});
		} catch (e) {
			// Expected rejection
		}

		// Small tick to ensure promise microtasks have fully drained
		await new Promise((resolve) => setTimeout(resolve, 5));

		const toastsAfterReject = toasterInstance.getToasts();
		expect(toastsAfterReject.length).toBe(1);
		expect(toastsAfterReject[0]?.type).toBe("error");
		expect(toastsAfterReject[0]?.title).toBe("Error occurred");
		expect(toastsAfterReject[0]?.description).toBe("Network Error");
	});

	test("Toaster should render toasts to HTML string correctly", () => {
		const toasterInstance = createToaster();
		toasterInstance.create({
			title: "HTML Toast Title",
			description: "HTML Toast Description",
			type: "success",
			closable: true,
		});

		const html = (<Toaster toaster={toasterInstance} />).toString();

		expect(html).toContain("HTML Toast Title");
		expect(html).toContain("HTML Toast Description");
		expect(html).toContain('data-part="root"');
		expect(html).toContain('data-type="success"');
		expect(html).toContain('data-part="indicator"');
		expect(html).toContain('aria-label="Close"');
	});

	test("Toaster should support custom function-as-child pattern", () => {
		const toasterInstance = createToaster();
		toasterInstance.create({
			title: "Custom Title",
			description: "Custom Description",
			type: "info",
		});

		const html = (
			<Toaster toaster={toasterInstance}>
				{(toast) => (
					<div class="custom-toast">
						<h3>{toast.title}</h3>
						<p>{toast.description}</p>
					</div>
				)}
			</Toaster>
		).toString();

		expect(html).toContain('<div class="custom-toast">');
		expect(html).toContain("<h3>Custom Title</h3>");
		expect(html).toContain("<p>Custom Description</p>");
	});

	test("Individual compound Toast components should render correctly and fallback to context", () => {
		const html = (
			<Toast.Root type="success">
				<Toast.Indicator />
				<Toast.Title>Explicit Title</Toast.Title>
				<Toast.Description>Explicit Description</Toast.Description>
				<Toast.ActionTrigger>Action</Toast.ActionTrigger>
				<Toast.CloseTrigger>Close</Toast.CloseTrigger>
			</Toast.Root>
		).toString();

		expect(html).toContain('data-part="root"');
		expect(html).toContain('data-type="success"');
		expect(html).toContain("Explicit Title");
		expect(html).toContain("Explicit Description");
		expect(html).toContain("Action");
		expect(html).toContain("Close");
	});

	test("Toast.Indicator should receive its own recipe-generated styles", () => {
		const html = (
			<Toast.Root type="success">
				<Toast.Indicator />
			</Toast.Root>
		).toString();

		expect(html).toContain("toast__indicator");
	});

	test("Toast.Root should expose an accessible status/alert role and live region per type", () => {
		const infoHtml = (<Toast.Root type="info" />).toString();
		expect(infoHtml).toContain('role="status"');
		expect(infoHtml).toContain('aria-live="polite"');

		const errorHtml = (<Toast.Root type="error" />).toString();
		expect(errorHtml).toContain('role="alert"');
		expect(errorHtml).toContain('aria-live="assertive"');
	});

	test("toaster.pause should freeze the auto-dismiss timer and toaster.resume should continue it", async () => {
		const toasterInstance = createToaster({ duration: 60 });
		const id = toasterInstance.create({ title: "Pausable" });
		expect(id).toBeDefined();

		toasterInstance.pause();
		await new Promise((resolve) => setTimeout(resolve, 100));
		// Still present: the timer was paused before it could fire.
		expect(toasterInstance.getCount()).toBe(1);

		toasterInstance.resume();
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(toasterInstance.getCount()).toBe(0);
	});

	test("toaster.pause should be a no-op for toasts with no auto-dismiss duration", async () => {
		const toasterInstance = createToaster();
		toasterInstance.create({ title: "Sticky", duration: 0 });

		toasterInstance.pause();
		toasterInstance.resume();
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(toasterInstance.getCount()).toBe(1);
	});

	test("toaster.update should reschedule the auto-dismiss timer when duration changes", async () => {
		const toasterInstance = createToaster({ duration: 5000 });
		const id = toasterInstance.create({ title: "Reschedule me" });

		toasterInstance.update(id, { duration: 30 });
		await new Promise((resolve) => setTimeout(resolve, 80));
		expect(toasterInstance.getCount()).toBe(0);
	});
});
