import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorActions } from "@/components/workspace/editor/actions";
import { EditorPage } from "@/components/workspace/editor/page";
import type { Category } from "@/lib/api-types";

import { QueryDetailsTab } from "./details-tab";
import type { ClientVariable } from "./form";
import { QuerySqlTab } from "./sql-tab";
import { type QueryEditorForm, useQueryEditor } from "./use-editor";
import { QueryVariablesTab } from "./variables-tab";
import { QueryVersionNav } from "./version-nav";

type QueryEditorProps = {
	entityId: number | null;
};

type QueryEditorTab = "details" | "query" | "variables";

type QueryEditorPanelsProps = {
	form: QueryEditorForm;
	categories: Category[];
	formVariables: ClientVariable[];
	previewVariableValues: Record<string, string>;
	toggleCategory: (categoryId: number) => void;
	onAddVariable: () => void;
	onRemoveVariable: (clientId: string) => void;
	updatePreviewVariable: (name: string, value: string) => void;
};

function QueryEditorPanels({
	form,
	categories,
	formVariables,
	previewVariableValues,
	toggleCategory,
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
					formVariables={formVariables}
					previewVariableValues={previewVariableValues}
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
		query,
		form,
		formVariables,
		previewVariableValues,
		versions,
		actions,
	} = useQueryEditor(entityId);

	return (
		<EditorPage
			isNotFound={query.isNotFound}
			notFoundMessage="This audit query does not exist or may have been deleted."
			backLabel="Back to queries"
			onBack={actions.handleBack}
			errorMessage={query.errorMessage}
			title={query.entityId === null ? "Create query" : "Edit query"}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					{query.selectedQuery ? (
						<QueryVersionNav
							versions={versions.list}
							viewingVersionId={versions.viewingVersionId}
							viewingVersionNumber={versions.viewingVersionNumber}
							currentVersionId={query.selectedQuery.versionId}
							isViewingHistorical={versions.isViewingHistorical}
							canGoPrevious={versions.canGoPrevious}
							canGoNext={versions.canGoNext}
							isLoadingVersion={versions.isLoadingVersion}
							isRestoring={versions.isRestoring}
							onPrevious={versions.goToPreviousVersion}
							onNext={versions.goToNextVersion}
							onSelectVersion={(versionId) => {
								void versions.loadVersion(versionId);
							}}
							onRestore={() => {
								void versions.handleRestore();
							}}
						/>
					) : null}
					<EditorActions
						entityId={query.entityId}
						saveLabel="Save query"
						isSaving={query.isSaving}
						onDelete={actions.handleDelete}
						deleteTitle="Delete audit query?"
						deleteDescription={
							<>
								This will permanently delete &quot;
								{query.selectedQueryName ?? "this query"}&quot;.
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
				key={`${String(query.entityId ?? "new")}-${String(versions.viewingVersionId ?? "current")}`}
				form={form}
				categories={query.categories}
				formVariables={formVariables}
				previewVariableValues={previewVariableValues}
				toggleCategory={actions.toggleCategory}
				onAddVariable={actions.addVariable}
				onRemoveVariable={actions.removeVariable}
				updatePreviewVariable={actions.updatePreviewVariable}
			/>
		</EditorPage>
	);
}
