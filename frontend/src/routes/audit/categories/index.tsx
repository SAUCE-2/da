import { createFileRoute } from '@tanstack/react-router'

import { AuditCategoryDetailPage } from './-components/AuditCategoryDetailPage'

export const Route = createFileRoute('/audit/categories/')({
  component: () => <AuditCategoryDetailPage selectedCategoryId={null} />,
})
