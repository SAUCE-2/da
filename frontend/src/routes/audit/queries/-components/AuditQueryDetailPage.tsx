import { AuditQueryEditor } from './AuditQueryEditor'
import { useAuditQueryWorkspace } from './use-audit-query-workspace'

type AuditQueryDetailPageProps = {
  selectedQueryId: number | null
}

export function AuditQueryDetailPage({
  selectedQueryId,
}: AuditQueryDetailPageProps) {
  const workspace = useAuditQueryWorkspace(selectedQueryId)

  return (
    <AuditQueryEditor
      selectedQueryId={workspace.selectedQueryId}
      selectedQueryName={workspace.selectedQueryName}
      isNotFound={workspace.isNotFound}
      errorMessage={workspace.errorMessage}
      form={workspace.form}
      categories={workspace.categories}
      preview={workspace.preview}
      isDirty={workspace.isDirty}
      isSaving={workspace.isSaving}
      isPreviewLoading={workspace.isPreviewLoading}
      onSubmit={workspace.handleSubmit}
      onDelete={workspace.handleDelete}
      onFormChange={workspace.markFormChanged}
      onToggleCategory={workspace.toggleCategory}
      onAddSection={workspace.addSection}
      onRemoveSection={workspace.removeSection}
      onMoveSection={workspace.moveSection}
      onUpdateSection={workspace.updateSection}
    />
  )
}
