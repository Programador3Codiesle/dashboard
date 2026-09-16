/** Cotizacion.php ValidarCheckList — mismos literales y ramas. */

export const MSG_MANDATORIO =
  "Este repuesto es mandatorio, por lo tanto si no se realiza perderás la garantía de su vehículo, en caso de que aún cuente con garantía.";
export const MSG_MANDATORIO_CODIESEL =
  "Este repuesto es recomendado por CODIESEL.";
export const MSG_MO_MANTENIMIENTO = "El mantenimiento no se puede desmarcar";

export function esCategoriaMandatorio(
  categoria: string | null | undefined,
): boolean {
  return categoria === "MANDATORIO" || categoria === "MANDATORIO CODIESEL";
}

export function mensajeAlertaMandatorio(categoria: string): string {
  return categoria === "MANDATORIO CODIESEL"
    ? MSG_MANDATORIO_CODIESEL
    : MSG_MANDATORIO;
}

export function esManoObraMantenimientoBloqueada(
  descripcion: string,
  operacion: string,
): boolean {
  const clave = "mantenimiento";
  return (
    descripcion.toLowerCase().includes(clave) ||
    operacion.toLowerCase().includes(clave)
  );
}

export type AlertaChecklistLivianos =
  | { tipo: "mandatorio"; seq: number; mensaje: string }
  | { tipo: "mo-bloqueo"; mensaje: string };
