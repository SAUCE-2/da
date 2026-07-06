export type VariableDefinition = {
  name: string
  defaultValue?: string | null
}

export function variableDefaultsFromDefinitions(
  variables: VariableDefinition[],
  overrides: Record<string, string> = {},
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const variable of variables) {
    const name = variable.name.trim()
    if (!name) {
      continue
    }
    result[name] = overrides[name] ?? variable.defaultValue ?? ''
  }

  return result
}

export function mergePreviewVariableOverrides(
  variables: VariableDefinition[],
  overrides: Record<string, string>,
): Record<string, string> {
  const defaults = variableDefaultsFromDefinitions(variables)
  const namedVariables = variables
    .map((variable) => variable.name.trim())
    .filter(Boolean)

  const prunedOverrides: Record<string, string> = {}
  for (const name of namedVariables) {
    if (name in overrides) {
      prunedOverrides[name] = overrides[name]
    }
  }

  return { ...defaults, ...prunedOverrides }
}
