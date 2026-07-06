import { describe, expect, it } from 'vitest'

import { readSubmitError } from './form-submit-validation'

describe('readSubmitError', () => {
  it('returns the onSubmit string when present', () => {
    expect(readSubmitError({ onSubmit: 'Query name is required.' })).toBe(
      'Query name is required.',
    )
  })

  it('returns null for empty or missing errors', () => {
    expect(readSubmitError({})).toBeNull()
    expect(readSubmitError({ onSubmit: '' })).toBeNull()
    expect(readSubmitError({ onSubmit: 400 })).toBeNull()
  })
})
