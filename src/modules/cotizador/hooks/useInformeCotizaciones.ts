import { useQuery } from "@tanstack/react-query";
import { cotizadorInformesService, CotizacionResumen, TipoCotizacion } from "../services/cotizador-informes.service";
import { useAuth } from "@/core/auth/hooks/useAuth";

export const INFORME_COTIZACIONES_QUERY_KEY = (
  tipo: TipoCotizacion,
  dateStart: string,
  dateEnd: string,
  empresaKey: string,
) => ["cotizador", "informe-cotizaciones", tipo, dateStart, dateEnd, empresaKey] as const;

export function useInformeCotizaciones(tipo: TipoCotizacion, dateStart: string, dateEnd: string) {
  const { user } = useAuth();
  const empresaId = user?.empresa;
  const empresaKey = empresaId != null ? String(empresaId) : "sin-empresa";

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CotizacionResumen[]>({
    queryKey: INFORME_COTIZACIONES_QUERY_KEY(tipo, dateStart, dateEnd, empresaKey),
    queryFn: () =>
      cotizadorInformesService.listar(tipo, {
        dateStart,
        dateEnd,
        empresa: empresaId,
      }),
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

