import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { formatZodError, queryRequestSchema } from '@/lib/schemas'
import { categoriesListOptions } from '@/lib/queries/categories'
import {
  OPTIMISTIC_ID,
  usePersistQuery,
  useRemoveQuery,
} from '@/lib/queries/mutations'
import { queriesListOptions } from '@/lib/queries/queries'

import {
  createBlankForm,
  createBlankSection,
  createBlankVariable,
  reindexSections,
  reindexVariables,
  toQueryRequest,
  toFormState,
} from './query-form'
import { useQueryPreview } from './use-query-preview'
import { useQueryWorkspaceSelection } from './query-workspace-context'

function readSubmitError(errorMap: unknown) {
  const err = (errorMap as { onSubmit?: unknown })?.onSubmit
  return typeof err === 'string' && err.length > 0 ? err : null
}

export function useQueryWorkspace() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const initialFormValues =
    selectedQueryId === null
      ? createBlankForm()
      : selectedQuery
        ? toFormState(selectedQuery)
        : createBlankForm()

  const form = useForm({
    defaultValues: initialFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = queryRequestSchema.safeParse(toQueryRequest(value))
        return result.success ? undefined : formatZodError(result.error)
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
        resetPreviewOverrides()
      } catch {
        if (wasCreate) {
          selectQuery(null)
        }
      }
    },
  })

  const formVariables = useStore(form.store, (state) => state.values.variables)
  const formValues = useStore(form.store, (state) => state.values)
  const {
    preview,
    previewVariableValues,
    isPreviewLoading,
    previewErrorMessage,
    updatePreviewVariable,
    resetPreviewOverrides,
  } = useQueryPreview(selectedQueryId, formVariables)

  const isDirty = useStore(form.store, (state) => state.isDirty)
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

  function reorderSection(fromIndex: number, toIndex: number) {
    const sections = form.getFieldValue('sections')
    const next = [...sections]
    const [removed] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, removed)

    form.setFieldValue('sections', reindexSections(next))
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

  return {
    selectedQueryId,
    selectedQuery,
    selectedQueryName: selectedQuery?.name ?? null,
    isNotFound,
    form,
    categories,
    preview,
    previewVariableValues,
    isDirty,
    isSaving: persistQuery.isPending,
    isPreviewLoading,
    errorMessage: errorMessage ?? submitError ?? previewErrorMessage,
    handleDelete,
    handleBack,
    toggleCategory,
    addSection,
    removeSection,
    reorderSection,
    addVariable,
    removeVariable,
    updatePreviewVariable,
  }
}

export type QueryWorkspaceForm = ReturnType<typeof useQueryWorkspace>['form']
