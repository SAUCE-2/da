import { useStore } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { AuditEditorSection } from '../../-components/AuditEditorSection'
import { SqlFragmentTextarea } from './SqlFragmentTextarea'
import type { QueryWorkspaceForm } from './use-audit-query-workspace'

type QuerySectionsEditorProps = {
  form: QueryWorkspaceForm
  onAddSection: () => void
  onRemoveSection: (clientId: string) => void
  onMoveSection: (clientId: string, direction: -1 | 1) => void
}

export function QuerySectionsEditor({
  form,
  onAddSection,
  onRemoveSection,
  onMoveSection,
}: QuerySectionsEditorProps) {
  const sections = useStore(form.store, (state) => state.values.sections)

  return (
    <AuditEditorSection
      title="Query sections"
      description="Rendered by the backend in sort order when enabled by default."
      action={
        <Button type="button" variant="outline" size="sm" onClick={onAddSection}>
          Add section
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {sections.map((section, index) => {
          const defaultEnabledId = `${section.clientId}-default-enabled`

          return (
            <Card key={section.clientId} size="sm">
              <CardHeader>
                <CardTitle>Section {index + 1}</CardTitle>
                <CardDescription>Sort order {section.sortOrder}</CardDescription>
                <CardAction>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveSection(section.clientId, -1)}
                      disabled={index === 0}
                    >
                      Move up
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveSection(section.clientId, 1)}
                      disabled={index === sections.length - 1}
                    >
                      Move down
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSection(section.clientId)}
                      disabled={sections.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-4 lg:grid-cols-[1fr_120px]">
                  <form.Field
                    name={`sections[${index}].name`}
                    children={(field) => (
                      <Field>
                        <FieldLabel>Section name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          onBlur={field.handleBlur}
                          placeholder="Section name"
                        />
                      </Field>
                    )}
                  />

                  <form.Field
                    name={`sections[${index}].sortOrder`}
                    children={(field) => (
                      <Field>
                        <FieldLabel>Sort order</FieldLabel>
                        <Input
                          type="number"
                          value={field.state.value}
                          onChange={(event) =>
                            field.handleChange(Number(event.target.value))
                          }
                          onBlur={field.handleBlur}
                        />
                      </Field>
                    )}
                  />

                  <form.Field
                    name={`sections[${index}].defaultEnabled`}
                    children={(field) => (
                      <Field orientation="horizontal" className="lg:col-span-2">
                        <Switch
                          id={defaultEnabledId}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                        />
                        <FieldLabel htmlFor={defaultEnabledId}>
                          Enabled in default preview
                        </FieldLabel>
                      </Field>
                    )}
                  />

                  <form.Field
                    name={`sections[${index}].sqlFragment`}
                    children={(field) => (
                      <Field className="min-h-0 lg:col-span-2">
                        <FieldLabel>SQL fragment</FieldLabel>
                        <SqlFragmentTextarea
                          value={field.state.value}
                          onChange={(sqlFragment) =>
                            field.handleChange(sqlFragment)
                          }
                          className="min-h-48 font-mono"
                          placeholder="Enter this section's SQL fragment"
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </AuditEditorSection>
  )
}
