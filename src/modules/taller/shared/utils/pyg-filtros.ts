export type PygFiltrosState = {
  yearOne: string;
  monthOne: string;
  monthTwo: string;
  yearTwo: string;
};

export type PygFiltrosChangeResult =
  | { ok: true }
  | { ok: false; message: string; clearYearTwo: boolean };

export function evaluatePygFiltrosChange(
  next: PygFiltrosState,
): PygFiltrosChangeResult {
  if (
    next.yearOne &&
    next.yearTwo &&
    Number(next.yearTwo) >= Number(next.yearOne)
  ) {
    return {
      ok: false,
      message: "Debe seleccionar un año a comparar menor al año del informe",
      clearYearTwo: true,
    };
  }

  if (next.monthOne && next.monthTwo && next.monthOne > next.monthTwo) {
    return {
      ok: false,
      message: "El mes DESDE debe ser menor o igual que el mes HASTA",
      clearYearTwo: false,
    };
  }

  return { ok: true };
}

export function pygFiltrosGenerarError(
  filtros: PygFiltrosState,
): string | null {
  const { yearOne, monthOne, monthTwo, yearTwo } = filtros;

  if (!yearOne || !monthOne || !monthTwo || !yearTwo) {
    return "Por favor verifique que haya diligenciado todos los campos";
  }

  if (Number(yearTwo) >= Number(yearOne)) {
    return "Debe seleccionar un año a comparar menor al año del informe";
  }

  if (monthOne > monthTwo) {
    return "El mes DESDE debe ser menor o igual que el mes HASTA";
  }

  return null;
}
