import { useMutation } from "@tanstack/react-query";
import { pygAsesoresRepuestosService } from "../services/pyg-asesores-repuestos.service";
import type { GenerarInformeParams } from "../types";

export function useGenerarPygAsesoresRepuestos() {
  const mutation = useMutation({
    mutationFn: (params: GenerarInformeParams) =>
      pygAsesoresRepuestosService.generar(params),
  });

  return {
    generar: mutation.mutateAsync,
    data: mutation.data,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    reset: mutation.reset,
  };
}
