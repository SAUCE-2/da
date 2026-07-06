import { createFileRoute } from '@tanstack/react-router'

import { PlanEditor } from './-components/PlanEditor'

export const Route = createFileRoute('/plans/$planId')({
  component: PlanEditor,
})
