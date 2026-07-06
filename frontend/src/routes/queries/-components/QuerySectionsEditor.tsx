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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { EditorSection } from '@/components/workspace/EditorSection'
import { SqlFragmentTextarea } from './SqlFragmentTextarea'
import type { QueryWorkspaceForm } from './use-query-workspace'

type QuerySectionsEditorProps = {
  form: QueryWorkspaceForm
  embedded?: boolean
  onAddSection: () => void
  onRemoveSection: (clientId: string) => void
  onReorderSection: (activeId: string, overId: string) => void
}

export function QuerySectionsEditor({
  form,
  embedded = false,
  onAddSection,
  onRemoveSection,
  onReorderSection,
}: QuerySectionsEditorProps) {
  const sections = useStore(form.store, (state) => state.values.sections)

  const content = (
    <SortableList
      items={sections}
      onReorder={onReorderSection}
      className="flex flex-col gap-4"
      renderItem={(section, index, dragHandle) => {
        const defaultEnabledId = `${section.clientId}-default-enabled`

        return (
          <Card key={section.clientId} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {dragHandle}
                Section {index + 1}
              </CardTitle>
              <CardAction>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveSection(section.clientId)}
                  disabled={sections.length === 1}
                >
                  Remove
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4">
                <form.Field
                  name={`sections[${index}].name`}
                  children={(field) => (
                    <Field>
                      <FieldLabel required>Section name</FieldLabel>
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
                  name={`sections[${index}].defaultEnabled`}
                  children={(field) => (
                    <Field orientation="horizontal">
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
                    <Field className="min-h-0">
                      <FieldLabel required>SQL fragment</FieldLabel>
                      <SqlFragmentTextarea
                        value={field.state.value}
                        onChange={(sqlFragment) =>
                          field.handleChange(sqlFragment)
                        }
                        className="min-h-48 font-mono"
                        placeholder="Enter this section's SQL fragment. Use {{variableName}} for variables."
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        )
      }}
    />
  )

  if (embedded) {
    return content
  }

  return (
    <EditorSection
      title="Query sections"
      action={
        <Button type="button" variant="outline" size="sm" onClick={onAddSection}>
          Add section
        </Button>
      }
    >
      {content}
    </EditorSection>
  )
}
