import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  auditCategoryRequestSchema,
  formatZodError,
} from '@/lib/audit-api'
import { auditCategoriesListOptions } from '@/lib/queries/audit-categories'
import {
  OPTIMISTIC_ID,
  usePersistAuditCategory,
  useRemoveAuditCategory,
} from '@/lib/queries/audit-mutations'

import {
  createBlankForm,
  toFormState,
} from './category-form'
import { useCategoryWorkspaceSelection } from './category-workspace-context'
import { useCategoryQueryCounts } from './use-category-query-counts'

export function useAuditCategoryWorkspace() {
  const { selectedCategoryId, selectCategory } = useCategoryWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const persistCategory = usePersistAuditCategory()
  const removeCategory = useRemoveAuditCategory()

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

  const form = useForm({
    defaultValues: createBlankForm(),
    validators: {
      onSubmit: ({ value }) => {
        const result = auditCategoryRequestSchema.safeParse(value)
        if (!result.success) {
          return formatZodError(result.error)
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const request = auditCategoryRequestSchema.parse(value)
      setErrorMessage(null)

      const wasCreate = selectedCategoryId === null
      const savingId = selectedCategoryId

      if (wasCreate) {
        selectCategory(OPTIMISTIC_ID)
      }

      try {
        const saved = await persistCategory.mutateAsync({ id: savingId, request })
        if (wasCreate) {
          selectCategory(saved.id)
        }
        form.reset(toFormState(saved))
      } catch {
        if (wasCreate) {
          selectCategory(null)
        }
      }
    },
  })

  useEffect(() => {
    if (selectedCategoryId === null) {
      form.reset(createBlankForm())
      setErrorMessage(null)
      return
    }

    if (selectedCategory) {
      form.reset(toFormState(selectedCategory))
      setErrorMessage(null)
    }
  }, [selectedCategoryId, selectedCategory, form])

  function handleDelete() {
    if (selectedCategoryId === null) {
      return
    }

    const deletedId = selectedCategoryId
    setErrorMessage(null)
    selectCategory(null)
    removeCategory.mutate(deletedId)
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
    isSaving: persistCategory.isPending,
    errorMessage,
    handleDelete,
    handleBack,
  }
}
