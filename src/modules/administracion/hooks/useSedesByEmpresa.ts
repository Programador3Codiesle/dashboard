"use client";

import { useMemo } from "react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { getSedesByEmpresa } from "../constants";

/**
 * Devuelve las sedes correspondientes a la empresa seleccionada por el usuario
 * (dashboard o modal). Vacío si no hay empresa seleccionada.
 */
export function useSedesByEmpresa(): string[] {
  const { user } = useAuth();
  return useMemo(() => getSedesByEmpresa(user?.empresa), [user?.empresa]);
}
