import { FieldLabel as UiFieldLabel } from "@/components/ui/field";

type FieldLabelProps = React.ComponentProps<typeof UiFieldLabel> & {
	required?: boolean;
};

/** App field label — wraps shadcn `FieldLabel` with an optional required marker. */
export function FieldLabel({ required, children, ...props }: FieldLabelProps) {
	return (
		<UiFieldLabel {...props}>
			{children}
			{required ? <span className="text-destructive">*</span> : null}
		</UiFieldLabel>
	);
}
