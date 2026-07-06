import { createFileRoute } from '@tanstack/react-router'

import { CategoryEditor } from './-components/CategoryEditor'

export const Route = createFileRoute('/categories/$categoryId')({
  params: {
    parse: (raw) => ({
      categoryId: Number(raw.categoryId),
    }),
    stringify: ({ categoryId }) => ({
      categoryId: String(categoryId),
    }),
  },
  component: CategoryEditor,
})
