export const QUERY_EDITOR_TABS = ['details', 'query', 'variables'] as const

export type QueryEditorTab = (typeof QUERY_EDITOR_TABS)[number]
