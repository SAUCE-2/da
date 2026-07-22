import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "@/components/workspace/FieldLabel";

type EntityMetadataFieldsProps = {
	// TanStack Form's Field component is awkward to type generically here.
	// biome-ignore lint/suspicious/noExplicitAny: shared across plan/query forms
	form: any;
	activeFieldId?: string;
	activeLabel?: string;
	namePlaceholder?: string;
	descriptionPlaceholder?: string;
};

export function EntityMetadataFields({
	form,
	activeFieldId = "entity-active",
	activeLabel = "Active",
	namePlaceholder = "Name",
	descriptionPlaceholder = "Description",
}: EntityMetadataFieldsProps) {
	return (
		<FieldGroup className="grid gap-4 lg:grid-cols-2">
			<form.Field name="name">
				{(field: {
					state: { value: string | boolean };
					handleChange: (value: string | boolean) => void;
					handleBlur?: () => void;
				}) => (
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
				{(field: {
					state: { value: string | boolean };
					handleChange: (value: string | boolean) => void;
					handleBlur?: () => void;
				}) => (
					<Field orientation="horizontal">
						<Switch
							id={activeFieldId}
							checked={field.state.value as boolean}
							onCheckedChange={(checked) => field.handleChange(checked)}
						/>
						<FieldLabel htmlFor={activeFieldId}>{activeLabel}</FieldLabel>
					</Field>
				)}
			</form.Field>

			<form.Field name="description">
				{(field: {
					state: { value: string | boolean };
					handleChange: (value: string | boolean) => void;
					handleBlur?: () => void;
				}) => (
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
