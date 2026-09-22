const STORAGE_KEY = 'mtto-equipos-filtros';

export type FiltrosEquipos = {
  page: number;
  limit: number;
  filter: string;
  bodega: string;
  area: string;
};

export const FILTROS_EQUIPOS_INICIAL: FiltrosEquipos = {
  page: 1,
  limit: 10,
  filter: '',
  bodega: '',
  area: '',
};

export function leerFiltrosEquipos(): FiltrosEquipos {
  if (typeof window === 'undefined') return FILTROS_EQUIPOS_INICIAL;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return FILTROS_EQUIPOS_INICIAL;
    const parsed = JSON.parse(raw) as Partial<FiltrosEquipos>;
    const limit = Number(parsed.limit);
    return {
      page: Number(parsed.page) > 0 ? Number(parsed.page) : 1,
      limit: [10, 20, 30, 50, 100].includes(limit) ? limit : 10,
      filter: typeof parsed.filter === 'string' ? parsed.filter : '',
      bodega: typeof parsed.bodega === 'string' ? parsed.bodega : '',
      area: typeof parsed.area === 'string' ? parsed.area : '',
    };
  } catch {
    return FILTROS_EQUIPOS_INICIAL;
  }
}

export function guardarFiltrosEquipos(filtros: FiltrosEquipos): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
}

export function limpiarFiltrosEquipos(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
