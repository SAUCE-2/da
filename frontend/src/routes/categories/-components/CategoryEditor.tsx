import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { pluralize } from '@/lib/utils'

import { EditorActions } from '@/components/workspace/EditorActions'
import { EditorHeader } from '@/components/workspace/EditorHeader'
import { EditorSection } from '@/components/workspace/EditorSection'
import { EntityNotFound } from '@/components/workspace/EntityNotFound'
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

  if (isNotFound) {
    return (
      <EntityNotFound
        message="This audit category does not exist or may have been deleted."
        backLabel="Back to categories"
        onBack={handleBack}
      />
    )
  }

  const title =
    selectedCategoryId === null ? 'Create category' : 'Edit category'
  const description =
    'Organize queries for browsing and plan building. Assign categories from the query editor.'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {errorMessage ? (
        <div className="border-b p-3">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <EditorHeader
        title={title}
        description={description}
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
                {selectedCategory?.name ?? 'this category'}&quot;. It is assigned
                to {selectedQueryCount}{' '}
                {pluralize(selectedQueryCount, 'query')}.
              </>
            }
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
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
      </div>
    </form>
  )
}
