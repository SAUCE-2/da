import { useStore } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

import { AuditEditorSection } from '../../-components/AuditEditorSection'
import type { AuditQuery } from '@/lib/audit-api'
import type { PlanWorkspaceForm } from './use-audit-plan-workspace'

type PlanItemsEditorProps = {
  form: PlanWorkspaceForm
  queries: AuditQuery[]
  onAddItem: () => void
  onRemoveItem: (clientId: string) => void
  onMoveItem: (clientId: string, direction: -1 | 1) => void
  onQueryChange: (clientId: string, auditQueryId: number | null) => void
}

export function PlanItemsEditor({
  form,
  queries,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onQueryChange,
}: PlanItemsEditorProps) {
  const items = useStore(form.store, (state) => state.values.items)

  return (
    <AuditEditorSection
      title="Queries in plan"
      description="Add and order the queries this plan runs."
      action={
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
          Add query
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No queries in this plan yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, index) => {
            const selectedQuery = queries.find(
              (query) => query.id === item.auditQueryId,
            )

            return (
              <Card key={item.clientId} size="sm">
                <CardHeader>
                  <CardTitle>Step {index + 1}</CardTitle>
                  <CardAction>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveItem(item.clientId, -1)}
                        disabled={index === 0}
                      >
                        Move up
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveItem(item.clientId, 1)}
                        disabled={index === items.length - 1}
                      >
                        Move down
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.clientId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel required>Query</FieldLabel>
                      <select
                        className="h-8 w-full border border-input bg-transparent px-2.5 text-xs"
                        value={item.auditQueryId ?? ''}
                        onChange={(event) =>
                          onQueryChange(
                            item.clientId,
                            event.target.value
                              ? Number(event.target.value)
                              : null,
                          )
                        }
                      >
                        <option value="">Select query</option>
                        {queries.map((query) => (
                          <option key={query.id} value={query.id}>
                            {query.name} (v{query.versionNumber})
                          </option>
                        ))}
                      </select>
                    </Field>

                    <form.Field
                      name={`items[${index}].enabled`}
                      children={(field) => (
                        <Field orientation="horizontal">
                          <Switch
                            checked={field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked)
                            }
                          />
                          <FieldLabel>Enabled in plan</FieldLabel>
                        </Field>
                      )}
                    />

                    {selectedQuery && selectedQuery.variables.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {selectedQuery.variables.length}{' '}
                        {selectedQuery.variables.length === 1
                          ? 'variable'
                          : 'variables'}{' '}
                        — configure on the Variables tab.
                      </p>
                    ) : null}
                  </FieldGroup>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AuditEditorSection>
  )
}
