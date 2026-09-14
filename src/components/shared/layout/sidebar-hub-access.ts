import { ADMINISTRACION_HUB_NAV } from "@/modules/administracion/hub/nav";
import { AUDITORIA_HUB_NAV } from "@/modules/auditoria/hub/nav";
import { CHECKLIST_HUB_NAV } from "@/modules/checklist/hub/nav";
import { CONTACT_CENTER_HUB_NAV } from "@/modules/contact-center/hub/nav";
import { COTIZAR_HUB_NAV } from "@/modules/cotizar/hub/nav";
import { ENCUESTAS_HUB_NAV } from "@/modules/encuestas/hub/nav";
import { GESTION_HUMANA_HUB_NAV } from "@/modules/informes/gestion-humana/hub/nav";
import { INFORMES_ROOT_HUB_NAV } from "@/modules/informes/hub/root-nav";
import { POSTVENTA_HUB_NAV } from "@/modules/informes/postventa/hub/nav";
import { INDICADORES_HUB_NAV } from "@/modules/indicadores/hub/nav";
import { MANTENIMIENTO_HUB_NAV } from "@/modules/mantenimiento/hub/nav";
import { NOMINA_HUB_NAV } from "@/modules/nomina/hub/nav";
import { ORDENES_TOT_HUB_NAV } from "@/modules/ordenes-tot/hub/nav";
import { REPUESTOS_HUB_NAV } from "@/modules/repuestos/hub/nav";
import { TALLER_HUB_NAV } from "@/modules/taller/hub/nav";
import type { IUser } from "@/types/global";
import { CODIESEL_EMPRESA_ID, MENU_ID_BY_ROUTE, ROUTES } from "@/utils/constants";
import { filterHubItems, toPermissionIdSet } from "@/components/shared/hub/filter-hub-items";
import type { HubFilterOptions, HubNavItem } from "@/components/shared/hub/types";

const SUBMENU: HubFilterOptions = { permission: "submenu" };
const TRIMENU: HubFilterOptions = { permission: "trimenu" };
const CODIESEL_SUBMENU: HubFilterOptions = {
  permission: "submenu",
  requiredEmpresaId: CODIESEL_EMPRESA_ID,
};

/**
 * Mismo catálogo (nav, sin Lucide) + filter que cada *Hub.tsx.
 * Si el hub quedaría vacío para la empresa actual, el ítem no va en el sidebar.
 */
export const SIDEBAR_HUB_ACCESS: Record<string, { items: HubNavItem[]; filter: HubFilterOptions }> = {
  "/dashboard/administracion": { items: ADMINISTRACION_HUB_NAV, filter: SUBMENU },
  "/dashboard/nomina": { items: NOMINA_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/cotizar": { items: COTIZAR_HUB_NAV, filter: SUBMENU },
  "/dashboard/informes": { items: INFORMES_ROOT_HUB_NAV, filter: SUBMENU },
  "/dashboard/taller": { items: TALLER_HUB_NAV, filter: SUBMENU },
  "/dashboard/repuestos": { items: REPUESTOS_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/contact-center": { items: CONTACT_CENTER_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/checklist": { items: CHECKLIST_HUB_NAV, filter: SUBMENU },
  "/dashboard/ordenes-tot": { items: ORDENES_TOT_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/indicadores": { items: INDICADORES_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/encuestas": { items: ENCUESTAS_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/auditoria": { items: AUDITORIA_HUB_NAV, filter: CODIESEL_SUBMENU },
  "/dashboard/mantenimiento": { items: MANTENIMIENTO_HUB_NAV, filter: CODIESEL_SUBMENU },
};

/** Hubs de segundo nivel (Informes → Postventa / Gestión Humana). */
export const SIDEBAR_NESTED_HUBS: Record<string, { items: HubNavItem[]; filter: HubFilterOptions }> = {
  "/dashboard/informes/gestion-humana": {
    items: GESTION_HUMANA_HUB_NAV,
    filter: TRIMENU,
  },
  "/dashboard/informes/postventa": {
    items: POSTVENTA_HUB_NAV,
    filter: TRIMENU,
  },
};

export function isSidebarHubVisible(path: string, user: IUser | null): boolean {
  const hub = SIDEBAR_HUB_ACCESS[path];
  if (!hub) return true;
  return filterHubItems(hub.items, user, hub.filter).length > 0;
}

export function getVisibleSidebarRoutes(user: IUser | null) {
  const hasMenuPermissions = Array.isArray(user?.menus_permitidos);
  const menusPermitidos = toPermissionIdSet(user?.menus_permitidos);

  return ROUTES.filter((route) => {
    if (route.hideForPerfiles?.includes(Number(user?.perfil_postventa))) {
      return false;
    }

    if (route.alwaysVisible || route.path === "/dashboard") {
      return isSidebarHubVisible(route.path, user);
    }

    if (hasMenuPermissions) {
      const menuId = MENU_ID_BY_ROUTE[route.path];
      if (!menuId || !menusPermitidos.has(menuId)) {
        return false;
      }
    }

    return isSidebarHubVisible(route.path, user);
  });
}
