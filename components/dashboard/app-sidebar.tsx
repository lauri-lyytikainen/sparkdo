"use client";

import * as React from "react";
import {
  AudioWaveform,
  CalendarDays,
  CircleCheck,
  Command,
  FileClock,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Sun,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavProjects } from "@/components/dashboard/nav-projects";
import { NavUser } from "@/components/dashboard/nav-user";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useTaskContext } from "@/components/dashboard/task-provider";
import NewTaskDialogButton from "@/components/dashboard/new-task-dialog-button";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { unscheduledTaskCount, todayTaskCount, upcomingTaskCount } = useTaskContext();
  const isMobile = useIsMobile();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Unscheduled",
        url: "/dashboard/unscheduled",
        icon: FileClock,
        badgeCount: unscheduledTaskCount || undefined,
      },
      {
        title: "Today",
        url: "/dashboard",
        icon: Sun,
        badgeCount: todayTaskCount || undefined,
      },
      {
        title: "Upcoming",
        url: "/dashboard/upcoming",
        icon: CalendarDays,
        badgeCount: upcomingTaskCount || undefined,
      },
      {
        title: "Completed",
        url: "/dashboard/completed",
        icon: CircleCheck,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        {!isMobile &&
          <NewTaskDialogButton />
        }
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
