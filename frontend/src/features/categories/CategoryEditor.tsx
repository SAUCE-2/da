import pluralize from "pluralize";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorActions } from "@/components/workspace/EditorActions";
import { EditorSection } from "@/components/workspace/EditorSection";
import { EntityEditorShell } from "@/components/workspace/EntityEditorShell";
import { FieldLabel } from "@/components/workspace/FieldLabel";

import { useCategoryEditor } from "./use-category-editor";

type CategoryEditorProps = {
	entityId: number | null;
};

export function CategoryEditor({ entityId }: CategoryEditorProps) {
	const {
		entityId: selectedCategoryId,
		selectedCategory,
		selectedQueryCount,
		isNotFound,
		errorMessage,
		form,
		isSaving,
		handleDelete,
		handleBack,
	} = useCategoryEditor(entityId);

	return (
		<EntityEditorShell
			isNotFound={isNotFound}
			notFoundMessage="This audit category does not exist or may have been deleted."
			backLabel="Back to categories"
			onBack={handleBack}
			errorMessage={errorMessage}
			title={selectedCategoryId === null ? "Create category" : "Edit category"}
			actions={
				<EditorActions
					entityId={selectedCategoryId}
					saveLabel="Save category"
					isSaving={isSaving}
					onDelete={handleDelete}
					deleteTitle="Delete audit category?"
					deleteDescription={
						<>
							This will permanently delete &quot;
							{selectedCategory?.name ?? "this category"}&quot;. It is assigned
							to {selectedQueryCount} {pluralize("query", selectedQueryCount)}.
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
			<EditorSection title="Details">
				<FieldGroup className="grid gap-4">
					<form.Field name="name">
						{(field) => (
							<Field>
								<FieldLabel required>Name</FieldLabel>
								<Input
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="Audit category name"
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<Field>
								<FieldLabel>Description</FieldLabel>
								<Textarea
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									className="min-h-28"
									placeholder="What kind of audit queries belong here"
								/>
							</Field>
						)}
					</form.Field>
				</FieldGroup>
			</EditorSection>

			{selectedCategory ? (
				<EditorSection title="Usage">
					<p className="text-sm text-muted-foreground">
						Assigned to {selectedQueryCount}{" "}
						{pluralize("query", selectedQueryCount)}.
					</p>
				</EditorSection>
			) : null}
		</EntityEditorShell>
	);
}
