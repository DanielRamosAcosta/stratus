import * as React from "react"
import {NavMain} from "~/components/nav-main"
import {NavUser} from "~/components/nav-user"
import {TeamSwitcher} from "~/components/team-switcher"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "~/components/ui/sidebar"
import {SidebarUser} from "~/core/users/domain/User"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser
  rootDirectoryId: string
  trashDirectoryId: string
}

export function AppSidebar({ user, rootDirectoryId, trashDirectoryId, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain rootDirectoryId={rootDirectoryId} trashDirectoryId={trashDirectoryId} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
