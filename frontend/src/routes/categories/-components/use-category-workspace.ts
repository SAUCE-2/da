import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { categoryRequestSchema } from '@/lib/schemas'
import { categoriesListOptions } from '@/lib/queries/categories'
import {
  OPTIMISTIC_ID,
  usePersistCategory,
  useRemoveCategory,
} from '@/lib/queries/mutations'

import {
  createBlankForm,
  toFormState,
} from './category-form'
import { useCategoryWorkspaceSelection } from './category-workspace-context'
import { useCategoryQueryCounts } from './use-category-query-counts'

export function useCategoryWorkspace() {
  const { selectedCategoryId, selectCategory } = useCategoryWorkspaceSelection()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const persistCategory = usePersistCategory()
  const removeCategory = useRemoveCategory()

  const { data: categories = [], isFetched } = useQuery(categoriesListOptions())
  const getQueryCount = useCategoryQueryCounts()

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null
  const selectedQueryCount = selectedCategory
    ? getQueryCount(selectedCategory)
    : 0
  const isNotFound =
    isFetched &&
    selectedCategoryId !== null &&
    selectedCategoryId !== OPTIMISTIC_ID &&
    selectedCategory === null

  const initialFormValues =
    selectedCategoryId === null
      ? createBlankForm()
      : selectedCategory
        ? toFormState(selectedCategory)
        : createBlankForm()

  const form = useForm({
    defaultValues: initialFormValues,
    validators: {
      onSubmit: categoryRequestSchema,
    },
    onSubmit: async ({ value }) => {
      const request = categoryRequestSchema.parse(value)
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
