import { Button } from "@/components/ui/button";

import { EditorSection } from "@/components/workspace/EditorSection";
import { QueryVariablesEditor } from "./QueryVariablesEditor";
import type { QueryEditorForm } from "./use-query-editor";

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
		<EditorSection
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
		</EditorSection>
	);
}
