import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Category, QueryPreview } from '@/lib/api'

import type { QueryEditorTab } from './query-editor-tab'
import { QueryDetailsTab } from './QueryDetailsTab'
import { QuerySqlTab } from './QuerySqlTab'
import { QueryVariablesTab } from './QueryVariablesTab'
import type { ClientVariable } from './query-form'
import type { QueryWorkspaceForm } from './use-query-workspace'

type QueryEditorTabsProps = {
  form: QueryWorkspaceForm
  selectedQueryId: number | null
  categories: Category[]
  formVariables: ClientVariable[]
  preview: QueryPreview | null
  previewVariableValues: Record<string, string>
  isDirty: boolean
  isPreviewLoading: boolean
  toggleCategory: (categoryId: number) => void
  onAddSection: () => void
  onRemoveSection: (clientId: string) => void
  onReorderSection: (fromIndex: number, toIndex: number) => void
  onAddVariable: () => void
  onRemoveVariable: (clientId: string) => void
  updatePreviewVariable: (name: string, value: string) => void
}

export function QueryEditorTabs({
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
  onReorderSection,
  onAddVariable,
  onRemoveVariable,
  updatePreviewVariable,
}: QueryEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<QueryEditorTab>('details')

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
          selectedQueryId={selectedQueryId}
          formVariables={formVariables}
          preview={preview}
          previewVariableValues={previewVariableValues}
          isDirty={isDirty}
          isPreviewLoading={isPreviewLoading}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          onReorderSection={onReorderSection}
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
  )
}
