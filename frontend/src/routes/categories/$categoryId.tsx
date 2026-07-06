import { createFileRoute } from '@tanstack/react-router'

import { CategoryEditor } from './-components/CategoryEditor'

function EditCategoryPage() {
  const { categoryId } = Route.useParams()
  return <CategoryEditor key={categoryId} />
}

export const Route = createFileRoute('/categories/$categoryId')({
  params: {
    parse: (raw) => ({
      categoryId: Number(raw.categoryId),
    }),
    stringify: ({ categoryId }) => ({
      categoryId: String(categoryId),
    }),
  },
  component: EditCategoryPage,
})
