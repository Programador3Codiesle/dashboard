import type { LucideIcon } from 'lucide-react';

export type HubPermissionMode = 'submenu' | 'trimenu';

export interface HubItem {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: LucideIcon;
  color?: string;
  submenuId?: number;
  trimenuId?: number;
  trimenuIdsAlternativos?: number[];
  empresaId?: number;
  /** Si es true, abre la ruta en una pestaña nueva (enlaces externos). */
  external?: boolean;
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
