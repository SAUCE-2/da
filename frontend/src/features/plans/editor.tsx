import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorActions } from "@/components/workspace/editor/actions";
import { FormSection } from "@/components/workspace/editor/form-section";
import { NameDescriptionFields } from "@/components/workspace/editor/name-description-fields";
import { EditorPage } from "@/components/workspace/editor/page";
import type { Query, QuerySummary } from "@/lib/api-types";

import { PlanItemsEditor } from "./items-editor";
import { type PlanEditorForm, usePlanEditor } from "./use-editor";
import { PlanVariablesEditor } from "./variables-editor";

type PlanEditorProps = {
	entityId: number | null;
};

type PlanEditorTab = "details" | "queries" | "variables";

type PlanEditorPanelsProps = {
	form: PlanEditorForm;
	querySummaries: QuerySummary[];
	queries: Query[];
	onAddItem: () => void;
	onRemoveItem: (clientId: string) => void;
	onReorderItem: (fromIndex: number, toIndex: number) => void;
	onQueryChange: (clientId: string, queryId: number | null) => void;
};

function PlanEditorPanels({
	form,
	querySummaries,
	queries,
	onAddItem,
	onRemoveItem,
	onReorderItem,
	onQueryChange,
}: PlanEditorPanelsProps) {
	const [activeTab, setActiveTab] = useState<PlanEditorTab>("details");

	return (
		<Tabs
			value={activeTab}
			onValueChange={(nextTab) => setActiveTab(nextTab as PlanEditorTab)}
			className="min-h-0 flex-1"
		>
			<TabsList variant="line" className="w-full justify-start">
				<TabsTrigger value="details">Details</TabsTrigger>
				<TabsTrigger value="queries">Queries</TabsTrigger>
				<TabsTrigger value="variables">Variables</TabsTrigger>
			</TabsList>

			<TabsContent value="details" className="mt-0 min-h-0 flex-1">
				<FormSection title="Basic information">
					<NameDescriptionFields
						form={form}
						activeLabel="Active"
						namePlaceholder="Plan name"
						descriptionPlaceholder="What this plan checks and when it should be used"
					/>
				</FormSection>
			</TabsContent>

			<TabsContent value="queries" className="mt-0 min-h-0 flex-1">
				<PlanItemsEditor
					form={form}
					queries={querySummaries}
					onAddItem={onAddItem}
					onRemoveItem={onRemoveItem}
					onReorderItem={onReorderItem}
					onQueryChange={onQueryChange}
				/>
			</TabsContent>

			<TabsContent value="variables" className="mt-0 min-h-0 flex-1">
				<PlanVariablesEditor form={form} queries={queries} />
			</TabsContent>
		</Tabs>
	);
}

export function PlanEditor({ entityId }: PlanEditorProps) {
	const {
		entityId: selectedPlanId,
		selectedPlanName,
		isNotFound,
		errorMessage,
		form,
		querySummaries,
		queries,
		isSaving,
		handleDelete,
		handleBack,
		addItem,
		removeItem,
		reorderItem,
		handleQueryChange,
	} = usePlanEditor(entityId);

	return (
		<EditorPage
			isNotFound={isNotFound}
			notFoundMessage="This audit plan does not exist or may have been deleted."
			backLabel="Back to plans"
			onBack={handleBack}
			errorMessage={errorMessage}
			title={selectedPlanId === null ? "Create plan" : "Edit plan"}
			actions={
				<EditorActions
					entityId={selectedPlanId}
					saveLabel="Save plan"
					isSaving={isSaving}
					onDelete={handleDelete}
					deleteTitle="Delete audit plan?"
					deleteDescription={
						<>
							This will permanently delete &quot;
							{selectedPlanName ?? "this plan"}&quot;.
						</>
					}
				/>
			}
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<PlanEditorPanels
				key={String(selectedPlanId ?? "new")}
				form={form}
				querySummaries={querySummaries}
				queries={queries}
				onAddItem={addItem}
				onRemoveItem={removeItem}
				onReorderItem={reorderItem}
				onQueryChange={(clientId, queryId) => {
					void handleQueryChange(clientId, queryId);
				}}
			/>
		</EditorPage>
	);
}
