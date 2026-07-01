import { createFileRoute } from '@tanstack/react-router'

import { AuditCategoryEditor } from './-components/AuditCategoryEditor'

export const Route = createFileRoute('/audit/categories/$categoryId')({
  params: {
    parse: (raw) => ({
      categoryId: Number(raw.categoryId),
    }),
    stringify: ({ categoryId }) => ({
      categoryId: String(categoryId),
    }),
  },
  component: AuditCategoryEditor,
})
