import { useQuery } from '@tanstack/react-query'
import { useLiveQuery } from '@tanstack/react-db'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import { getErrorMessage } from '@/lib/get-error-message'
import type { AuditCategory, AuditQuery } from '@/lib/audit-api'
import {
  auditCategoriesCollection,
  auditQueriesCollection,
  persistAuditQuery,
  removeAuditQuery,
} from '@/lib/db/audit-collections'
import { auditQueryPreviewOptions } from '@/lib/queries/audit-queries'

import {
  buildRequest,
  createBlankForm,
  createBlankSection,
  reindexSections,
  toFormState,
  type QueryFormState,
} from './query-form'

export function useAuditQueryWorkspace(selectedQueryId: number | null) {
  const navigate = useNavigate()
  const [form, setForm] = useState<QueryFormState>(() => createBlankForm())
  const [isDirty, setIsDirty] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: queryRows = [] } = useLiveQuery((q) =>
    q.from({ query: auditQueriesCollection }),
  )
  const { data: categoryRows = [] } = useLiveQuery((q) =>
    q.from({ category: auditCategoriesCollection }),
  )
  const queries = queryRows as unknown as AuditQuery[]
  const categories = categoryRows as unknown as AuditCategory[]
  const previewQuery = useQuery(auditQueryPreviewOptions(selectedQueryId))

  const selectedQuery =
    queries.find((query) => query.id === selectedQueryId) ?? null
  const isNotFound = selectedQueryId !== null && selectedQuery === null
  const previewErrorMessage = previewQuery.isError
    ? getErrorMessage(previewQuery.error, 'Unable to load SQL preview.')
    : null

  useEffect(() => {
    if (selectedQueryId === null) {
      setForm(createBlankForm())
      setIsDirty(false)
      setErrorMessage(null)
      return
    }

    if (selectedQuery) {
      setForm(toFormState(selectedQuery))
      setIsDirty(false)
      setErrorMessage(null)
    }
  }, [selectedQueryId, selectedQuery])

  function markFormChanged(nextForm: QueryFormState) {
    setForm(nextForm)
    setIsDirty(true)
    setErrorMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { request, error } = buildRequest(form)

    if (!request) {
      setErrorMessage(error ?? 'Unable to save query.')
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      const savedQuery = await persistAuditQuery(selectedQueryId, request)

      setForm(toFormState(savedQuery))
      setIsDirty(false)

      if (selectedQueryId === null) {
        await navigate({
          to: '/audit/queries/$queryId',
          params: { queryId: savedQuery.id },
        })
      }
    } catch {
      // Collection helpers own the toast; keep the form state intact for correction.
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (selectedQueryId === null) {
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      await removeAuditQuery(selectedQueryId)
      await navigate({ to: '/audit/queries' })
    } catch {
      // Collection helpers own the toast; keep the selected query visible.
    } finally {
      setIsSaving(false)
    }
  }

  function updateSection(
    clientId: string,
    updates: Partial<Omit<QueryFormState['sections'][number], 'clientId'>>,
  ) {
    markFormChanged({
      ...form,
      sections: form.sections.map((section) =>
        section.clientId === clientId ? { ...section, ...updates } : section,
      ),
    })
  }

  function addSection() {
    const lastSortOrder = form.sections.at(-1)?.sortOrder ?? 0

    markFormChanged({
      ...form,
      sections: [...form.sections, createBlankSection(lastSortOrder + 10)],
    })
  }

  function removeSection(clientId: string) {
    const nextSections = form.sections.filter(
      (section) => section.clientId !== clientId,
    )
    const { error } = buildRequest({
      ...form,
      sections: reindexSections(nextSections),
    })

    if (error) {
      setErrorMessage(error)
      return
    }

    markFormChanged({
      ...form,
      sections: reindexSections(nextSections),
    })
  }

  function moveSection(clientId: string, direction: -1 | 1) {
    const currentIndex = form.sections.findIndex(
      (section) => section.clientId === clientId,
    )
    const nextIndex = currentIndex + direction

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= form.sections.length) {
      return
    }

    const nextSections = [...form.sections]
    const [section] = nextSections.splice(currentIndex, 1)
    nextSections.splice(nextIndex, 0, section)

    markFormChanged({
      ...form,
      sections: reindexSections(nextSections),
    })
  }

  function toggleCategory(categoryId: number) {
    const nextCategoryIds = form.categoryIds.includes(categoryId)
      ? form.categoryIds.filter((id) => id !== categoryId)
      : [...form.categoryIds, categoryId]

    markFormChanged({
      ...form,
      categoryIds: nextCategoryIds,
    })
  }

  return {
    selectedQueryId,
    selectedQueryName: selectedQuery?.name ?? null,
    isNotFound,
    form,
    categories,
    preview: previewQuery.data ?? null,
    isDirty,
    isSaving,
    isPreviewLoading: previewQuery.isFetching,
    errorMessage: errorMessage ?? previewErrorMessage,
    handleSubmit,
    handleDelete,
    markFormChanged,
    toggleCategory,
    addSection,
    removeSection,
    moveSection,
    updateSection,
  }
}
