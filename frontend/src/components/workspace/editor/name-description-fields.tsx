import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Minimal field API shape shared by query/plan forms.
 * TanStack Form's generics don't cross feature boundaries cleanly, so the
 * form prop stays loosely typed; individual field callbacks use this instead.
 */
export type SimpleFormField = {
	state: { value: string | boolean };
	handleChange: (value: string | boolean) => void;
	handleBlur?: () => void;
};

type NameDescriptionFieldsProps = {
	// TanStack Form's Field component is awkward to type generically across features.
	// biome-ignore lint/suspicious/noExplicitAny: shared across plan/query forms
	form: any;
	activeFieldId?: string;
	activeLabel?: string;
	namePlaceholder?: string;
	descriptionPlaceholder?: string;
};

export function NameDescriptionFields({
	form,
	activeFieldId = "entity-active",
	activeLabel = "Active",
	namePlaceholder = "Name",
	descriptionPlaceholder = "Description",
}: NameDescriptionFieldsProps) {
	return (
		<FieldGroup className="grid gap-4 lg:grid-cols-2">
			<form.Field name="name">
				{(field: SimpleFormField) => (
					<Field>
						<FieldLabel required>Name</FieldLabel>
						<Input
							value={field.state.value as string}
							onChange={(event) => field.handleChange(event.target.value)}
							onBlur={field.handleBlur}
							placeholder={namePlaceholder}
						/>
					</Field>
				)}
			</form.Field>

			<form.Field name="active">
				{(field: SimpleFormField) => (
					<Field orientation="horizontal">
						<Checkbox
							id={activeFieldId}
							checked={field.state.value as boolean}
							onCheckedChange={(checked) =>
								field.handleChange(checked === true)
							}
						/>
						<FieldLabel htmlFor={activeFieldId}>{activeLabel}</FieldLabel>
					</Field>
				)}
			</form.Field>

			<form.Field name="description">
				{(field: SimpleFormField) => (
					<Field className="lg:col-span-2">
						<FieldLabel>Description</FieldLabel>
						<Textarea
							value={field.state.value as string}
							onChange={(event) => field.handleChange(event.target.value)}
							onBlur={field.handleBlur}
							className="min-h-20"
							placeholder={descriptionPlaceholder}
						/>
					</Field>
				)}
			</form.Field>
		</FieldGroup>
	);
}
