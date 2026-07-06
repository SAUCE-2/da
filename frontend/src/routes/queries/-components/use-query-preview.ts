import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { getErrorMessage } from '@/lib/get-error-message'
import { queryPreviewOptions } from '@/lib/queries/queries'
import { mergePreviewVariableOverrides } from '@/lib/variable-utils'

import type { ClientVariable } from './query-form'

export function useQueryPreview(
  selectedQueryId: number | null,
  formVariables: ClientVariable[],
) {
  const [previewVariableOverrides, setPreviewVariableOverrides] = useState<
    Record<string, string>
  >({})

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

  const previewErrorMessage = previewQuery.isError
    ? getErrorMessage(previewQuery.error, 'Unable to load SQL preview.')
    : null

  function updatePreviewVariable(name: string, value: string) {
    setPreviewVariableOverrides((current) => ({ ...current, [name]: value }))
  }

  const resetPreviewOverrides = useCallback(() => {
    setPreviewVariableOverrides({})
  }, [])

  return {
    preview: previewQuery.data ?? null,
    previewVariableValues,
    isPreviewLoading: previewQuery.isFetching,
    previewErrorMessage,
    updatePreviewVariable,
    resetPreviewOverrides,
  }
}
