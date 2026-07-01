import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  auditQueryRequestSchema,
  formatZodError,
} from '@/lib/audit-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import {
  OPTIMISTIC_ID,
  usePersistAuditQuery,
  useRemoveAuditQuery,
} from '@/lib/queries/audit-mutations'
import {
  auditQueriesListOptions,
  auditQueryPreviewOptions,
} from '@/lib/queries/audit-queries'

import {
  createBlankForm,
  createBlankSection,
  reindexSections,
  toAuditQueryRequest,
  toFormState,
} from './query-form'
import { useQueryWorkspaceSelection } from './query-workspace-context'

export function useAuditQueryWorkspace() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const persistQuery = usePersistAuditQuery()
  const removeQuery = useRemoveAuditQuery()

  const { data: queries = [] } = useQuery(auditQueriesListOptions())
  const { data: categories = [] } = useQuery(auditCategoriesListOptions())
  const previewQuery = useQuery(auditQueryPreviewOptions(selectedQueryId))

  const selectedQuery =
    queries.find((query) => query.id === selectedQueryId) ?? null
  const isNotFound =
    selectedQueryId !== null &&
    selectedQueryId !== OPTIMISTIC_ID &&
    selectedQuery === null
  const previewErrorMessage = previewQuery.isError
    ? getErrorMessage(previewQuery.error, 'Unable to load SQL preview.')
    : null

  const form = useForm({
    defaultValues: createBlankForm(),
    validators: {
      onSubmit: ({ value }) => {
        const result = auditQueryRequestSchema.safeParse(
          toAuditQueryRequest(value),
        )
        if (!result.success) {
          return formatZodError(result.error)
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const request = auditQueryRequestSchema.parse(toAuditQueryRequest(value))
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
      } catch {
        if (wasCreate) {
          selectQuery(null)
        }
      }
    },
  })

  const isDirty = useStore(form.store, (state) => state.isDirty)

  useEffect(() => {
    if (selectedQueryId === null) {
      form.reset(createBlankForm())
      setErrorMessage(null)
      return
    }

    if (selectedQuery) {
      form.reset(toFormState(selectedQuery))
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
      createBlankSection(lastSortOrder + 10),
    ])
  }

  function removeSection(clientId: string) {
    const sections = form.getFieldValue('sections')
    const nextSections = reindexSections(
      sections.filter((section) => section.clientId !== clientId),
    )
    const result = auditQueryRequestSchema.safeParse(
      toAuditQueryRequest({
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

  return {
    selectedQueryId,
    selectedQueryName: selectedQuery?.name ?? null,
    isNotFound,
    form,
    categories,
    preview: previewQuery.data ?? null,
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
  }
}

export type QueryWorkspaceForm = ReturnType<typeof useAuditQueryWorkspace>['form']
