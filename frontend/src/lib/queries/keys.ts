export const queryKeys = {
  all: ['queries'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: () => [...queryKeys.lists()] as const,
  versions: (id: number | null) =>
    [...queryKeys.all, 'versions', id ?? 'new'] as const,
  preview: (id: number | null, request: Record<string, unknown> = {}) =>
    [...queryKeys.all, 'preview', id ?? 'new', request] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
}

export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: () => [...planKeys.lists()] as const,
}
