export const PLAN_EDITOR_TABS = ['details', 'queries', 'variables'] as const

export type PlanEditorTab = (typeof PLAN_EDITOR_TABS)[number]
