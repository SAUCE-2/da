import { createFileRoute } from '@tanstack/react-router'

import { AuditCategoryDetailPage } from './-components/AuditCategoryDetailPage'

export const Route = createFileRoute('/audit/categories/$categoryId')({
  params: {
    parse: (raw) => ({
      categoryId: Number(raw.categoryId),
    }),
    stringify: ({ categoryId }) => ({
      categoryId: String(categoryId),
    }),
  },
  component: function AuditCategoryEditPage() {
    const { categoryId } = Route.useParams()

    return <AuditCategoryDetailPage selectedCategoryId={categoryId} />
  },
})
