import type * as React from "react";

import { FieldLabel as UiFieldLabel } from "@/components/ui/field";

export function FieldLabel({
	required,
	children,
	...props
}: React.ComponentProps<typeof UiFieldLabel> & { required?: boolean }) {
	return (
		<UiFieldLabel {...props}>
			{children}
			{required ? <span className="text-destructive">*</span> : null}
		</UiFieldLabel>
	);
}
