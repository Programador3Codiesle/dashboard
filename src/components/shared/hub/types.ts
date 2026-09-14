import type { LucideIcon } from 'lucide-react';

export type HubPermissionMode = 'submenu' | 'trimenu';

/** Datos del hub sin iconos Lucide — lo usa el sidebar para no arrastrar todos los módulos. */
export interface HubNavItem {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  color?: string;
  submenuId?: number;
  /** Visible sin id_submenu (legado sin fila en postv_submenu). */
  sinSubmenu?: boolean;
  trimenuId?: number;
  trimenuIdsAlternativos?: number[];
  empresaId?: number;
  /** Si es true, abre la ruta en una pestaña nueva (enlaces externos). */
  external?: boolean;
}

export interface HubItem extends HubNavItem {
  icono: LucideIcon;
}

export type HubCardVariant = 'gradient' | 'border';

export interface HubFilterOptions {
  permission?: HubPermissionMode;
  requiredEmpresaId?: number;
}

export interface SubmodulosHubProps {
  title: string;
  description: string;
  items: HubItem[];
  filter?: HubFilterOptions;
  variant?: HubCardVariant;
  titleClassName?: string;
  gridClassName?: string;
  emptyWhenFiltered?: boolean;
}
