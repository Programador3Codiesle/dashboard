import { useQuery } from "@tanstack/react-query";
import { cotizadorInformesService, CotizacionResumen, TipoCotizacion } from "../services/cotizador-informes.service";

export const INFORME_COTIZACIONES_QUERY_KEY = (tipo: TipoCotizacion, dateStart: string, dateEnd: string) =>
  ["cotizador", "informe-cotizaciones", tipo, dateStart, dateEnd] as const;

export function useInformeCotizaciones(tipo: TipoCotizacion, dateStart: string, dateEnd: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CotizacionResumen[]>({
    queryKey: INFORME_COTIZACIONES_QUERY_KEY(tipo, dateStart, dateEnd),
    queryFn: () => cotizadorInformesService.listar(tipo, { dateStart, dateEnd }),
    enabled: !!dateStart && !!dateEnd,
    staleTime: 2 * 60 * 1000,
  });

  return {
    cotizaciones: data ?? [],
    loading: isLoading,
    error: error ? "No se pudo cargar el informe de cotizaciones." : null,
    refetch,
  };
}

