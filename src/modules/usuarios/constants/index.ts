export const USUARIOS_PAGE_SIZE = 10;

export const USUARIOS_COPY = {
  title: "Usuarios",
  footer:
    "*Datos mostrados utilizando la lógica conectada a la API de usuarios.",
  searchPlaceholder: "Buscar usuario...",
  loading: "Cargando usuarios...",
  emptySearch: "No hay usuarios que coincidan con la búsqueda.",
  emptyList: "No hay usuarios disponibles.",
  fetching: "Buscando...",
} as const;

export const USUARIOS_STYLES = {
  marcasBadge: "brand-badge border brand-border-active",
  marcasLoading:
    "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium brand-bg-light brand-text border brand-border-active",
  fetchingBadge:
    "inline-flex items-center gap-1.5 rounded-full border brand-border-active brand-bg-light px-2.5 py-0.5 text-xs font-medium brand-text",
  empresasHint: "p-3 brand-bg-light border brand-border-active rounded-md mb-4",
  empresasHintText: "text-xs brand-text m-0",
} as const;

export const USUARIOS_SEDE_ACTIVA_COLOR = "#059669";

export const empresasDisponibles = [
  { id: "1", nombre: "Codiesel", logo: "🚗" },
  { id: "2", nombre: "Dieselco", logo: "🔧" },
  { id: "3", nombre: "Mitsubishi", logo: "⚡" },
  { id: "4", nombre: "BYD", logo: "🔋" },
];

export const SEDES_DISPONIBLES = [
  "Barrancabermeja",
  "Bocono",
  "Bucaramanga",
  "Chevropartes",
  "CODINOVA",
  "Dieselco",
  "Giron",
  "Malecon",
  "Rosita",
  "Tunja",
];

export const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
