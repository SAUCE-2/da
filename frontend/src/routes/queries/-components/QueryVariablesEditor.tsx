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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { EditorSection } from '@/components/workspace/EditorSection'
import type { QueryWorkspaceForm } from './use-query-workspace'

type QueryVariablesEditorProps = {
  form: QueryWorkspaceForm
  embedded?: boolean
  onAddVariable: () => void
  onRemoveVariable: (clientId: string) => void
}

export function QueryVariablesEditor({
  form,
  embedded = false,
  onAddVariable,
  onRemoveVariable,
}: QueryVariablesEditorProps) {
  const variables = useStore(form.store, (state) => state.values.variables)

  const content =
    variables.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No variables yet. Add one when a section needs a runtime value such as a
        status filter or date range.
      </p>
    ) : (
      <div className="flex flex-col gap-4">
        {variables.map((variable, index) => {
            const requiredId = `${variable.clientId}-required`

            return (
              <Card key={variable.clientId} size="sm">
                <CardHeader>
                  <CardTitle>
                    {variable.name.trim() || 'New variable'}
                  </CardTitle>
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveVariable(variable.clientId)}
                    >
                      Remove
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="grid gap-4 lg:grid-cols-2">
                    <form.Field
                      name={`variables[${index}].name`}
                      children={(field) => (
                        <Field>
                          <FieldLabel required>Name</FieldLabel>
                          <Input
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            placeholder="status"
                          />
                          <FieldDescription>
                            Use in SQL as {`{{${field.state.value || 'name'}}}`}
                          </FieldDescription>
                        </Field>
                      )}
                    />

                    <form.Field
                      name={`variables[${index}].type`}
                      children={(field) => (
                        <Field>
                          <FieldLabel required>Type</FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(
                                value as 'STRING' | 'NUMBER' | 'DATE',
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STRING">String</SelectItem>
                              <SelectItem value="NUMBER">Number</SelectItem>
                              <SelectItem value="DATE">Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    <form.Field
                      name={`variables[${index}].defaultValue`}
                      children={(field) => (
                        <Field>
                          <FieldLabel>Default value</FieldLabel>
                          <Input
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            placeholder="Optional default"
                          />
                        </Field>
                      )}
                    />

                    <form.Field
                      name={`variables[${index}].required`}
                      children={(field) => (
                        <Field orientation="horizontal" className="lg:col-span-2">
                          <Switch
                            id={requiredId}
                            checked={field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked)
                            }
                          />
                          <FieldLabel htmlFor={requiredId}>
                            Required at run time
                          </FieldLabel>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </CardContent>
              </Card>
            )
          })}
      </div>
    )

  if (embedded) {
    return content
  }

  return (
    <EditorSection
      title="Query variables"
      action={
        <Button type="button" variant="outline" size="sm" onClick={onAddVariable}>
          Add variable
        </Button>
      }
    >
      {content}
    </EditorSection>
  )
}
