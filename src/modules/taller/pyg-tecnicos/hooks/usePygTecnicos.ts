import { useMutation } from "@tanstack/react-query";
import { pygTecnicosService } from "../services/pyg-tecnicos.service";
import type { GenerarInformeParams } from "../types";

export function useGenerarPygTecnicos() {
  const mutation = useMutation({
    mutationFn: (params: GenerarInformeParams) =>
      pygTecnicosService.generar(params),
  });

  return {
    generar: mutation.mutateAsync,
    data: mutation.data,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    reset: mutation.reset,
  };
}
