import { filterHubItems } from "@/components/shared/hub/filter-hub-items";
import type { HubItem } from "@/components/shared/hub/types";
import {
  puedeVerTodosLosTickets,
  TICKETS_TAB_ITEMS,
} from "@/modules/tickets/constants";
import type { IUser } from "@/types/global";
import type { LucideIcon } from "lucide-react";
import {
  getVisibleSidebarRoutes,
  SIDEBAR_HUB_ACCESS,
  SIDEBAR_NESTED_HUBS,
} from "./sidebar-hub-access";

export interface SidebarSearchHit {
  id: string;
  nombre: string;
  descripcion?: string;
  ruta: string;
  icono: LucideIcon;
  crumbs: string[];
  external?: boolean;
  haystack: string;
}

const SEARCH_LIMIT = 30;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toHit(
  id: string,
  nombre: string,
  ruta: string,
  icono: LucideIcon,
  crumbs: string[],
  extra?: Pick<HubItem, "descripcion" | "external">,
): SidebarSearchHit {
  const descripcion = extra?.descripcion;
  return {
    id,
    nombre,
    descripcion,
    ruta,
    icono,
    crumbs,
    external: extra?.external,
    haystack: normalizeSearchText(
      [nombre, descripcion ?? "", crumbs.join(" ")].join(" "),
    ),
  };
}

export function getSidebarSearchCatalog(user: IUser | null): SidebarSearchHit[] {
  const hits: SidebarSearchHit[] = [];

  for (const route of getVisibleSidebarRoutes(user)) {
    hits.push(toHit(`route:${route.path}`, route.name, route.path, route.icon, []));

    if (route.path === "/dashboard/tickets") {
      for (const tab of TICKETS_TAB_ITEMS) {
        if (tab.requiresVerTodos && !puedeVerTodosLosTickets(user?.perfil_postventa)) {
          continue;
        }
        hits.push(
          toHit(`tickets:${tab.id}`, tab.name, tab.href, route.icon, [route.name]),
        );
      }
    }

    const hub = SIDEBAR_HUB_ACCESS[route.path];
    if (!hub) continue;

    const visibleItems = filterHubItems(hub.items, user, hub.filter);
    for (const item of visibleItems) {
      hits.push(
        toHit(`hub:${route.path}:${item.id}`, item.nombre, item.ruta, item.icono, [route.name], item),
      );

      const nested = SIDEBAR_NESTED_HUBS[item.ruta];
      if (!nested) continue;

      const nestedItems = filterHubItems(nested.items, user, nested.filter);
      for (const child of nestedItems) {
        hits.push(
          toHit(
            `hub:${item.ruta}:${child.id}`,
            child.nombre,
            child.ruta,
            child.icono,
            [route.name, item.nombre],
            child,
          ),
        );
      }
    }
  }

  return hits;
}

function scoreHit(hit: SidebarSearchHit, query: string, tokens: string[]): number {
  const name = normalizeSearchText(hit.nombre);
  const crumbs = normalizeSearchText(hit.crumbs.join(" "));
  let score = 0;

  if (name === query) score += 120;
  else if (name.startsWith(query)) score += 90;
  else if (name.includes(query)) score += 70;

  if (tokens.every((token) => name.includes(token))) score += 40;
  if (crumbs.includes(query) || tokens.every((token) => crumbs.includes(token))) score += 20;
  if (hit.haystack.includes(query)) score += 10;

  return score;
}

export function searchSidebarCatalog(
  catalog: SidebarSearchHit[],
  rawQuery: string,
): SidebarSearchHit[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];

  const tokens = query.split(" ").filter(Boolean);

  return catalog
    .filter((hit) => tokens.every((token) => hit.haystack.includes(token)))
    .map((hit) => ({ hit, score: scoreHit(hit, query, tokens) }))
    .sort((a, b) => b.score - a.score || a.hit.nombre.localeCompare(b.hit.nombre, "es"))
    .slice(0, SEARCH_LIMIT)
    .map(({ hit }) => hit);
}
