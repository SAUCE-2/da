import { useStore } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

import { FormattedSqlDisplay } from '@/components/formatted-sql-display'
import { VariableValueFields } from '@/components/variable-value-fields'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  AuditCategory,
  AuditQueryPreview,
} from '@/lib/audit-api'

import { AuditEditorSection } from '../../-components/AuditEditorSection'
import { QuerySectionsEditor } from './QuerySectionsEditor'
import { QueryVariablesEditor } from './QueryVariablesEditor'
import type { QueryEditorTab } from './query-editor-tab'
import type { ClientVariable } from './query-form'
import type { QueryWorkspaceForm } from './use-audit-query-workspace'

type AuditQueryEditorTabsProps = {
  form: QueryWorkspaceForm
  selectedQueryId: number | null
  categories: AuditCategory[]
  formVariables: ClientVariable[]
  preview: AuditQueryPreview | null
  previewVariableValues: Record<string, string>
  isDirty: boolean
  isPreviewLoading: boolean
  toggleCategory: (categoryId: number) => void
  onAddSection: () => void
  onRemoveSection: (clientId: string) => void
  onMoveSection: (clientId: string, direction: -1 | 1) => void
  onAddVariable: () => void
  onRemoveVariable: (clientId: string) => void
  updatePreviewVariable: (name: string, value: string) => void
}

export function AuditQueryEditorTabs({
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
  onMoveSection,
  onAddVariable,
  onRemoveVariable,
  updatePreviewVariable,
}: AuditQueryEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<QueryEditorTab>('details')
  const categoryIds = useStore(form.store, (state) => state.values.categoryIds)
  const namedVariables = formVariables.filter((variable) => variable.name.trim())
  const hasNamedVariables = namedVariables.length > 0
  const canPreview = selectedQueryId !== null

  useEffect(() => {
    setActiveTab('details')
  }, [selectedQueryId])

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
        <AuditEditorSection title="Basic information">
          <FieldGroup className="grid gap-4 lg:grid-cols-2">
            <form.Field
              name="name"
              children={(field) => (
                <Field>
                  <FieldLabel required>Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Query name"
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

        <AuditEditorSection
          title="Categories"
          description="Assign this query to one or more audit categories."
        >
          {categories.length === 0 ? (
            <Empty>
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
      </TabsContent>

      <TabsContent value="query" className="mt-0 min-h-0 flex-1">
        <AuditEditorSection
          title="Query sections"
          description="SQL sections are rendered in sort order when enabled by default."
          action={
            <Button type="button" variant="outline" size="sm" onClick={onAddSection}>
              Add section
            </Button>
          }
        >
          <QuerySectionsEditor
            form={form}
            embedded
            onAddSection={onAddSection}
            onRemoveSection={onRemoveSection}
            onMoveSection={onMoveSection}
          />
        </AuditEditorSection>

        <AuditEditorSection
          title="SQL preview"
          description="Rendered by the backend from default-enabled sections with variable substitution."
        >
          {!canPreview ? (
            <>
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Preview unavailable</EmptyTitle>
                  <EmptyDescription>
                    Save the query before requesting a backend-rendered preview.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
              {hasNamedVariables ? (
                <p className="text-sm text-muted-foreground">
                  Save the query to preview SQL. Variable definitions on the
                  Variables tab apply after save.
                </p>
              ) : null}
            </>
          ) : (
            <>
              {hasNamedVariables ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">Preview values</p>
                    <p className="text-xs text-muted-foreground">
                      Override defaults for this preview only — not saved with
                      the query.
                    </p>
                  </div>
                  <VariableValueFields
                    variables={formVariables}
                    values={previewVariableValues}
                    onChange={updatePreviewVariable}
                    keyFor={(variable) => variable.name}
                    layout="grid"
                    className="grid gap-4 lg:grid-cols-2"
                  />
                </div>
              ) : null}

              {isPreviewLoading ? (
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
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Preview unavailable</EmptyTitle>
                    <EmptyDescription>
                      The backend did not return a preview for this query.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </>
          )}
          {isDirty && canPreview ? (
            <p className="text-sm text-muted-foreground">
              Unsaved section or variable definition edits are not reflected in
              the preview yet.
            </p>
          ) : null}
        </AuditEditorSection>
      </TabsContent>

      <TabsContent value="variables" className="mt-0 min-h-0 flex-1">
        <AuditEditorSection
          title="Query variables"
          description="Define variables that can be substituted into SQL fragments at run time."
          action={
            <Button type="button" variant="outline" size="sm" onClick={onAddVariable}>
              Add variable
            </Button>
          }
        >
          <QueryVariablesEditor
            form={form}
            embedded
            onAddVariable={onAddVariable}
            onRemoveVariable={onRemoveVariable}
          />
        </AuditEditorSection>
      </TabsContent>
    </Tabs>
  )
}
