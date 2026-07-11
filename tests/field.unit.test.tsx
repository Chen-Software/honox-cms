import { expect, test } from "bun:test";
import { Field } from "../app/components/ui/field";

test("Field - Flattened API renders basic structure", () => {
	const html = (
		<Field
			id="test-field"
			label="Username"
			helperText="Choose a unique username"
			defaultValue="jules"
		/>
	).toString();

	// Verify label rendering
	expect(html).toContain("Username");
	expect(html).toContain('id="field::test-field::label"');
	expect(html).toContain('for="test-field"');

	// Verify input rendering
	expect(html).toContain('<input id="test-field"');
	expect(html).toContain('value="jules"');

	// Verify helper text rendering
	expect(html).toContain("Choose a unique username");
	expect(html).toContain('id="field::test-field::helper-text"');
});

test("Field - Flattened API validation (minLength)", () => {
	const html = (
		<Field
			id="validate-field"
			label="Username"
			helperText="Choose a unique username"
			defaultValue="ab"
			minLength={5}
		/>
	).toString();

	// Verify error message for minLength validation
	expect(html).toContain("Must be at least 5 characters");
	expect(html).toContain('aria-invalid="true"');
	expect(html).toContain('data-invalid=""');
});
