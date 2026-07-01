import { AuditCategoryEditor } from './AuditCategoryEditor'
import { useAuditCategoryWorkspace } from './use-audit-category-workspace'

type AuditCategoryDetailPageProps = {
  selectedCategoryId: number | null
}

export function AuditCategoryDetailPage({
  selectedCategoryId,
}: AuditCategoryDetailPageProps) {
  const workspace = useAuditCategoryWorkspace(selectedCategoryId)

  return (
    <AuditCategoryEditor
      selectedCategoryId={workspace.selectedCategoryId}
      selectedCategory={workspace.selectedCategory}
      selectedQueryCount={workspace.selectedQueryCount}
      isNotFound={workspace.isNotFound}
      errorMessage={workspace.errorMessage}
      form={workspace.form}
      isSaving={workspace.isSaving}
      onSubmit={workspace.handleSubmit}
      onDelete={workspace.handleDelete}
      onFormChange={workspace.setForm}
    />
  )
}
