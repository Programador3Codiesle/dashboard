export const PERIODOS_MTTO = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral (cada 3 meses)' },
  { value: 'semestral', label: 'Semestral (cada 6 meses)' },
  { value: 'anual', label: 'Anual' },
] as const;

export type PeriodoMttoForm = {
  id?: number;
  periodo: string;
  fecha_inicio: string;
  descripcion: string;
};

export function periodoMttoLabel(periodo: string): string {
  const v = periodo.trim();
  if (!v) return 'No aplica';
  return PERIODOS_MTTO.find((p) => p.value === v)?.label ?? v;
}

export function addMonthsYmd(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function nextFechaPorPeriodo(ymd: string, periodo: string): string {
  switch (periodo) {
    case 'semanal':
      return addDaysYmd(ymd, 7);
    case 'quincenal':
      return addDaysYmd(ymd, 14);
    case 'mensual':
      return addMonthsYmd(ymd, 1);
    case 'trimestral':
      return addMonthsYmd(ymd, 3);
    case 'semestral':
      return addMonthsYmd(ymd, 6);
    case 'anual':
      return addMonthsYmd(ymd, 12);
    default:
      return '';
  }
}

export function errorPeriodosMtto(items: PeriodoMttoForm[]): string | null {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.periodo && !item.fecha_inicio && !item.descripcion.trim()) continue;
    if (!item.descripcion.trim()) {
      return `Indique la descripción para ${item.periodo ? periodoMttoLabel(item.periodo) : 'el periodo'}`;
    }
    if (!item.periodo) return 'Seleccione un periodo de preventivo';
    if (!item.fecha_inicio) {
      return `Indique la fecha de inicio para ${periodoMttoLabel(item.periodo)}`;
    }
    if (seen.has(item.periodo)) {
      return `El periodo ${periodoMttoLabel(item.periodo)} está duplicado`;
    }
    seen.add(item.periodo);
  }
  return null;
}

export type DatosTecnicosForm = {
  alimentacion: string;
  frecuencia_alimentacion: string;
  anio_fabricacion: string;
  numero_serie: string;
  potencia_consumo: string;
  peso: string;
  revolucion: string;
};

export type DatosHidraulicosForm = {
  capacidad_litros: string;
  capacidad_carga_tn: string;
  tipo_aceite: string;
  capacidad_maxima_carga: string;
};

export const emptyTecnicos = (): DatosTecnicosForm => ({
  alimentacion: '',
  frecuencia_alimentacion: '',
  anio_fabricacion: '',
  numero_serie: '',
  potencia_consumo: '',
  peso: '',
  revolucion: '',
});

export const emptyHidraulicos = (): DatosHidraulicosForm => ({
  capacidad_litros: '',
  capacidad_carga_tn: '',
  tipo_aceite: '',
  capacidad_maxima_carga: '',
});

export function appendHojaVidaToForm(
  form: FormData,
  data: {
    fabricante: string;
    modelo: string;
    marca: string;
    ubicacion: string;
    sector: string;
    descripcion: string;
    dist_nombre: string;
    dist_direccion: string;
    dist_telefono: string;
    dist_ciudad: string;
    dist_departamento: string;
    dist_redes_sociales: string;
    tiene_tecnicos: boolean;
    tiene_hidraulicos: boolean;
    tecnicos: DatosTecnicosForm;
    hidraulicos: DatosHidraulicosForm;
    elementos: string[];
    recomendaciones: string[];
    mtto_operativo: string[];
    periodos_mtto: PeriodoMttoForm[];
    file?: File | null;
  },
) {
  form.append('fabricante', data.fabricante);
  form.append('modelo', data.modelo);
  form.append('marca', data.marca);
  form.append('ubicacion', data.ubicacion);
  form.append('sector', data.sector);
  form.append('descripcion', data.descripcion);
  form.append('dist_nombre', data.dist_nombre);
  form.append('dist_direccion', data.dist_direccion);
  form.append('dist_telefono', data.dist_telefono);
  form.append('dist_ciudad', data.dist_ciudad);
  form.append('dist_departamento', data.dist_departamento);
  form.append('dist_redes_sociales', data.dist_redes_sociales);
  form.append('tiene_tecnicos', data.tiene_tecnicos ? '1' : '0');
  form.append('tiene_hidraulicos', data.tiene_hidraulicos ? '1' : '0');
  form.append('tecnicos', JSON.stringify(data.tecnicos));
  form.append('hidraulicos', JSON.stringify(data.hidraulicos));
  form.append(
    'elementos',
    JSON.stringify(data.elementos.filter((t) => t.trim())),
  );
  form.append(
    'recomendaciones',
    JSON.stringify(data.recomendaciones.filter((t) => t.trim())),
  );
  form.append(
    'mtto_operativo',
    JSON.stringify(data.mtto_operativo.filter((t) => t.trim())),
  );
  form.append(
    'periodos_mtto',
    JSON.stringify(
      data.periodos_mtto
        .filter((p) => p.periodo && p.fecha_inicio && p.descripcion.trim())
        .map((p) => ({
          ...(p.id ? { id: p.id } : {}),
          periodo: p.periodo,
          fecha_inicio: p.fecha_inicio,
          descripcion: p.descripcion.trim(),
        })),
    ),
  );
  if (data.file) form.append('file', data.file);
}
