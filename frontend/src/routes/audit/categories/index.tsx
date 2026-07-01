import { createFileRoute } from '@tanstack/react-router'

import { AuditCategoryEditor } from './-components/AuditCategoryEditor'

export const Route = createFileRoute('/audit/categories/')({
  component: AuditCategoryEditor,
})
