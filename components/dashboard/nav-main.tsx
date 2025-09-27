"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    badgeCount?: number;
  }[];
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tasks</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const isActive = pathname === item.url;

          const handleClick = () => {
            if (isMobile) {
              setOpenMobile(false);
            }
          };

          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url} className="flex" onClick={handleClick}>
                  {item.icon && (
                    <item.icon />
                  )}
                  {item.title}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>{item.badgeCount}</SidebarMenuBadge>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
