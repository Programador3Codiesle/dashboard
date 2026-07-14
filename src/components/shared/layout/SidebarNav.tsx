'use client';

import { ROUTES, MENU_ID_BY_ROUTE } from "@/utils/constants";
import { IUser } from "@/types/global";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";

interface SidebarNavProps {
  user: IUser | null;
  isCollapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
}

function isRouteActive(currentPath: string, routePath: string) {
  if (currentPath === routePath) return true;
  if (routePath === "/dashboard") return currentPath === "/dashboard";
  return currentPath.startsWith(`${routePath}/`);
}

function SidebarNavComponent({
  user,
  isCollapsed,
  isMobile,
  onClose,
}: SidebarNavProps) {
  const currentPath = usePathname();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    const hasMenuPermissions = Array.isArray(user?.menus_permitidos);
    const menusPermitidos = new Set(user?.menus_permitidos || []);

    return ROUTES.filter((route) => {
      if (route.path === "/dashboard") {
        return true;
      }

      if (!hasMenuPermissions) {
        return true;
      }

      const menuId = MENU_ID_BY_ROUTE[route.path];
      if (!menuId) {
        return false;
      }

      return menusPermitidos.has(menuId);
    });
  }, [user?.menus_permitidos]);

  const handleNavClick = useCallback(() => {
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  return (
    <nav className="p-2 flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
      <p
        className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 p-0" : "opacity-100 h-auto p-4"}`}
      >
        Navegación Principal
      </p>

      <div className="space-y-2">
        {filteredRoutes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            prefetch
            onClick={handleNavClick}
            onMouseEnter={() => setIsHovered(route.path)}
            onMouseLeave={() => setIsHovered(null)}
            className={`
              relative flex items-center w-full p-2 rounded-xl transition-all duration-300 border
              ${isRouteActive(currentPath, route.path)
                ? "brand-bg-active brand-border-active shadow-lg"
                : "hover:bg-gray-800/50 border-transparent"
              }
              ${isCollapsed ? "justify-center" : "justify-between px-4"}
            `}
          >
            <div className="flex items-center min-w-0">
              <div
                className={`
                  p-2 rounded-lg mr-0 transition-colors shrink-0
                  ${isCollapsed ? "mr-0" : "mr-3"}
                  ${isRouteActive(currentPath, route.path)
                    ? "brand-bg text-white"
                    : "bg-gray-800 brand-text"
                  }
                `}
              >
                <route.icon size={18} />
              </div>
              <span
                className={`font-medium whitespace-nowrap truncate overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
              >
                {route.name}
              </span>
            </div>

            {!isCollapsed && (
              <div
                className={`transition-all duration-200 ${
                  isHovered === route.path || isRouteActive(currentPath, route.path)
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-1"
                }`}
              >
                <ChevronRight size={16} className="brand-text" />
              </div>
            )}

            {isRouteActive(currentPath, route.path) && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 brand-bg rounded-l-full animate-scale-in" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export const SidebarNav = memo(SidebarNavComponent);
