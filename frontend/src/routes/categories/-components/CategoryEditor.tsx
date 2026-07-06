import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { pluralize } from '@/lib/utils'

import { EntityEditorShell } from '@/components/workspace/EntityEditorShell'
import { EditorSection } from '@/components/workspace/EditorSection'
import { useCategoryWorkspace } from './use-category-workspace'

export function CategoryEditor() {
  const {
    selectedCategoryId,
    selectedCategory,
    selectedQueryCount,
    isNotFound,
    errorMessage,
    form,
    isSaving,
    handleDelete,
    handleBack,
  } = useCategoryWorkspace()

  return (
    <EntityEditorShell
      isNotFound={isNotFound}
      notFoundMessage="This audit category does not exist or may have been deleted."
      backLabel="Back to categories"
      onBack={handleBack}
      errorMessage={errorMessage}
      title={selectedCategoryId === null ? 'Create category' : 'Edit category'}
      entityId={selectedCategoryId}
      saveLabel="Save category"
      isSaving={isSaving}
      onDelete={handleDelete}
      deleteTitle="Delete audit category?"
      deleteDescription={
        <>
          This will permanently delete &quot;
          {selectedCategory?.name ?? 'this category'}&quot;. It is assigned to{' '}
          {selectedQueryCount} {pluralize(selectedQueryCount, 'query')}.
        </>
      }
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <EditorSection title="Details">
        <FieldGroup className="grid gap-4">
          <form.Field
            name="name"
            children={(field) => (
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
          />

          <form.Field
            name="description"
            children={(field) => (
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
          />
        </FieldGroup>
      </EditorSection>

      {selectedCategory ? (
        <EditorSection title="Usage">
          <p className="text-sm text-muted-foreground">
            Assigned to {selectedQueryCount}{' '}
            {pluralize(selectedQueryCount, 'query')}.
          </p>
        </EditorSection>
      ) : null}
    </EntityEditorShell>
  )
}
