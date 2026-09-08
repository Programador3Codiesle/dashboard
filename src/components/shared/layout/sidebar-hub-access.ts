import { ADMINISTRACION_HUB_ITEMS } from "@/modules/administracion/hub/items";
import { AUDITORIA_HUB_ITEMS } from "@/modules/auditoria/hub/items";
import { CHECKLIST_HUB_ITEMS } from "@/modules/checklist/hub/items";
import { CONTACT_CENTER_HUB_ITEMS } from "@/modules/contact-center/hub/items";
import { COTIZAR_HUB_ITEMS } from "@/modules/cotizar/hub/items";
import { ENCUESTAS_HUB_ITEMS } from "@/modules/encuestas/hub/items";
import { GESTION_HUMANA_HUB_ITEMS } from "@/modules/informes/gestion-humana/hub/items";
import { INFORMES_ROOT_HUB_ITEMS } from "@/modules/informes/hub/root-items";
import { POSTVENTA_HUB_ITEMS } from "@/modules/informes/postventa/hub/items";
import { INDICADORES_HUB_ITEMS } from "@/modules/indicadores/hub/items";
import { MANTENIMIENTO_HUB_ITEMS } from "@/modules/mantenimiento/hub/items";
import { NOMINA_HUB_ITEMS } from "@/modules/nomina/hub/items";
import { ORDENES_TOT_HUB_ITEMS } from "@/modules/ordenes-tot/hub/items";
import { REPUESTOS_HUB_ITEMS } from "@/modules/repuestos/hub/items";
import { TALLER_HUB_ITEMS } from "@/modules/taller/hub/items";
import type { IUser } from "@/types/global";
import { CODIESEL_EMPRESA_ID, MENU_ID_BY_ROUTE, ROUTES } from "@/utils/constants";
import { filterHubItems, toPermissionIdSet } from "@/components/shared/hub/filter-hub-items";
import type { HubFilterOptions, HubItem } from "@/components/shared/hub/types";

const SUBMENU: HubFilterOptions = { permission: "submenu" };
const TRIMENU: HubFilterOptions = { permission: "trimenu" };
const CODIESEL_SUBMENU: HubFilterOptions = {
  permission: "submenu",
  requiredEmpresaId: CODIESEL_EMPRESA_ID,
};

/**
 * Mismos items + filter que cada *Hub.tsx.
 * Si el hub quedaría vacío para la empresa actual, el ítem no va en el sidebar.
 */
export const SIDEBAR_HUB_ACCESS: Record<string, { items: HubItem[]; filter: HubFilterOptions }> = {
  "/dashboard/administracion": { items: ADMINISTRACION_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/nomina": { items: NOMINA_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/cotizar": { items: COTIZAR_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/informes": { items: INFORMES_ROOT_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/taller": { items: TALLER_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/repuestos": { items: REPUESTOS_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/contact-center": { items: CONTACT_CENTER_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/checklist": { items: CHECKLIST_HUB_ITEMS, filter: SUBMENU },
  "/dashboard/ordenes-tot": { items: ORDENES_TOT_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/indicadores": { items: INDICADORES_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/encuestas": { items: ENCUESTAS_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/auditoria": { items: AUDITORIA_HUB_ITEMS, filter: CODIESEL_SUBMENU },
  "/dashboard/mantenimiento": { items: MANTENIMIENTO_HUB_ITEMS, filter: CODIESEL_SUBMENU },
};

/** Hubs de segundo nivel (Informes → Postventa / Gestión Humana). */
export const SIDEBAR_NESTED_HUBS: Record<string, { items: HubItem[]; filter: HubFilterOptions }> = {
  "/dashboard/informes/gestion-humana": {
    items: GESTION_HUMANA_HUB_ITEMS,
    filter: TRIMENU,
  },
  "/dashboard/informes/postventa": {
    items: POSTVENTA_HUB_ITEMS,
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
    if (route.path === "/dashboard") {
      return true;
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
