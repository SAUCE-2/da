import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { EditorSection } from "@/components/workspace/EditorSection";
import { VariableValueFields } from "@/components/workspace/VariableValueFields";
import {
	renderBody,
	substitutePreviewVariables,
} from "./editor/query-document";
import { SqlDocumentEditor } from "./editor/SqlDocumentEditor";
import { FormattedSqlDisplay } from "./FormattedSqlDisplay";
import type { ClientVariable } from "./query-form";
import type { QueryEditorForm } from "./use-query-editor";

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
			<EditorSection title="Query document">
				<p className="mb-3 text-sm text-muted-foreground">
					Use <code className="text-xs">--# Section</code> /{" "}
					<code className="text-xs">--## Subsection</code> headers to group SQL.
					Click a line number to disable a line; click a section header line
					number to toggle the whole section (including nested subsections).
					Variables use <code className="text-xs">{"{{name}}"}</code>.
				</p>
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
			</EditorSection>

			<EditorSection title="SQL preview">
				{hasNamedVariables ? (
					<div className="mb-4 flex flex-col gap-3">
						<div className="flex flex-col gap-0.5">
							<p className="text-sm font-medium">Preview values</p>
							<p className="text-xs text-muted-foreground">
								Override defaults for this preview only — not saved with the
								query.
							</p>
						</div>
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
							<EmptyDescription>
								Enable at least one SQL line, or add content below a{" "}
								<code className="text-xs">--#</code> section header.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</EditorSection>
		</div>
	);
}
