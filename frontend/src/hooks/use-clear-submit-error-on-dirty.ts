import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useClearSubmitErrorOnDirty(form: any) {
  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      if (form.state.isDirty && form.state.errorMap.onSubmit) {
        form.setErrorMap((prev: { onSubmit?: unknown }) => ({
          ...prev,
          onSubmit: undefined,
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [form])
}
