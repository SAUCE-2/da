import { useStore } from '@tanstack/react-form'

import { Badge } from '@/components/ui/badge'
import { EditorActions } from '@/components/workspace/EditorActions'
import { EntityEditorShell } from '@/components/workspace/EntityEditorShell'

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
    reorderSection,
    addVariable,
    removeVariable,
    updatePreviewVariable,
  } = useQueryWorkspace()

  const formVariables = useStore(form.store, (state) => state.values.variables)

  return (
    <EntityEditorShell
      isNotFound={isNotFound}
      notFoundMessage="This audit query does not exist or may have been deleted."
      backLabel="Back to queries"
      onBack={handleBack}
      errorMessage={errorMessage}
      title={selectedQueryId === null ? 'Create query' : 'Edit query'}
      headerActions={
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
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
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
        onReorderSection={reorderSection}
        onAddVariable={addVariable}
        onRemoveVariable={removeVariable}
        updatePreviewVariable={updatePreviewVariable}
      />
    </EntityEditorShell>
  )
}
