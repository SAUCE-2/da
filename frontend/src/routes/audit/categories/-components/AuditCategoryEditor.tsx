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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { AuditCategory } from '@/lib/audit-api'

import { AuditEditorHeader } from '../../-components/AuditEditorHeader'
import { AuditEditorSection } from '../../-components/AuditEditorSection'
import type { CategoryFormState } from './category-form'

type AuditCategoryEditorProps = {
  selectedCategoryId: number | null
  selectedCategory: AuditCategory | null
  selectedQueryCount: number
  isNotFound: boolean
  errorMessage: string | null
  form: CategoryFormState
  isSaving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: () => void
  onFormChange: (form: CategoryFormState) => void
}

export function AuditCategoryEditor({
  selectedCategoryId,
  selectedCategory,
  selectedQueryCount,
  isNotFound,
  errorMessage,
  form,
  isSaving,
  onSubmit,
  onDelete,
  onFormChange,
}: AuditCategoryEditorProps) {
  if (isNotFound) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            This audit category does not exist or may have been deleted.
          </AlertDescription>
        </Alert>
        <Button type="button" size="sm" className="w-fit" asChild>
          <Link to="/audit/categories">Back to categories</Link>
        </Button>
      </div>
    )
  }

  const title =
    selectedCategoryId === null ? 'Create category' : 'Edit category'
  const description =
    'Categories are metadata only and can be assigned to audit queries from the query editor.'

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
          <div className="flex flex-wrap gap-2">
            {selectedCategoryId !== null ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSaving}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete audit category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;
                      {selectedCategory?.name ?? 'this category'}&quot;. It is
                      assigned to {selectedQueryCount}{' '}
                      {selectedQueryCount === 1 ? 'query' : 'queries'}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSaving}>
                      Cancel
                    </AlertDialogCancel>
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
                'Save category'
              )}
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AuditEditorSection title="Details">
          <FieldGroup className="grid gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={form.name}
                onChange={(event) =>
                  onFormChange({ ...form, name: event.target.value })
                }
                placeholder="Audit category name"
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  onFormChange({ ...form, description: event.target.value })
                }
                className="min-h-28"
                placeholder="What kind of audit queries belong here"
              />
            </Field>
          </FieldGroup>
        </AuditEditorSection>

        {selectedCategory ? (
          <>
            <Separator />
            <AuditEditorSection title="Usage">
              <p className="text-sm text-muted-foreground">
                Assigned to {selectedQueryCount}{' '}
                {selectedQueryCount === 1 ? 'query' : 'queries'}.
              </p>
            </AuditEditorSection>
          </>
        ) : null}
      </div>
    </form>
  )
}
