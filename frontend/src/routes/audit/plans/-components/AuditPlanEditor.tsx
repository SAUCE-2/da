import { Alert, AlertDescription } from '@/components/ui/alert'

import { AuditEditorActions } from '../../-components/AuditEditorActions'
import { AuditEditorHeader } from '../../-components/AuditEditorHeader'
import { AuditEntityNotFound } from '../../-components/AuditEntityNotFound'
import { AuditPlanEditorTabs } from './AuditPlanEditorTabs'
import { useAuditPlanWorkspace } from './use-audit-plan-workspace'

export function AuditPlanEditor() {
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
    moveItem,
    handleQueryChange,
  } = useAuditPlanWorkspace()

  if (isNotFound) {
    return (
      <AuditEntityNotFound
        message="This audit plan does not exist or may have been deleted."
        backLabel="Back to plans"
        onBack={handleBack}
      />
    )
  }

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

      <AuditEditorHeader
        title={selectedPlanId === null ? 'Create plan' : 'Edit plan'}
        description="Build a run plan: ordered queries with variable bindings for repeatable audits."
        actions={
          <AuditEditorActions
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
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AuditPlanEditorTabs
          form={form}
          selectedPlanId={selectedPlanId}
          queries={queries}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onQueryChange={handleQueryChange}
        />
      </div>
    </form>
  )
}
