import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { AuditCategory, AuditQueryPreview } from '@/lib/audit-api'

import { AuditEditorHeader } from '../../-components/AuditEditorHeader'
import { AuditEditorSection } from '../../-components/AuditEditorSection'
import { QuerySectionsEditor } from './QuerySectionsEditor'
import { SqlPreview } from './SqlPreview'
import type { ClientSection, QueryFormState } from './query-form'

type AuditQueryEditorProps = {
  selectedQueryId: number | null
  selectedQueryName: string | null
  isNotFound: boolean
  errorMessage: string | null
  form: QueryFormState
  categories: AuditCategory[]
  preview: AuditQueryPreview | null
  isDirty: boolean
  isSaving: boolean
  isPreviewLoading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: () => void
  onFormChange: (form: QueryFormState) => void
  onToggleCategory: (categoryId: number) => void
  onAddSection: () => void
  onRemoveSection: (clientId: string) => void
  onMoveSection: (clientId: string, direction: -1 | 1) => void
  onUpdateSection: (
    clientId: string,
    updates: Partial<Omit<ClientSection, 'clientId'>>,
  ) => void
}

function EditorActions({
  selectedQueryId,
  selectedQueryName,
  isSaving,
  onDelete,
}: {
  selectedQueryId: number | null
  selectedQueryName: string | null
  isSaving: boolean
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {selectedQueryId !== null ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isSaving}>
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete audit query?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;
                {selectedQueryName ?? 'this query'}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={onDelete}
                disabled={isSaving}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <Spinner data-icon="inline-start" />
            Saving...
          </>
        ) : (
          'Save query'
        )}
      </Button>
    </div>
  )
}

export function AuditQueryEditor({
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
  onSubmit,
  onDelete,
  onFormChange,
  onToggleCategory,
  onAddSection,
  onRemoveSection,
  onMoveSection,
  onUpdateSection,
}: AuditQueryEditorProps) {
  if (isNotFound) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            This audit query does not exist or may have been deleted.
          </AlertDescription>
        </Alert>
        <Button type="button" size="sm" className="w-fit" asChild>
          <Link to="/audit/queries">Back to queries</Link>
        </Button>
      </div>
    )
  }

  const title = selectedQueryId === null ? 'Create query' : 'Edit query'
  const description =
    'Store metadata and ordered SQL sections. Execution stays out of scope for this phase.'

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      {errorMessage ? (
        <Alert variant="destructive" className="mx-6 mt-3">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <AuditEditorHeader
        title={title}
        description={description}
        actions={
          <EditorActions
            selectedQueryId={selectedQueryId}
            selectedQueryName={selectedQueryName}
            isSaving={isSaving}
            onDelete={onDelete}
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AuditEditorSection title="Details">
          <FieldGroup className="grid gap-4 lg:grid-cols-2">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={form.name}
                onChange={(event) =>
                  onFormChange({ ...form, name: event.target.value })
                }
                placeholder="Audit query name"
              />
            </Field>

            <Field orientation="horizontal">
              <Switch
                id="query-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, active: checked })
                }
              />
              <FieldLabel htmlFor="query-active">Active by default</FieldLabel>
            </Field>

            <Field className="lg:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  onFormChange({ ...form, description: event.target.value })
                }
                className="min-h-20"
                placeholder="What this query checks and when it should be used"
              />
            </Field>
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
                        checked={form.categoryIds.includes(category.id)}
                        onCheckedChange={() => onToggleCategory(category.id)}
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
          sections={form.sections}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          onMoveSection={onMoveSection}
          onUpdateSection={onUpdateSection}
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
            <SqlPreview sql={preview.sql} />
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
