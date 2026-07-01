import { useStore } from '@tanstack/react-form'

import { FormattedSqlDisplay } from '@/components/formatted-sql-display'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { AuditEditorActions } from '../../-components/AuditEditorActions'
import { AuditEditorHeader } from '../../-components/AuditEditorHeader'
import { AuditEditorSection } from '../../-components/AuditEditorSection'
import { AuditEntityNotFound } from '../../-components/AuditEntityNotFound'
import { QuerySectionsEditor } from './QuerySectionsEditor'
import { useAuditQueryWorkspace } from './use-audit-query-workspace'

export function AuditQueryEditor() {
  const {
    selectedQueryId,
    selectedQueryName,
    isNotFound,
    errorMessage,
    form,
    categories,
    preview,
    isDirty,
    isSaving,
    isPreviewLoading,
    handleDelete,
    handleBack,
    toggleCategory,
    addSection,
    removeSection,
    moveSection,
  } = useAuditQueryWorkspace()

  const categoryIds = useStore(form.store, (state) => state.values.categoryIds)

  if (isNotFound) {
    return (
      <AuditEntityNotFound
        message="This audit query does not exist or may have been deleted."
        backLabel="Back to queries"
        onBack={handleBack}
      />
    )
  }

  const title = selectedQueryId === null ? 'Create query' : 'Edit query'
  const description =
    'Store metadata and ordered SQL sections. Execution stays out of scope for this phase.'

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
            entityId={selectedQueryId}
            saveLabel="Save query"
            isSaving={isSaving}
            onDelete={handleDelete}
            deleteTitle="Delete audit query?"
            deleteDescription={
              <>
                This will permanently delete &quot;
                {selectedQueryName ?? 'this query'}&quot;.
              </>
            }
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AuditEditorSection title="Details">
          <FieldGroup className="grid gap-4 lg:grid-cols-2">
            <form.Field
              name="name"
              children={(field) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Audit query name"
                  />
                </Field>
              )}
            />

            <form.Field
              name="active"
              children={(field) => (
                <Field orientation="horizontal">
                  <Switch
                    id="query-active"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <FieldLabel htmlFor="query-active">Active by default</FieldLabel>
                </Field>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <Field className="lg:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className="min-h-20"
                    placeholder="What this query checks and when it should be used"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </AuditEditorSection>

        <Separator />

        <AuditEditorSection
          title="Categories"
          description="Assign this query to one or more audit categories."
        >
          {categories.length === 0 ? (
            <Empty className="border-0 p-4">
              <EmptyHeader>
                <EmptyTitle>No categories available</EmptyTitle>
                <EmptyDescription>
                  Create audit categories before assigning them to queries.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <FieldSet>
              <FieldLegend variant="label" className="sr-only">
                Audit categories
              </FieldLegend>
              <FieldGroup className="gap-3">
                {categories.map((category) => {
                  const categoryId = `query-category-${category.id}`

                  return (
                    <Field key={category.id} orientation="horizontal">
                      <Checkbox
                        id={categoryId}
                        checked={categoryIds.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={categoryId}>
                          {category.name}
                        </FieldLabel>
                        {category.description ? (
                          <FieldDescription>
                            {category.description}
                          </FieldDescription>
                        ) : null}
                      </FieldContent>
                    </Field>
                  )
                })}
              </FieldGroup>
            </FieldSet>
          )}
        </AuditEditorSection>

        <Separator />

        <QuerySectionsEditor
          form={form}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onMoveSection={moveSection}
        />

        <Separator />

        <AuditEditorSection
          title="SQL preview"
          description="Fetched from the backend after save. Concatenates default-enabled sections without executing."
        >
          {selectedQueryId === null ? (
            <Empty className="border-0 p-4">
              <EmptyHeader>
                <EmptyTitle>Preview unavailable</EmptyTitle>
                <EmptyDescription>
                  Save the query before requesting a backend-rendered preview.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : isPreviewLoading ? (
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
            <Empty className="border-0 p-4">
              <EmptyHeader>
                <EmptyTitle>Preview unavailable</EmptyTitle>
                <EmptyDescription>
                  The backend did not return a preview for this query.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {isDirty && selectedQueryId !== null ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Unsaved edits are not reflected in the preview yet.
            </p>
          ) : null}
        </AuditEditorSection>
      </div>
    </form>
  )
}
