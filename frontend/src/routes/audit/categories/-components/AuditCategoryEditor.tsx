import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { pluralize } from '@/lib/utils'

import { AuditEditorActions } from '../../-components/AuditEditorActions'
import { AuditEditorHeader } from '../../-components/AuditEditorHeader'
import { AuditEditorSection } from '../../-components/AuditEditorSection'
import { AuditEntityNotFound } from '../../-components/AuditEntityNotFound'
import { useAuditCategoryWorkspace } from './use-audit-category-workspace'

export function AuditCategoryEditor() {
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
  } = useAuditCategoryWorkspace()

  if (isNotFound) {
    return (
      <AuditEntityNotFound
        message="This audit category does not exist or may have been deleted."
        backLabel="Back to categories"
        onBack={handleBack}
      />
    )
  }

  const title =
    selectedCategoryId === null ? 'Create category' : 'Edit category'
  const description =
    'Categories are metadata only and can be assigned to audit queries from the query editor.'

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
        <Alert variant="destructive" className="mx-6 mt-3">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <AuditEditorHeader
        title={title}
        description={description}
        actions={
          <AuditEditorActions
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
        <AuditEditorSection title="Details">
          <FieldGroup className="grid gap-4">
            <form.Field
              name="name"
              children={(field) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
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
        </AuditEditorSection>

        {selectedCategory ? (
          <>
            <Separator />
            <AuditEditorSection title="Usage">
              <p className="text-sm text-muted-foreground">
                Assigned to {selectedQueryCount}{' '}
                {pluralize(selectedQueryCount, 'query')}.
              </p>
            </AuditEditorSection>
          </>
        ) : null}
      </div>
    </form>
  )
}
