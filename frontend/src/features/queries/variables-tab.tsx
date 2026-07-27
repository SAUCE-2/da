import { Button } from "@/components/ui/button";

import { FormSection } from "@/components/workspace/editor/form-section";
import type { QueryEditorForm } from "./use-editor";
import { QueryVariablesEditor } from "./variables-editor";

type QueryVariablesTabProps = {
	form: QueryEditorForm;
	onAddVariable: () => void;
	onRemoveVariable: (clientId: string) => void;
};

export function QueryVariablesTab({
	form,
	onAddVariable,
	onRemoveVariable,
}: QueryVariablesTabProps) {
	return (
		<FormSection
			title="Query variables"
			action={
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onAddVariable}
				>
					Add variable
				</Button>
			}
		>
			<QueryVariablesEditor
				form={form}
				embedded
				onAddVariable={onAddVariable}
				onRemoveVariable={onRemoveVariable}
			/>
		</FormSection>
	);
}
