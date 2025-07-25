"use client";

import {
  ChevronRight,
  Folder,
  HardDrive,
  Home,
  Users,
  Clock,
  Star,
  Trash2,
  Settings,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { NavLink } from "@remix-run/react";

export function NavMain() {
  const item = {
    items: [
      {
        title: "Documents",
        url: "#",
      },
      {
        title: "Images",
        url: "#",
      },
      {
        title: "Videos",
        url: "#",
      },
    ],
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Home" className="flex-1">
            <a href="/dashboard/folders/root">
              <Home className="size-4" />
              <span>Home</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarMenuItem>
            <div className="flex items-center">
              <SidebarMenuButton asChild tooltip="My Drive" className="flex-1">
                <a href="/dashboard/folders/root">
                  <HardDrive className="size-4" />
                  <span>My Drive</span>
                </a>
              </SidebarMenuButton>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  size="sm"
                  className="w-8 h-8 p-0 flex items-center justify-center"
                >
                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <a href={subItem.url}>
                        <Folder className="size-4" />
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Shared with me" className="flex-1">
            <a href="/dashboard/folders/root">
              <Users className="size-4" />
              <span>Shared with me</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Separator />
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Recent files" className="flex-1">
            <a href="/dashboard/recent">
              <Clock className="size-4" />
              <span>Recent files</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Favourites" className="flex-1">
            <a href="/dashboard/favourites">
              <Star className="size-4" />
              <span>Favourites</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Separator />
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Trash" className="flex-1">
            <a href="/dashboard/trash">
              <Trash2 className="size-4" />
              <span>Trash</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
