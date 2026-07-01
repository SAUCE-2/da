import type { AnyRoute } from '@tanstack/react-router'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

export type NavItem = {
  id: string
  label: string
  icon: PhosphorIcon
  subsectionId: string | undefined
  to: string
  order: number
  children: NavItem[]
}

export type NavSection = {
  id: string | undefined
  order: number
  items: NavItem[]
}

type FlatNavItem = {
  id: string
  label: string
  icon: PhosphorIcon
  subsectionId: string | undefined
  parentId: string | undefined
  order: number
  to: string
}

export function buildNavTree(routeTree: AnyRoute): NavSection[] {
  const routes = collectRoutes(routeTree)

  const flatItems = routes
    .map((route) => {
      const nav = route.options.staticData?.nav

      if (!nav || nav.hidden) {
        return null
      }

      return {
        id: nav.id,
        label: nav.label,
        icon: nav.icon,
        subsectionId: nav.subsectionId,
        parentId: nav.parentId,
        order: nav.order ?? 0,
        to: route.fullPath,
      }
    })
    .filter((item): item is FlatNavItem => item !== null)

  const itemMap = new Map<string, NavItem>()

  for (const item of flatItems) {
    itemMap.set(item.id, {
      id: item.id,
      label: item.label,
      icon: item.icon,
      subsectionId: item.subsectionId,
      to: item.to,
      order: item.order,
      children: [],
    })
  }

  const rootItems: NavItem[] = []

  for (const item of flatItems) {
    const navItem = itemMap.get(item.id)

    if (!navItem) {
      continue
    }

    if (!item.parentId) {
      rootItems.push(navItem)
      continue
    }

    const parent = itemMap.get(item.parentId)

    if (!parent) {
      rootItems.push(navItem)
      continue
    }

    parent.children.push(navItem)
  }

  sortNavItems(rootItems)

  return groupNavItemsBySubsection(rootItems)
}

function collectRoutes(route: AnyRoute): AnyRoute[] {
  const children = (route.children ?? []) as AnyRoute[]

  return [route, ...children.flatMap((child) => collectRoutes(child))]
}

function sortNavItems(items: NavItem[]) {
  items.sort((a, b) => a.order - b.order)

  for (const item of items) {
    sortNavItems(item.children)
  }
}

function groupNavItemsBySubsection(items: NavItem[]): NavSection[] {
  const sectionMap = new Map<string | undefined, NavSection>()

  for (const item of items) {
    const section = sectionMap.get(item.subsectionId)

    if (!section) {
      sectionMap.set(item.subsectionId, {
        id: item.subsectionId,
        order: item.order,
        items: [item],
      })
      continue
    }

    section.order = Math.min(section.order, item.order)
    section.items.push(item)
  }

  return [...sectionMap.values()].sort((a, b) => a.order - b.order)
}
