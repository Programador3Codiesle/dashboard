'use client';

import { ROUTES } from "@/utils/constants";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

function resolvePageTitle(currentPath: string): string {
  const exactMatch = ROUTES.find((route) => route.path === currentPath);
  if (exactMatch) return exactMatch.name;

  const sortedRoutes = [...ROUTES].sort((a, b) => b.path.length - a.path.length);
  const matchingRoute = sortedRoutes.find((route) => {
    if (route.path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(`${route.path}/`) || currentPath === route.path;
  });

  return matchingRoute?.name || "Dashboard";
}

function HeaderPageTitleComponent() {
  const currentPath = usePathname();
  const currentTitle = useMemo(() => resolvePageTitle(currentPath), [currentPath]);

  return (
    <h1 className="text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-bold bg-linear-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
      {currentTitle}
    </h1>
  );
}

export const HeaderPageTitle = memo(HeaderPageTitleComponent);
