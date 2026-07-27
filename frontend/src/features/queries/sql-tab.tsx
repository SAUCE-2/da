import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";

import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FormSection } from "@/components/workspace/editor/form-section";
import { VariableValueFields } from "@/components/workspace/editor/variable-value-fields";
import { renderBody, substitutePreviewVariables } from "./document";
import type { ClientVariable } from "./form";
import { FormattedSqlDisplay } from "./formatted-sql-display";
import { SqlDocumentEditor } from "./sql-document-editor";
import type { QueryEditorForm } from "./use-editor";

type QuerySqlTabProps = {
	form: QueryEditorForm;
	formVariables: ClientVariable[];
	previewVariableValues: Record<string, string>;
	updatePreviewVariable: (name: string, value: string) => void;
};

export function QuerySqlTab({
	form,
	formVariables,
	previewVariableValues,
	updatePreviewVariable,
}: QuerySqlTabProps) {
	const query = useStore(form.store, (state) => state.values.query);
	const disabledLines = useStore(
		form.store,
		(state) => state.values.defaultDisabledLines,
	);
	const namedVariables = formVariables.filter((variable) =>
		variable.name.trim(),
	);
	const knownVariables = namedVariables.map((variable) => variable.name.trim());
	const hasNamedVariables = namedVariables.length > 0;

	const previewSql = useMemo(() => {
		const structural = renderBody(query, disabledLines);
		return substitutePreviewVariables(structural, previewVariableValues);
	}, [query, disabledLines, previewVariableValues]);

	return (
		<div className="flex min-h-0 flex-col gap-6">
			<FormSection title="Query document">
				<form.Field name="query">
					{(field) => (
						<SqlDocumentEditor
							value={field.state.value}
							disabledLines={disabledLines}
							knownVariables={knownVariables}
							onChange={(next) => field.handleChange(next)}
							onDisabledLinesChange={(next) =>
								form.setFieldValue("defaultDisabledLines", next)
							}
						/>
					)}
				</form.Field>
			</FormSection>

			<FormSection title="SQL preview">
				{hasNamedVariables ? (
					<div className="mb-4 flex flex-col gap-3">
						<p className="text-sm font-medium">Preview values</p>
						<VariableValueFields
							variables={formVariables}
							values={previewVariableValues}
							onChange={updatePreviewVariable}
							keyFor={(variable) => variable.name}
							layout="grid"
							className="grid gap-4 lg:grid-cols-2"
						/>
					</div>
				) : null}

				{previewSql.trim() ? (
					<FormattedSqlDisplay sql={previewSql} />
				) : (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Nothing to preview</EmptyTitle>
						</EmptyHeader>
					</Empty>
				)}
			</FormSection>
		</div>
	);
}
