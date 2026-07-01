import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'

import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import {
  OPTIMISTIC_ID,
  persistAuditCategory,
  removeAuditCategory,
} from '@/lib/queries/audit-mutations'

import {
  buildRequest,
  createBlankForm,
  toFormState,
  type CategoryFormState,
} from './category-form'
import { useCategoryWorkspaceSelection } from './category-workspace-context'
import { useCategoryQueryCounts } from './use-category-query-counts'

export function useAuditCategoryWorkspace() {
  const { selectedCategoryId, selectCategory } = useCategoryWorkspaceSelection()
  const [form, setForm] = useState<CategoryFormState>(() => createBlankForm())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: categories = [] } = useQuery(auditCategoriesListOptions())
  const getQueryCount = useCategoryQueryCounts()

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null
  const selectedQueryCount = selectedCategory
    ? getQueryCount(selectedCategory)
    : 0
  const isNotFound =
    selectedCategoryId !== null &&
    selectedCategoryId !== OPTIMISTIC_ID &&
    selectedCategory === null

  useEffect(() => {
    if (selectedCategoryId === null) {
      setForm(createBlankForm())
      setErrorMessage(null)
      return
    }

    if (selectedCategory) {
      setForm(toFormState(selectedCategory))
      setErrorMessage(null)
    }
  }, [selectedCategoryId, selectedCategory])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { request, error } = buildRequest(form)

    if (!request) {
      setErrorMessage(error ?? 'Unable to save category.')
      return
    }

    setErrorMessage(null)

    const wasCreate = selectedCategoryId === null
    const savingId = selectedCategoryId

    setIsSaving(true)
    void persistAuditCategory(savingId, request)
      .then((saved) => {
        if (wasCreate) {
          selectCategory(saved.id)
        }
        setForm(toFormState(saved))
      })
      .catch(() => {
        if (wasCreate) {
          selectCategory(null)
        }
      })
      .finally(() => {
        setIsSaving(false)
      })

    if (wasCreate) {
      selectCategory(OPTIMISTIC_ID)
    }
  }

  function handleDelete() {
    if (selectedCategoryId === null) {
      return
    }

    const deletedId = selectedCategoryId
    setErrorMessage(null)
    selectCategory(null)
    void removeAuditCategory(deletedId)
  }

  function handleBack() {
    selectCategory(null)
  }

  return {
    selectedCategoryId,
    selectedCategory,
    selectedQueryCount,
    isNotFound,
    form,
    isSaving,
    errorMessage,
    handleSubmit,
    handleDelete,
    handleBack,
    setForm,
  }
}
