import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorSection } from "@/components/workspace/EditorSection";
import { VariableValueFields } from "@/components/workspace/VariableValueFields";
import type { QueryPreview } from "@/lib/api-types";
import { FormattedSqlDisplay } from "./FormattedSqlDisplay";
import { QuerySectionsEditor } from "./QuerySectionsEditor";
import type { ClientVariable } from "./query-form";
import type { QueryEditorForm } from "./use-query-editor";

type QuerySqlTabProps = {
	form: QueryEditorForm;
	selectedQueryId: number | null;
	formVariables: ClientVariable[];
	preview: QueryPreview | null;
	previewVariableValues: Record<string, string>;
	isDirty: boolean;
	isPreviewLoading: boolean;
	onAddSection: () => void;
	onRemoveSection: (clientId: string) => void;
	onReorderSection: (fromIndex: number, toIndex: number) => void;
	updatePreviewVariable: (name: string, value: string) => void;
};

export function QuerySqlTab({
	form,
	selectedQueryId,
	formVariables,
	preview,
	previewVariableValues,
	isDirty,
	isPreviewLoading,
	onAddSection,
	onRemoveSection,
	onReorderSection,
	updatePreviewVariable,
}: QuerySqlTabProps) {
	const namedVariables = formVariables.filter((variable) =>
		variable.name.trim(),
	);
	const hasNamedVariables = namedVariables.length > 0;
	const canPreview = selectedQueryId !== null;

	return (
		<>
			<EditorSection
				title="Query sections"
				action={
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onAddSection}
					>
						Add section
					</Button>
				}
			>
				<QuerySectionsEditor
					form={form}
					embedded
					onAddSection={onAddSection}
					onRemoveSection={onRemoveSection}
					onReorderSection={onReorderSection}
				/>
			</EditorSection>

			<EditorSection title="SQL preview">
				{!canPreview ? (
					<>
						<Empty>
							<EmptyHeader>
								<EmptyTitle>Preview unavailable</EmptyTitle>
								<EmptyDescription>
									Save the query before requesting a backend-rendered preview.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
						{hasNamedVariables ? (
							<p className="text-sm text-muted-foreground">
								Save the query to preview SQL. Variable definitions on the
								Variables tab apply after save.
							</p>
						) : null}
					</>
				) : (
					<>
						{hasNamedVariables ? (
							<div className="flex flex-col gap-3">
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

						{isPreviewLoading ? (
							<div className="flex flex-col gap-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<Skeleton className="h-4 w-4/6" />
							</div>
						) : preview?.id === selectedQueryId ? (
							<FormattedSqlDisplay
								sql={preview.sql}
								emptyMessage="-- No default-enabled sections to render."
							/>
						) : (
							<Empty>
								<EmptyHeader>
									<EmptyTitle>Preview unavailable</EmptyTitle>
									<EmptyDescription>
										The backend did not return a preview for this query.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</>
				)}
				{isDirty && canPreview ? (
					<p className="text-sm text-muted-foreground">
						Unsaved section or variable definition edits are not reflected in
						the preview yet.
					</p>
				) : null}
			</EditorSection>
		</>
	);
}
