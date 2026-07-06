import { useEffect, useState } from 'react'

import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AuditQuery } from '@/lib/audit-api'

import { AuditEditorSection } from '../../-components/AuditEditorSection'
import type { PlanEditorTab } from './plan-editor-tab'
import { PlanItemsEditor } from './PlanItemsEditor'
import { PlanVariablesEditor } from './PlanVariablesEditor'
import type { PlanWorkspaceForm } from './use-audit-plan-workspace'

type AuditPlanEditorTabsProps = {
  form: PlanWorkspaceForm
  selectedPlanId: number | null
  queries: AuditQuery[]
  onAddItem: () => void
  onRemoveItem: (clientId: string) => void
  onMoveItem: (clientId: string, direction: -1 | 1) => void
  onQueryChange: (clientId: string, auditQueryId: number | null) => void
}

export function AuditPlanEditorTabs({
  form,
  selectedPlanId,
  queries,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onQueryChange,
}: AuditPlanEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<PlanEditorTab>('details')

  useEffect(() => {
    setActiveTab('details')
  }, [selectedPlanId])

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
                    placeholder="Plan name"
                  />
                </Field>
              )}
            />

            <form.Field
              name="active"
              children={(field) => (
                <Field orientation="horizontal">
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <FieldLabel>Active</FieldLabel>
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
                    className="min-h-20"
                    placeholder="What this plan checks and when it should be used"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </AuditEditorSection>
      </TabsContent>

      <TabsContent value="queries" className="mt-0 min-h-0 flex-1">
        <PlanItemsEditor
          form={form}
          queries={queries}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onMoveItem={onMoveItem}
          onQueryChange={onQueryChange}
        />
      </TabsContent>

      <TabsContent value="variables" className="mt-0 min-h-0 flex-1">
        <PlanVariablesEditor form={form} queries={queries} />
      </TabsContent>
    </Tabs>
  )
}
