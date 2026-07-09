import { expect, test } from "bun:test";
import { TagsInput } from "../app/components/ui/tags-input";

test("TagsInput renders with default value", () => {
	const html = (
		<TagsInput
			label="Frameworks"
			defaultValue={["React", "Solid"]}
		/>
	).toString();

	expect(html).toContain('data-part="root"');
	expect(html).toContain('data-part="label"');
	expect(html).toContain("Frameworks");
	expect(html).toContain('data-value="React"');
	expect(html).toContain('data-value="Solid"');
	expect(html).toContain('value="React,Solid"');
});

test("TagsInput renders interactive island when onValueChange is provided", () => {
    const html = (
        <TagsInput
            label="Frameworks"
            defaultValue={["React"]}
            onValueChange={() => {}}
        />
    ).toString();

    // In our implementation, islands add data-interactive="true"
    expect(html).toContain('data-interactive="true"');
});
