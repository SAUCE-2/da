import { useLiveQuery } from '@tanstack/react-db'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import {
  auditCategoriesCollection,
  auditQueriesCollection,
  persistAuditCategory,
  removeAuditCategory,
} from '@/lib/db/audit-collections'
import type { AuditCategory, AuditQuery } from '@/lib/audit-api'

import {
  buildDerivedQueryCounts,
  buildRequest,
  createBlankForm,
  getCategoryQueryCount,
  toFormState,
  type CategoryFormState,
} from './category-form'

export function useAuditCategoryWorkspace(selectedCategoryId: number | null) {
  const navigate = useNavigate()
  const [form, setForm] = useState<CategoryFormState>(() => createBlankForm())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: categoryRows = [] } = useLiveQuery((q) =>
    q.from({ category: auditCategoriesCollection }),
  )
  const { data: queryRows = [] } = useLiveQuery((q) =>
    q.from({ query: auditQueriesCollection }),
  )
  const categories = categoryRows as unknown as AuditCategory[]
  const queries = queryRows as unknown as AuditQuery[]

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null
  const derivedCounts = buildDerivedQueryCounts(queries)
  const selectedQueryCount = selectedCategory
    ? getCategoryQueryCount(selectedCategory, derivedCounts)
    : 0
  const isNotFound = selectedCategoryId !== null && selectedCategory === null

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { request, error } = buildRequest(form)

    if (!request) {
      setErrorMessage(error ?? 'Unable to save category.')
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      const savedCategory = await persistAuditCategory(
        selectedCategoryId,
        request,
      )

      setForm(toFormState(savedCategory))

      if (selectedCategoryId === null) {
        await navigate({
          to: '/audit/categories/$categoryId',
          params: { categoryId: savedCategory.id },
        })
      }
    } catch {
      // Collection helpers own the toast; keep the form state intact for correction.
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (selectedCategoryId === null) {
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      await removeAuditCategory(selectedCategoryId)
      await navigate({ to: '/audit/categories' })
    } catch {
      // Collection helpers own the toast; keep the selected category visible.
    } finally {
      setIsSaving(false)
    }
  }

  return {
    categories,
    queries,
    selectedCategoryId,
    selectedCategory,
    selectedQueryCount,
    isNotFound,
    form,
    isSaving,
    errorMessage,
    getQueryCount: (category: (typeof categories)[number]) =>
      getCategoryQueryCount(category, derivedCounts),
    handleSubmit,
    handleDelete,
    setForm,
  }
}
