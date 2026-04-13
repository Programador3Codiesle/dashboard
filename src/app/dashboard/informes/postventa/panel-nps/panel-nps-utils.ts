export const SEDES_CON_MATRIZ_TECNICOS = [
  'giron',
  'rosita',
  'barranca',
  'bocono',
] as const;

export function nombreMes(mesNumero: number) {
  const nombres = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  if (mesNumero < 1 || mesNumero > 12) return `${mesNumero}`;
  return nombres[mesNumero - 1];
}

export function badgeClassNpsNullable(nps: number | null) {
  if (nps === null) return 'bg-slate-300 text-slate-800';
  if (nps >= 80) return 'bg-emerald-500 text-white';
  return 'bg-red-500 text-white';
}

export function puntosAlineadosAVentana(
  puntos: { mes: number; nps: number }[],
  mesesVentana: number[],
): { mes: number; nps: number | null }[] {
  return mesesVentana.map((mes) => {
    const p = puntos.find((x) => x.mes === mes);
    return { mes, nps: p?.nps ?? null };
  });
}
