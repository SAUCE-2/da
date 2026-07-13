import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Query } from '@/lib/api'

import { EditorSection } from '@/components/workspace/EditorSection'
import { EntityMetadataFields } from '@/components/workspace/EntityMetadataFields'
import type { PlanEditorTab } from './plan-editor-tab'
import { PlanItemsEditor } from './PlanItemsEditor'
import { PlanVariablesEditor } from './PlanVariablesEditor'
import type { PlanWorkspaceForm } from './use-plan-workspace'

type PlanEditorTabsProps = {
  form: PlanWorkspaceForm
  selectedPlanId: number | null
  queries: Query[]
  onAddItem: () => void
  onRemoveItem: (clientId: string) => void
  onReorderItem: (fromIndex: number, toIndex: number) => void
  onQueryChange: (clientId: string, queryId: number | null) => void
}

export function PlanEditorTabs({
  form,
  selectedPlanId,
  queries,
  onAddItem,
  onRemoveItem,
  onReorderItem,
  onQueryChange,
}: PlanEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<PlanEditorTab>('details')

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
        <EditorSection title="Basic information">
          <EntityMetadataFields
            form={form}
            activeLabel="Active"
            namePlaceholder="Plan name"
            descriptionPlaceholder="What this plan checks and when it should be used"
          />
        </EditorSection>
      </TabsContent>

      <TabsContent value="queries" className="mt-0 min-h-0 flex-1">
        <PlanItemsEditor
          form={form}
          queries={queries}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onReorderItem={onReorderItem}
          onQueryChange={onQueryChange}
        />
      </TabsContent>

      <TabsContent value="variables" className="mt-0 min-h-0 flex-1">
        <PlanVariablesEditor
          form={form}
          queries={queries}
        />
      </TabsContent>
    </Tabs>
  )
}
