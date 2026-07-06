import { Button } from '@/components/ui/button'

import { EditorSection } from '@/components/workspace/EditorSection'
import { QueryVariablesEditor } from './QueryVariablesEditor'
import type { QueryWorkspaceForm } from './use-query-workspace'

type QueryVariablesTabProps = {
  form: QueryWorkspaceForm
  onAddVariable: () => void
  onRemoveVariable: (clientId: string) => void
}

export function QueryVariablesTab({
  form,
  onAddVariable,
  onRemoveVariable,
}: QueryVariablesTabProps) {
  return (
    <EditorSection
      title="Query variables"
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
    </EditorSection>
  )
}
