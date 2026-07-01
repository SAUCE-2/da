import { Link, useRouterState } from '@tanstack/react-router'
import { CaretRightIcon } from '@phosphor-icons/react/CaretRight'
import { CircleIcon } from '@phosphor-icons/react/Circle'
import { ClipboardTextIcon } from '@phosphor-icons/react/ClipboardText'
import { SidebarSimpleIcon } from '@phosphor-icons/react/SidebarSimple'
import { SquaresFourIcon } from '@phosphor-icons/react/SquaresFour'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { NavItem, NavSection } from '@/lib/build-nav-tree'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { ModeToggle } from './mode-toggle'

type NavSubsectionDisplay = {
  title: string
  icon: PhosphorIcon
}

const NAV_SUBSECTION_DISPLAY: Record<string, NavSubsectionDisplay> = {
  core: {
    title: 'Core',
    icon: SquaresFourIcon,
  },
  audit: {
    title: 'Audit',
    icon: ClipboardTextIcon,
  },
}

function getSubsectionDisplay(subsectionId: string) {
  return (
    NAV_SUBSECTION_DISPLAY[subsectionId] ?? {
      title: subsectionId,
      icon: CircleIcon,
    }
  )
}

function isNavItemActive(item: NavItem, currentPath: string) {
  return item.to === currentPath
}

function SidebarCollapseAction() {
  const { toggleSidebar } = useSidebar()

  return (
    <SidebarMenuAction
      onClick={toggleSidebar}
      title="Collapse sidebar"
      className="top-2! right-1! size-7"
    >
      <SidebarSimpleIcon />
      <span className="sr-only">Collapse sidebar</span>
    </SidebarMenuAction>
  )
}

function NavMenuItems({
  items,
  currentPath,
}: {
  items: NavItem[]
  currentPath: string
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              asChild
              isActive={isNavItemActive(item, currentPath)}
              tooltip={item.label}
            >
              <Link to={item.to}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
            {item.children.length > 0 ? (
              <SidebarMenuSub>
                <NavSubMenuItems
                  items={item.children}
                  currentPath={currentPath}
                />
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuItem>
        )
      })}
    </>
  )
}

function NavSubMenuItems({
  items,
  currentPath,
}: {
  items: NavItem[]
  currentPath: string
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon

        return (
          <SidebarMenuSubItem key={item.id}>
            <SidebarMenuSubButton
              asChild
              isActive={isNavItemActive(item, currentPath)}
            >
              <Link to={item.to}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuSubButton>
            {item.children.length > 0 ? (
              <SidebarMenuSub>
                <NavSubMenuItems
                  items={item.children}
                  currentPath={currentPath}
                />
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuSubItem>
        )
      })}
    </>
  )
}

function NavSectionGroup({
  section,
  currentPath,
}: {
  section: NavSection
  currentPath: string
}) {
  if (!section.id) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <NavMenuItems items={section.items} currentPath={currentPath} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  const { title, icon: Icon } = getSubsectionDisplay(section.id)

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="gap-2 transition-transform [&>svg:first-child]:transition-transform data-[state=open]:[&>svg:first-child]:rotate-90">
            <CaretRightIcon />
            <Icon />
            <span>{title}</span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavMenuItems items={section.items} currentPath={currentPath} />
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

export function AppSidebar({ sections }: { sections: NavSection[] }) {
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Data Audit">
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ClipboardTextIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Data Audit</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Metadata console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
            <SidebarCollapseAction />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <NavSectionGroup
            key={section.id ?? 'unsectioned'}
            section={section}
            currentPath={currentPath}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
