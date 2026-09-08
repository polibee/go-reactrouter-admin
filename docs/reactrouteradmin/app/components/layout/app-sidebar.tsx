import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '~/components/ui/sidebar'
import { useAuth } from '~/core/auth'
import { buildNavigation } from '~/core/navigation/navigation-builder'
import { sidebarData } from '~/data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const navGroups = buildNavigation(user)

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup
            key={group.title}
            {...(group as unknown as React.ComponentProps<typeof NavGroup>)}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar || sidebarData.user.avatar,
                }
              : sidebarData.user
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
