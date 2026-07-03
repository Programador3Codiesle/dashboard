import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { mpviFirmaService } from "../services/mpvi-firma.service";
import type { MpviFirmarPayload } from "../types";

export const MPVI_FIRMA_QUERY_KEYS = {
  validar: (token: string) => ["mpvi", "firma", "validar", token] as const,
};

export function useMpviValidarToken(token: string | null) {
  const tokenNorm = token?.trim() ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: MPVI_FIRMA_QUERY_KEYS.validar(tokenNorm),
    queryFn: () => mpviFirmaService.validarToken(tokenNorm),
    enabled: tokenNorm.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    tokenData: data,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    pdfUrl: tokenNorm ? mpviFirmaService.getPdfUrl(tokenNorm) : null,
  };
}

export function useMpviFirmaActions() {
  const { showSuccess, showError } = useToast();

  const firmar = useMutation({
    mutationFn: (payload: MpviFirmarPayload) => mpviFirmaService.firmar(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess("Firma guardada correctamente");
      } else {
        showError("Hubo un error al guardar la firma");
      }
    },
    onError: (err: Error) => showError(err.message),
  });

  return { firmar };
}
