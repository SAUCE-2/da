import { useStore } from '@tanstack/react-form'

import { VariableValueFields } from '@/components/variable-value-fields'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AuditQuery } from '@/lib/audit-api'

import { AuditEditorSection } from '../../-components/AuditEditorSection'
import type { PlanWorkspaceForm } from './use-audit-plan-workspace'

type PlanVariablesEditorProps = {
  form: PlanWorkspaceForm
  queries: AuditQuery[]
}

export function PlanVariablesEditor({ form, queries }: PlanVariablesEditorProps) {
  const items = useStore(form.store, (state) => state.values.items)

  const itemsWithVariables = items
    .map((item, index) => {
      const selectedQuery = queries.find(
        (query) => query.id === item.auditQueryId,
      )
      if (!selectedQuery || selectedQuery.variables.length === 0) {
        return null
      }
      return { item, index, selectedQuery }
    })
    .filter((entry) => entry !== null)

  return (
    <AuditEditorSection
      title="Variable defaults"
      description="Override query variable defaults for this plan. Variables are derived from queries in the plan — you cannot add new definitions here."
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add queries on the Queries tab first.
        </p>
      ) : itemsWithVariables.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Queries in this plan define no variables.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {itemsWithVariables.map(({ item, index, selectedQuery }) => (
            <Card key={item.clientId} size="sm">
              <CardHeader>
                <CardTitle>
                  Step {index + 1}: {selectedQuery.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariableValueFields
                  variables={selectedQuery.variables}
                  values={item.variableBindings}
                  onChange={(name, value) => {
                    const nextBindings = {
                      ...item.variableBindings,
                      [name]: value,
                    }
                    form.setFieldValue(
                      `items[${index}].variableBindings`,
                      nextBindings,
                    )
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AuditEditorSection>
  )
}
