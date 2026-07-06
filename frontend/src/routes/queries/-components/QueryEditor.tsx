import { useStore } from '@tanstack/react-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

import { EditorActions } from '@/components/workspace/EditorActions'
import { EditorHeader } from '@/components/workspace/EditorHeader'
import { EntityNotFound } from '@/components/workspace/EntityNotFound'
import { QueryEditorTabs } from './QueryEditorTabs'
import { useQueryWorkspace } from './use-query-workspace'

export function QueryEditor() {
  const {
    selectedQueryId,
    selectedQuery,
    selectedQueryName,
    isNotFound,
    errorMessage,
    form,
    categories,
    preview,
    previewVariableValues,
    isDirty,
    isSaving,
    isPreviewLoading,
    handleDelete,
    handleBack,
    toggleCategory,
    addSection,
    removeSection,
    moveSection,
    addVariable,
    removeVariable,
    updatePreviewVariable,
  } = useQueryWorkspace()

  const formVariables = useStore(form.store, (state) => state.values.variables)

  if (isNotFound) {
    return (
      <EntityNotFound
        message="This audit query does not exist or may have been deleted."
        backLabel="Back to queries"
        onBack={handleBack}
      />
    )
  }

  const title = selectedQueryId === null ? 'Create query' : 'Edit query'
  const description =
    'Define a reusable SQL audit query with variables and ordered sections. Each save creates a new immutable version.'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {errorMessage ? (
        <div className="border-b p-3">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <EditorHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {selectedQuery ? (
              <Badge variant="secondary">v{selectedQuery.versionNumber}</Badge>
            ) : null}
            <EditorActions
              entityId={selectedQueryId}
              saveLabel="Save query"
              isSaving={isSaving}
              onDelete={handleDelete}
              deleteTitle="Delete audit query?"
              deleteDescription={
                <>
                  This will permanently delete &quot;
                  {selectedQueryName ?? 'this query'}&quot;.
                </>
              }
            />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <QueryEditorTabs
          form={form}
          selectedQueryId={selectedQueryId}
          categories={categories}
          formVariables={formVariables}
          preview={preview}
          previewVariableValues={previewVariableValues}
          isDirty={isDirty}
          isPreviewLoading={isPreviewLoading}
          toggleCategory={toggleCategory}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onMoveSection={moveSection}
          onAddVariable={addVariable}
          onRemoveVariable={removeVariable}
          updatePreviewVariable={updatePreviewVariable}
        />
      </div>
    </form>
  )
}
