import { useStore } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSection } from "@/components/workspace/editor/form-section";
import { VariableValueFields } from "@/components/workspace/editor/variable-value-fields";
import type { Query } from "@/lib/api-types";
import type { PlanEditorForm } from "./use-editor";

type PlanVariablesEditorProps = {
	form: PlanEditorForm;
	queries: Query[];
};

export function PlanVariablesEditor({
	form,
	queries,
}: PlanVariablesEditorProps) {
	const items = useStore(form.store, (state) => state.values.items);

	const itemsWithVariables = items
		.map((item, index) => {
			const selectedQuery = queries.find((query) => query.id === item.queryId);
			if (!selectedQuery || selectedQuery.variables.length === 0) {
				return null;
			}
			return { item, index, selectedQuery };
		})
		.filter((entry) => entry !== null);

	return (
		<FormSection title="Variable defaults">
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Add queries on the Queries tab first.
				</p>
			) : itemsWithVariables.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Queries in this plan define no variables.
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{itemsWithVariables.map(({ item, index, selectedQuery }) => (
						<Card key={item.clientId} size="sm">
							<CardHeader>
								<CardTitle>
									Step {index + 1}: {selectedQuery.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<VariableValueFields
									variables={selectedQuery.variables}
									values={item.variableBindings}
									onChange={(name, value) => {
										const nextBindings = {
											...item.variableBindings,
											[name]: value,
										};
										form.setFieldValue(
											`items[${index}].variableBindings`,
											nextBindings,
										);
									}}
								/>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</FormSection>
	);
}
