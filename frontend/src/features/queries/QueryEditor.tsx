import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorActions } from "@/components/workspace/EditorActions";
import { EntityEditorShell } from "@/components/workspace/EntityEditorShell";
import type { Category, QueryPreview } from "@/lib/api-types";

import { QueryDetailsTab } from "./QueryDetailsTab";
import { QuerySqlTab } from "./QuerySqlTab";
import { QueryVariablesTab } from "./QueryVariablesTab";
import type { ClientVariable } from "./query-form";
import { type QueryEditorForm, useQueryEditor } from "./use-query-editor";

type QueryEditorProps = {
	entityId: number | null;
};

type QueryEditorTab = "details" | "query" | "variables";

type QueryEditorPanelsProps = {
	form: QueryEditorForm;
	selectedQueryId: number | null;
	categories: Category[];
	formVariables: ClientVariable[];
	preview: QueryPreview | null;
	previewVariableValues: Record<string, string>;
	isDirty: boolean;
	isPreviewLoading: boolean;
	toggleCategory: (categoryId: number) => void;
	onAddSection: () => void;
	onRemoveSection: (clientId: string) => void;
	onReorderSection: (fromIndex: number, toIndex: number) => void;
	onAddVariable: () => void;
	onRemoveVariable: (clientId: string) => void;
	updatePreviewVariable: (name: string, value: string) => void;
};

function QueryEditorPanels({
	form,
	selectedQueryId,
	categories,
	formVariables,
	preview,
	previewVariableValues,
	isDirty,
	isPreviewLoading,
	toggleCategory,
	onAddSection,
	onRemoveSection,
	onReorderSection,
	onAddVariable,
	onRemoveVariable,
	updatePreviewVariable,
}: QueryEditorPanelsProps) {
	const [activeTab, setActiveTab] = useState<QueryEditorTab>("details");

	return (
		<Tabs
			value={activeTab}
			onValueChange={(nextTab) => setActiveTab(nextTab as QueryEditorTab)}
			className="min-h-0 flex-1"
		>
			<TabsList variant="line" className="w-full justify-start">
				<TabsTrigger value="details">Details</TabsTrigger>
				<TabsTrigger value="query">Query</TabsTrigger>
				<TabsTrigger value="variables">Variables</TabsTrigger>
			</TabsList>

			<TabsContent value="details" className="mt-0 min-h-0 flex-1">
				<QueryDetailsTab
					form={form}
					categories={categories}
					toggleCategory={toggleCategory}
				/>
			</TabsContent>

			<TabsContent value="query" className="mt-0 min-h-0 flex-1">
				<QuerySqlTab
					form={form}
					selectedQueryId={selectedQueryId}
					formVariables={formVariables}
					preview={preview}
					previewVariableValues={previewVariableValues}
					isDirty={isDirty}
					isPreviewLoading={isPreviewLoading}
					onAddSection={onAddSection}
					onRemoveSection={onRemoveSection}
					onReorderSection={onReorderSection}
					updatePreviewVariable={updatePreviewVariable}
				/>
			</TabsContent>

			<TabsContent value="variables" className="mt-0 min-h-0 flex-1">
				<QueryVariablesTab
					form={form}
					onAddVariable={onAddVariable}
					onRemoveVariable={onRemoveVariable}
				/>
			</TabsContent>
		</Tabs>
	);
}

export function QueryEditor({ entityId }: QueryEditorProps) {
	const {
		entityId: selectedQueryId,
		selectedQuery,
		selectedQueryName,
		isNotFound,
		errorMessage,
		form,
		categories,
		formVariables,
		preview,
		previewVariableValues,
		isDirty,
		isSaving,
		isPreviewLoading,
		handleDelete,
		handleBack,
		toggleCategory,
		addSection,
		removeSection,
		reorderSection,
		addVariable,
		removeVariable,
		updatePreviewVariable,
	} = useQueryEditor(entityId);

	return (
		<EntityEditorShell
			isNotFound={isNotFound}
			notFoundMessage="This audit query does not exist or may have been deleted."
			backLabel="Back to queries"
			onBack={handleBack}
			errorMessage={errorMessage}
			title={selectedQueryId === null ? "Create query" : "Edit query"}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					{selectedQuery ? (
						<Badge variant="secondary">v{selectedQuery.versionNumber}</Badge>
					) : null}
					<EditorActions
						entityId={selectedQueryId}
						saveLabel="Save query"
						isSaving={isSaving}
						onDelete={handleDelete}
						deleteTitle="Delete audit query?"
						deleteDescription={
							<>
								This will permanently delete &quot;
								{selectedQueryName ?? "this query"}&quot;.
							</>
						}
					/>
				</div>
			}
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<QueryEditorPanels
				key={String(selectedQueryId ?? "new")}
				form={form}
				selectedQueryId={selectedQueryId}
				categories={categories}
				formVariables={formVariables}
				preview={preview}
				previewVariableValues={previewVariableValues}
				isDirty={isDirty}
				isPreviewLoading={isPreviewLoading}
				toggleCategory={toggleCategory}
				onAddSection={addSection}
				onRemoveSection={removeSection}
				onReorderSection={reorderSection}
				onAddVariable={addVariable}
				onRemoveVariable={removeVariable}
				updatePreviewVariable={updatePreviewVariable}
			/>
		</EntityEditorShell>
	);
}
