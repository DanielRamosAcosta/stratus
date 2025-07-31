import {data, Outlet, useLoaderData} from "@remix-run/react";
import {SidebarInset, SidebarProvider, SidebarTrigger,} from "~/components/ui/sidebar";
import {AppSidebar} from "~/components/app-sidebar";
import {AppCommand} from "../components/app-command";
import {withProtection} from "~/core/shared/infrastructure/middlewares/withProtection";
import {asyncFlow} from "~/utils/asyncFlow";
import {withNoop} from "~/core/shared/infrastructure/middlewares/withNoop";
import { fromOidc, toSidebarUser } from "../core/users/domain/User";
import { getRootOf, getTrashOf } from "../core/entries/infrastructure/EntryRepository";

export default function DashboardLayout() {
  const {user, rootDirectoryId, trashDirectoryId} = useLoaderData<typeof loader>();

  return (
    <SidebarProvider>
      <AppSidebar rootDirectoryId={rootDirectoryId} trashDirectoryId={trashDirectoryId} user={user}></AppSidebar>

      <SidebarInset>
        {/* Top Search Bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-center">
            <AppCommand />
          </div>
        </header>

        {/* Command Dialog */}

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const loader = asyncFlow(
  withProtection,
  async ({ user }) => {
    return data({
      user: toSidebarUser(fromOidc(user)),
      rootDirectoryId: await getRootOf(user.sub),
      trashDirectoryId: await getTrashOf(user.sub)
    });
  }
)
