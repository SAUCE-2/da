import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useLayoutEffect, useMemo, useState } from 'react'

import { mergePreviewVariableOverrides } from '@/lib/variable-utils'
import {
  queryRequestSchema,
  formatZodError,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/get-error-message'
import { categoriesListOptions } from '@/lib/queries/categories'
import {
  OPTIMISTIC_ID,
  usePersistQuery,
  useRemoveQuery,
} from '@/lib/queries/mutations'
import {
  queriesListOptions,
  queryPreviewOptions,
} from '@/lib/queries/queries'

import {
  createBlankForm,
  createBlankSection,
  createBlankVariable,
  reindexSections,
  reindexVariables,
  toQueryRequest,
  toFormState,
} from './query-form'
import { useQueryWorkspaceSelection } from './query-workspace-context'

export function useQueryWorkspace() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewVariableOverrides, setPreviewVariableOverrides] = useState<
    Record<string, string>
  >({})

  const persistQuery = usePersistQuery()
  const removeQuery = useRemoveQuery()

  const { data: queries = [], isFetched } = useQuery(queriesListOptions())
  const { data: categories = [] } = useQuery(categoriesListOptions())

  const selectedQuery =
    queries.find((query) => query.id === selectedQueryId) ?? null
  const isNotFound =
    isFetched &&
    selectedQueryId !== null &&
    selectedQueryId !== OPTIMISTIC_ID &&
    selectedQuery === null

  const defaultFormValues = useMemo(
    () =>
      selectedQuery ? toFormState(selectedQuery) : createBlankForm(),
    [selectedQuery],
  )

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = queryRequestSchema.safeParse(
          toQueryRequest(value),
        )
        if (!result.success) {
          return formatZodError(result.error)
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const request = queryRequestSchema.parse(toQueryRequest(value))
      setErrorMessage(null)

      const wasCreate = selectedQueryId === null
      const savingId = selectedQueryId

      if (wasCreate) {
        selectQuery(OPTIMISTIC_ID)
      }

      try {
        const saved = await persistQuery.mutateAsync({ id: savingId, request })
        if (wasCreate) {
          selectQuery(saved.id)
        }
        form.reset(toFormState(saved))
        setPreviewVariableOverrides({})
      } catch {
        if (wasCreate) {
          selectQuery(null)
        }
      }
    },
  })

  const formVariables = useStore(form.store, (state) => state.values.variables)
  const previewVariableValues = useMemo(
    () => mergePreviewVariableOverrides(formVariables, previewVariableOverrides),
    [formVariables, previewVariableOverrides],
  )
  const previewRequest = useMemo(
    () => ({ variables: previewVariableValues }),
    [previewVariableValues],
  )

  const previewQuery = useQuery(
    queryPreviewOptions(selectedQueryId, previewRequest),
  )

  const isDirty = useStore(form.store, (state) => state.isDirty)
  const previewErrorMessage = previewQuery.isError
    ? getErrorMessage(previewQuery.error, 'Unable to load SQL preview.')
    : null

  useLayoutEffect(() => {
    if (selectedQueryId === null) {
      form.reset(createBlankForm())
      setPreviewVariableOverrides({})
      setErrorMessage(null)
      return
    }

    if (selectedQuery) {
      form.reset(toFormState(selectedQuery))
      setPreviewVariableOverrides({})
      setErrorMessage(null)
    }
  }, [selectedQueryId, selectedQuery, form])

  function handleDelete() {
    if (selectedQueryId === null) {
      return
    }

    const deletedId = selectedQueryId
    setErrorMessage(null)
    selectQuery(null)
    removeQuery.mutate(deletedId)
  }

  function handleBack() {
    selectQuery(null)
  }

  function toggleCategory(categoryId: number) {
    const categoryIds = form.getFieldValue('categoryIds')
    const nextCategoryIds = categoryIds.includes(categoryId)
      ? categoryIds.filter((id) => id !== categoryId)
      : [...categoryIds, categoryId]

    form.setFieldValue('categoryIds', nextCategoryIds)
  }

  function addSection() {
    const sections = form.getFieldValue('sections')
    const lastSortOrder = sections.at(-1)?.sortOrder ?? 0
    form.setFieldValue('sections', [
      ...sections,
      createBlankSection(lastSortOrder + 1),
    ])
  }

  function removeSection(clientId: string) {
    const sections = form.getFieldValue('sections')
    const nextSections = reindexSections(
      sections.filter((section) => section.clientId !== clientId),
    )
    const result = queryRequestSchema.safeParse(
      toQueryRequest({
        ...form.state.values,
        sections: nextSections,
      }),
    )

    if (!result.success) {
      setErrorMessage(formatZodError(result.error))
      return
    }

    setErrorMessage(null)
    form.setFieldValue('sections', nextSections)
  }

  function moveSection(clientId: string, direction: -1 | 1) {
    const sections = form.getFieldValue('sections')
    const currentIndex = sections.findIndex(
      (section) => section.clientId === clientId,
    )
    const nextIndex = currentIndex + direction

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sections.length) {
      return
    }

    const nextSections = [...sections]
    const [section] = nextSections.splice(currentIndex, 1)
    nextSections.splice(nextIndex, 0, section)
    form.setFieldValue('sections', reindexSections(nextSections))
  }

  function addVariable() {
    const variables = form.getFieldValue('variables')
    const lastSortOrder = variables.at(-1)?.sortOrder ?? 0
    form.setFieldValue('variables', [
      ...variables,
      createBlankVariable(lastSortOrder + 1),
    ])
  }

  function removeVariable(clientId: string) {
    const variables = form.getFieldValue('variables')
    form.setFieldValue(
      'variables',
      reindexVariables(variables.filter((variable) => variable.clientId !== clientId)),
    )
  }

  function updatePreviewVariable(name: string, value: string) {
    setPreviewVariableOverrides((current) => ({ ...current, [name]: value }))
  }

  return {
    selectedQueryId,
    selectedQuery,
    selectedQueryName: selectedQuery?.name ?? null,
    isNotFound,
    form,
    categories,
    preview: previewQuery.data ?? null,
    previewVariableValues,
    isDirty,
    isSaving: persistQuery.isPending,
    isPreviewLoading: previewQuery.isFetching,
    errorMessage: errorMessage ?? previewErrorMessage,
    handleDelete,
    handleBack,
    toggleCategory,
    addSection,
    removeSection,
    moveSection,
    addVariable,
    removeVariable,
    updatePreviewVariable,
  }
}

export type QueryWorkspaceForm = ReturnType<typeof useQueryWorkspace>['form']
