export function buildDatosInd(
  indicadores: Array<{ idIndicador: number; nombres: string; puntuacion: number }>,
): string {
  return indicadores
    .map((i) => `${i.idIndicador},${i.nombres},${i.puntuacion}`)
    .join(',');
}
