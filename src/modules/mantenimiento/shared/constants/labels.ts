export const BODEGAS_FILTRO_EQUIPOS = [
  { value: 'Giron', label: 'Giron' },
  { value: 'Barrancabermeja', label: 'Barrancabermeja' },
  { value: 'Rosita', label: 'Rosita' },
  { value: 'Cucuta', label: 'Cucuta' },
];

export const AREAS_FILTRO = [
  { value: 'Lamina y pintura', label: 'Lamina y pintura' },
  { value: 'Gasolina', label: 'Gasolina' },
  { value: 'Mecanica diesel', label: 'Mecanica diesel' },
  { value: 'Alistamiento', label: 'Alistamiento' },
  { value: 'Chevy express', label: 'Chevy express' },
];

export const BODEGAS_LETRA = [
  { value: 'B', label: 'Barrancabermeja' },
  { value: 'C', label: 'Cucuta' },
  { value: 'G', label: 'Giron' },
  { value: 'R', label: 'Rosita' },
];

export const AREAS_LETRA = [
  { value: 'L', label: 'Lamina y pintura' },
  { value: 'M', label: 'Gasolina' },
  { value: 'D', label: 'Mecanica diesel' },
  { value: 'A', label: 'Alistamiento' },
  { value: 'X', label: 'Chevy express' },
];

export const SEDES_INFORME_PREVENTIVO = [
  { value: 'Barrancabermeja', label: 'Barrancabermeja' },
  { value: 'Cucuta', label: 'Cúcuta' },
  { value: 'Giron', label: 'Girón' },
];

export function estadoLabel(estado: number | string, tipo: 'prev' | 'corr') {
  const e = Number(estado);
  if (tipo === 'prev') {
    if (e === 1) return 'Pendiente';
    if (e === 2) return 'En proceso';
    if (e === 3) return 'Realizado';
  } else {
    if (e === 1) return 'Pendiente';
    if (e === 2) return 'En proceso';
    if (e === 3) return 'Finalizada';
  }
  return String(estado);
}

export function urgenciaLabel(u: number | string) {
  const n = Number(u);
  if (n === 1) return 'Leve';
  if (n === 2) return 'Moderada';
  if (n === 3) return 'Urgente';
  return String(u);
}
