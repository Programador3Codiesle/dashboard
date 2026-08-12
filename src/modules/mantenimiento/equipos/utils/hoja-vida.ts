export const PERIODOS_MTTO = [
  { value: '', label: 'No aplica' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral (cada 3 meses)' },
  { value: 'semestral', label: 'Semestral (cada 6 meses)' },
  { value: 'anual', label: 'Anual' },
] as const;

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
    periodo_mtto_preventivo: string;
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
    file?: File | null;
  },
) {
  form.append('fabricante', data.fabricante);
  form.append('modelo', data.modelo);
  form.append('marca', data.marca);
  form.append('ubicacion', data.ubicacion);
  form.append('sector', data.sector);
  form.append('descripcion', data.descripcion);
  form.append('periodo_mtto_preventivo', data.periodo_mtto_preventivo);
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
  if (data.file) form.append('file', data.file);
}
