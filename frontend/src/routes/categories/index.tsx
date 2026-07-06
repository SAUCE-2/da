import { createFileRoute } from '@tanstack/react-router'

import { CategoryEditor } from './-components/CategoryEditor'

export const Route = createFileRoute('/categories/')({
  component: CategoryEditor,
})
