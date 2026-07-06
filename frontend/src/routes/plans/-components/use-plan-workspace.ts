import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { planRequestSchema, formatZodError } from '@/lib/api'
import { OPTIMISTIC_ID } from '@/lib/queries/mutations'
import { queriesListOptions } from '@/lib/queries/queries'
import {
  usePersistPlan,
  useRemovePlan,
} from '@/lib/queries/plan-mutations'
import { plansListOptions } from '@/lib/queries/plans'

import {
  createBlankPlanForm,
  createBlankPlanItem,
  reindexPlanItems,
  seedVariableBindings,
  toPlanRequest,
  toPlanFormState,
} from './plan-form'
import { usePlanWorkspaceSelection } from './plan-workspace-context'

export function usePlanWorkspace() {
  const { selectedPlanId, selectPlan } = usePlanWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const persistPlan = usePersistPlan()
  const removePlan = useRemovePlan()

  const { data: plans = [] } = useQuery(plansListOptions())
  const { data: queries = [] } = useQuery(queriesListOptions())

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? null
  const isNotFound =
    selectedPlanId !== null &&
    selectedPlanId !== OPTIMISTIC_ID &&
    selectedPlan === null

  const form = useForm({
    defaultValues: createBlankPlanForm(),
    validators: {
      onSubmit: ({ value }) => {
        const result = planRequestSchema.safeParse(toPlanRequest(value))
        if (!result.success) {
          return formatZodError(result.error)
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const request = planRequestSchema.parse(toPlanRequest(value))
      setErrorMessage(null)

      const wasCreate = selectedPlanId === null
      const savingId = selectedPlanId

      if (wasCreate) {
        selectPlan(OPTIMISTIC_ID)
      }

      try {
        const saved = await persistPlan.mutateAsync({ id: savingId, request })
        if (wasCreate) {
          selectPlan(saved.id)
        }
        form.reset(toPlanFormState(saved))
      } catch {
        if (wasCreate) {
          selectPlan(null)
        }
      }
    },
  })

  useEffect(() => {
    if (selectedPlanId === null) {
      form.reset(createBlankPlanForm())
      setErrorMessage(null)
      return
    }

    if (selectedPlan) {
      form.reset(toPlanFormState(selectedPlan))
      setErrorMessage(null)
    }
  }, [selectedPlanId, selectedPlan, form])

  function handleDelete() {
    if (selectedPlanId === null) {
      return
    }
    selectPlan(null)
    removePlan.mutate(selectedPlanId)
  }

  function handleBack() {
    selectPlan(null)
  }

  function addItem() {
    const items = form.getFieldValue('items')
    const lastSortOrder = items.at(-1)?.sortOrder ?? 0
    form.setFieldValue('items', [
      ...items,
      createBlankPlanItem(lastSortOrder + 1),
    ])
  }

  function removeItem(clientId: string) {
    const items = form.getFieldValue('items')
    form.setFieldValue(
      'items',
      reindexPlanItems(items.filter((item) => item.clientId !== clientId)),
    )
  }

  function moveItem(clientId: string, direction: -1 | 1) {
    const items = form.getFieldValue('items')
    const currentIndex = items.findIndex((item) => item.clientId === clientId)
    const nextIndex = currentIndex + direction

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
      return
    }

    const nextItems = [...items]
    const [item] = nextItems.splice(currentIndex, 1)
    nextItems.splice(nextIndex, 0, item)
    form.setFieldValue('items', reindexPlanItems(nextItems))
  }

  function handleQueryChange(clientId: string, queryId: number | null) {
    const items = form.getFieldValue('items')
    form.setFieldValue(
      'items',
      items.map((item) =>
        item.clientId === clientId
          ? {
              ...item,
              queryId,
              variableBindings: seedVariableBindings(
                queries.find((query) => query.id === queryId),
              ),
            }
          : item,
      ),
    )
  }

  return {
    selectedPlanId,
    selectedPlanName: selectedPlan?.name ?? null,
    isNotFound,
    form,
    queries,
    isSaving: persistPlan.isPending,
    errorMessage,
    handleDelete,
    handleBack,
    addItem,
    removeItem,
    moveItem,
    handleQueryChange,
  }
}

export type PlanWorkspaceForm = ReturnType<
  typeof usePlanWorkspace
>['form']
