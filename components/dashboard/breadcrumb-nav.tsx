"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Extract the current page name from the pathname
  const getPageName = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    const currentSegment = segments[segments.length - 1];

    // Special case for dashboard root
    if (path === "/dashboard") {
      return "Today";
    }

    // Convert kebab-case to Title Case
    return currentSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getParentPath = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 1) {
      return "/" + segments.slice(0, -1).join("/");
    }
    return "/dashboard";
  };

  const currentPageName = getPageName(pathname);
  const parentPath = getParentPath(pathname);

  // Special handling for dashboard root - show Dashboard as parent
  const parentName =
    parentPath === "/dashboard" ? "Tasks" : getPageName(parentPath);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={parentPath}>{parentName}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
