import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'

import { getErrorMessage } from '@/lib/get-error-message'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import {
  OPTIMISTIC_ID,
  persistAuditQuery,
  removeAuditQuery,
} from '@/lib/queries/audit-mutations'
import {
  auditQueriesListOptions,
  auditQueryPreviewOptions,
} from '@/lib/queries/audit-queries'

import {
  buildRequest,
  createBlankForm,
  createBlankSection,
  reindexSections,
  toFormState,
  type QueryFormState,
} from './query-form'
import { useQueryWorkspaceSelection } from './query-workspace-context'

export function useAuditQueryWorkspace() {
  const { selectedQueryId, selectQuery } = useQueryWorkspaceSelection()
  const [form, setForm] = useState<QueryFormState>(() => createBlankForm())
  const [isDirty, setIsDirty] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { request, error } = buildRequest(form)

    if (!request) {
      setErrorMessage(error ?? 'Unable to save query.')
      return
    }

    setErrorMessage(null)

    const wasCreate = selectedQueryId === null
    const savingId = selectedQueryId

    setIsSaving(true)
    void persistAuditQuery(savingId, request)
      .then((saved) => {
        if (wasCreate) {
          selectQuery(saved.id)
        }
        setForm(toFormState(saved))
        setIsDirty(false)
      })
      .catch(() => {
        if (wasCreate) {
          selectQuery(null)
        }
      })
      .finally(() => {
        setIsSaving(false)
      })

    if (wasCreate) {
      selectQuery(OPTIMISTIC_ID)
    }
  }

  function handleDelete() {
    if (selectedQueryId === null) {
      return
    }

    const deletedId = selectedQueryId
    setErrorMessage(null)
    selectQuery(null)
    void removeAuditQuery(deletedId)
  }

  function handleBack() {
    selectQuery(null)
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
    handleBack,
    markFormChanged,
    toggleCategory,
    addSection,
    removeSection,
    moveSection,
    updateSection,
  }
}
