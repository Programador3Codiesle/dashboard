export const NOMINA_COPY = {
  hubTitle: "Nómina",
  hubDescription:
    "Comisiones, director de flotas y margen de materiales del colorista.",
} as const;

export const NOMINA_STYLES = {
  input:
    "border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full",
  detailBtn:
    "inline-flex items-center rounded-lg brand-bg px-2 py-1 text-white brand-bg-hover transition-colors",
} as const;

/** Perfiles de asesor: el listado se filtra al nombre de la sesión. */
export const PERFILES_COMISIONES_ASESORES_FILTRO_SESION = [34, 4] as const;
