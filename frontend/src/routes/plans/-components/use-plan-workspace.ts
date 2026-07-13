import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useState } from 'react'

import { formatZodError, planRequestSchema } from '@/lib/schemas'
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

function readSubmitError(errorMap: unknown) {
  const err = (errorMap as { onSubmit?: unknown })?.onSubmit
  return typeof err === 'string' && err.length > 0 ? err : null
}

export function usePlanWorkspace() {
  const { selectedPlanId, selectPlan } = usePlanWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const persistPlan = usePersistPlan()
  const removePlan = useRemovePlan()

  const { data: plans = [], isFetched } = useQuery(plansListOptions())
  const { data: queries = [] } = useQuery(queriesListOptions())

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? null
  const isNotFound =
    isFetched &&
    selectedPlanId !== null &&
    selectedPlanId !== OPTIMISTIC_ID &&
    selectedPlan === null

  const form = useForm({
    defaultValues: createBlankPlanForm(),
    validators: {
      onSubmit: ({ value }) => {
        const unselected = value.items.find((item) => item.queryId === null)
        if (unselected) {
          return 'Select a query for every step in the plan.'
        }
        const result = planRequestSchema.safeParse(toPlanRequest(value))
        return result.success ? undefined : formatZodError(result.error)
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

  const formValues = useStore(form.store, (state) => state.values)
  const submitError = useStore(form.store, (state) =>
    readSubmitError(state.errorMap),
  )

  useEffect(() => {
    const errorMap = form.state.errorMap as { onSubmit?: unknown }
    if (typeof errorMap.onSubmit !== 'string' || errorMap.onSubmit.length === 0) {
      return
    }

    form.setErrorMap({ ...errorMap, onSubmit: undefined })
  }, [formValues, form])

  useLayoutEffect(() => {
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

  function reorderItem(fromIndex: number, toIndex: number) {
    const items = form.getFieldValue('items')
    const next = [...items]
    const [removed] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, removed)

    form.setFieldValue('items', reindexPlanItems(next))
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
    errorMessage: errorMessage ?? submitError,
    handleDelete,
    handleBack,
    addItem,
    removeItem,
    reorderItem,
    handleQueryChange,
  }
}

export type PlanWorkspaceForm = ReturnType<
  typeof usePlanWorkspace
>['form']
