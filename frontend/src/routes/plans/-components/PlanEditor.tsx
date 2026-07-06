import { EntityEditorShell } from '@/components/workspace/EntityEditorShell'

import { PlanEditorTabs } from './PlanEditorTabs'
import { usePlanWorkspace } from './use-plan-workspace'

export function PlanEditor() {
  const {
    selectedPlanId,
    selectedPlanName,
    isNotFound,
    errorMessage,
    form,
    queries,
    isSaving,
    handleDelete,
    handleBack,
    addItem,
    removeItem,
    reorderItem,
    handleQueryChange,
  } = usePlanWorkspace()

  return (
    <EntityEditorShell
      isNotFound={isNotFound}
      notFoundMessage="This audit plan does not exist or may have been deleted."
      backLabel="Back to plans"
      onBack={handleBack}
      errorMessage={errorMessage}
      title={selectedPlanId === null ? 'Create plan' : 'Edit plan'}
      entityId={selectedPlanId}
      saveLabel="Save plan"
      isSaving={isSaving}
      onDelete={handleDelete}
      deleteTitle="Delete audit plan?"
      deleteDescription={
        <>
          This will permanently delete &quot;
          {selectedPlanName ?? 'this plan'}&quot;.
        </>
      }
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <PlanEditorTabs
        form={form}
        selectedPlanId={selectedPlanId}
        queries={queries}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onReorderItem={reorderItem}
        onQueryChange={handleQueryChange}
      />
    </EntityEditorShell>
  )
}
