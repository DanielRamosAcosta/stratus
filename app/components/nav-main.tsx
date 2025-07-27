"use client";

import {
  HardDrive,
  Home,
  Users,
  Clock,
  Star,
  Trash2,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Separator } from "./ui/separator";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Home" className="flex-1">
            <a href="/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24">
              <Home className="size-4" />
              <span>Home</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="My Drive" className="flex-1">
            <a href="/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24">
              <HardDrive className="size-4" />
              <span>My Drive</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Shared with me"
            className="flex-1"
          >
            <a href="/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24">
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
