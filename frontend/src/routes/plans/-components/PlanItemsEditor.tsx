import { useStore } from '@tanstack/react-form'

import { SortableList } from '@/components/sortable-list'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { EditorSection } from '@/components/workspace/EditorSection'
import type { Query } from '@/lib/api'
import type { PlanWorkspaceForm } from './use-plan-workspace'

type PlanItemsEditorProps = {
  form: PlanWorkspaceForm
  queries: Query[]
  onAddItem: () => void
  onRemoveItem: (clientId: string) => void
  onReorderItem: (activeId: string, overId: string) => void
  onQueryChange: (clientId: string, queryId: number | null) => void
}

export function PlanItemsEditor({
  form,
  queries,
  onAddItem,
  onRemoveItem,
  onReorderItem,
  onQueryChange,
}: PlanItemsEditorProps) {
  const items = useStore(form.store, (state) => state.values.items)

  return (
    <EditorSection
      title="Queries in plan"
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
        <SortableList
          items={items}
          onReorder={onReorderItem}
          className="flex flex-col gap-4"
          renderItem={(item, index, dragHandle) => {
            const selectedQuery = queries.find(
              (query) => query.id === item.queryId,
            )

            return (
              <Card key={item.clientId} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {dragHandle}
                    Step {index + 1}
                  </CardTitle>
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.clientId)}
                    >
                      Remove
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel required>Query</FieldLabel>
                      <Select
                        value={item.queryId?.toString() ?? ''}
                        onValueChange={(value) =>
                          onQueryChange(
                            item.clientId,
                            value ? Number(value) : null,
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select query" />
                        </SelectTrigger>
                        <SelectContent>
                          {queries.map((query) => (
                            <SelectItem key={query.id} value={String(query.id)}>
                              {query.name} (v{query.versionNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <form.Field
                      name={`items[${index}].enabled`}
                      children={(field) => (
                        <Field orientation="horizontal">
                          <Switch
                            checked={field.state.value}
                            onCheckedChange={(checked) => field.handleChange(checked)}
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
          }}
        />
      )}
    </EditorSection>
  )
}
