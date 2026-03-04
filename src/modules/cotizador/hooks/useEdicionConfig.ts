import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AplicarEdicionResult,
  EdicionClaseOption,
  TablaConfigEntry,
  TablaKeyEdicion,
  cotizadorEdicionConfigService,
} from "../services/cotizador-edicion-config.service";

export const EDICION_CONFIG_KEYS = {
  tablas: ["cotizador", "edicion", "tablas"] as const,
  clases: (tablaKey: TablaKeyEdicion | null) =>
    ["cotizador", "edicion", "clases", tablaKey ?? "none"] as const,
  filtroOpciones: (
    tablaKey: TablaKeyEdicion | null,
    filtro: string | null,
    whereKey: string
  ) => ["cotizador", "edicion", "filtro-opciones", tablaKey ?? "none", filtro ?? "none", whereKey] as const,
};

export function useEdicionTablas() {
  const { data, isLoading, error } = useQuery<TablaConfigEntry[]>({
    queryKey: EDICION_CONFIG_KEYS.tablas,
    queryFn: () => cotizadorEdicionConfigService.getTablas(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo cargar la configuración de tablas." : null,
  };
}

export function useEdicionClases(tablaKey: TablaKeyEdicion | null) {
  const { data, isLoading, error } = useQuery<EdicionClaseOption[]>({
    queryKey: EDICION_CONFIG_KEYS.clases(tablaKey),
    queryFn: () => cotizadorEdicionConfigService.getClases(tablaKey as TablaKeyEdicion),
    enabled: !!tablaKey,
    staleTime: 10 * 60 * 1000,
  });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudieron cargar las clases." : null,
  };
}

export function useEdicionFiltroOpciones(params: {
  tablaKey: TablaKeyEdicion | null;
  filtro: string | null;
  whereParcial: Record<string, string | number | null | undefined>;
}) {
  const whereKey = JSON.stringify(params.whereParcial ?? {});

  const { data, isLoading, error } = useQuery<string[]>({
    queryKey: EDICION_CONFIG_KEYS.filtroOpciones(
      params.tablaKey,
      params.filtro,
      whereKey
    ),
    queryFn: () =>
      cotizadorEdicionConfigService.getFiltroOpciones({
        tablaKey: params.tablaKey as TablaKeyEdicion,
        filtro: params.filtro as string,
        whereParcial: params.whereParcial,
      }),
    enabled: !!params.tablaKey && !!params.filtro,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudieron cargar las opciones." : null,
  };
}

export function useAplicarEdicion() {
  return useMutation<
    AplicarEdicionResult,
    Error,
    {
      tablaKey: TablaKeyEdicion;
      filtros: Record<string, string | number>;
      campos: Record<string, string | number>;
    }
  >({
    mutationFn: (payload) =>
      cotizadorEdicionConfigService.aplicarEdicion(payload),
  });
}

