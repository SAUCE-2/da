import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/workspace/FieldLabel";

type VariableValueField = {
	name: string;
	defaultValue?: string | null;
	required?: boolean;
};

type VariableValueFieldsProps = {
	variables: VariableValueField[];
	values: Record<string, string>;
	onChange: (name: string, value: string) => void;
	layout?: "stack" | "grid";
	className?: string;
	keyFor?: (variable: VariableValueField, index: number) => string;
};

export function VariableValueFields({
	variables,
	values,
	onChange,
	layout = "grid",
	className,
	keyFor,
}: VariableValueFieldsProps) {
	const namedVariables = variables.filter((variable) => variable.name.trim());

	if (namedVariables.length === 0) {
		return null;
	}

	return (
		<FieldGroup
			className={
				className ?? (layout === "grid" ? "grid gap-4 lg:grid-cols-2" : "gap-4")
			}
		>
			{namedVariables.map((variable, index) => (
				<Field key={keyFor?.(variable, index) ?? variable.name}>
					<FieldLabel required={variable.required}>{variable.name}</FieldLabel>
					<Input
						value={values[variable.name] ?? ""}
						onChange={(event) => onChange(variable.name, event.target.value)}
						placeholder={variable.defaultValue ?? undefined}
					/>
				</Field>
			))}
		</FieldGroup>
	);
}
