import type { GuardarDefinicionParams } from "../types";

function isFilled(value: string | number | undefined | null): boolean {
  return value !== undefined && value !== null && value !== "";
}

export function validarGestionRetorno(
  params: GuardarDefinicionParams,
): string | null {
  const {
    definicion,
    selectRazon,
    obs_razon,
    select_sist_inv,
    obs_sist_inv,
    ordenR,
    tecnicoR,
    selectPlan,
    obs_plan,
    precio_costo_1,
    precio_costo_2,
    precio_costo_3,
    obs_costos,
  } = params;

  if (definicion === 1) {
    const ok =
      isFilled(selectRazon) &&
      obs_razon?.trim() &&
      isFilled(select_sist_inv) &&
      obs_sist_inv?.trim() &&
      isFilled(ordenR) &&
      tecnicoR?.trim() &&
      isFilled(selectPlan) &&
      obs_plan?.trim() &&
      obs_costos?.trim() &&
      isFilled(precio_costo_1) &&
      isFilled(precio_costo_2) &&
      isFilled(precio_costo_3);

    if (!ok) {
      return "Debe completar todos los campos del formulario";
    }
    return null;
  }

  const okNo =
    isFilled(selectRazon) &&
    isFilled(selectPlan) &&
    obs_plan?.trim() &&
    obs_costos?.trim() &&
    isFilled(precio_costo_1) &&
    isFilled(precio_costo_2) &&
    isFilled(precio_costo_3);

  if (!okNo) {
    return "Debe completar todos los campos del formulario";
  }

  return null;
}

export function displayValor(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}
