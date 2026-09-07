import { apiClient } from '@/lib/api-client';

export interface PqrNpsItem {
  pqrNpsId: number | null;
  fuente: string;
  id: number;
  sede: string;
  area: string;
  fecha: string;
  placa: string;
  cliente: string;
  modeloVh: string;
  orden: string;
  mail: string;
  telefono: string;
  servicio: string | null;
  satisfaccionConcesionario: string | null;
  satisfaccionTrabajo: string | null;
  vhReparadoOk: string | null;
  recomendacionMarca: string | null;
  comentarios: string | null;
  tecnico: string;
  tipificacionEncuesta: string | null;
  contactoCliente: string | null;
  estadoCaso: string | null;
  comentariosFinalCaso: string | null;
  tipificacionCierre: string | null;
}

export type EstadoPqr = 'abiertos' | 'cerrados' | 'todos';

export interface GestionPqrPayload {
  fuente: string;
  idFuente: number;
  postVenta: 1 | 2;
  tecnico: string;
  tipificacionEncuesta: string;
  estadoCaso: 'Abierto' | 'Cerrado';
  comentariosFinalCaso: string;
  tipificacionCierre: string;
}

export interface CrearPqrPayload {
  fuente: string;
  sede: string;
  fecha: string;
  placa: string;
  cliente: string;
  modeloVh: string;
  orden: string;
  mail: string;
  telefono: string;
  tecnico: string;
  comentarios: string;
}

export interface VerbalizacionPayload {
  idPqrNps: number;
  contacto: string;
  verbalizacion: string;
}

export interface VerbalizacionItem {
  contacto: string;
  verbalizacion: string;
  fechaContacto: string;
}

export interface GestionPqrResponse {
  id: number;
  postVenta: number;
  fuente: string;
  estadoCaso: string;
  tipificacionEncuesta: string;
  tipificacionCierre: string;
  comentariosFinalCaso: string;
}

export interface TecnicoPqrItem {
  documento: string;
  nombre: string;
}

export interface VehiculoPqrInfo {
  serie: string;
  modelo: string;
  nombres: string;
  nit: string;
  mail: string;
  celular: string;
}

export type PqrNpsListado = {
  items: PqrNpsItem[];
  total: number;
  pagina: number;
  limite: number;
};

const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_ROWS = 5000;

export const pqrNpsService = {
  async listar(
    estado: EstadoPqr = 'abiertos',
    options?: { pagina?: number; limite?: number; q?: string },
  ): Promise<PqrNpsListado> {
    const params = new URLSearchParams();
    params.append('estado', estado);
    if (options?.pagina) params.append('pagina', String(options.pagina));
    if (options?.limite) params.append('limite', String(options.limite));
    if (options?.q?.trim()) params.append('q', options.q.trim());

    const { data } = await apiClient.get<PqrNpsListado>(
      `/informes/postventa/pqr-nps?${params.toString()}`,
    );

    return data;
  },

  async listarParaExportar(
    estado: EstadoPqr = 'abiertos',
    q?: string,
  ): Promise<{ items: PqrNpsItem[]; total: number; truncated: boolean }> {
    const first = await pqrNpsService.listar(estado, {
      pagina: 1,
      limite: EXPORT_PAGE_SIZE,
      q,
    });
    const items = [...(first.items ?? [])];
    const total = first.total ?? items.length;
    const maxPages = Math.ceil(EXPORT_MAX_ROWS / EXPORT_PAGE_SIZE);
    const totalPages = Math.min(Math.ceil(total / EXPORT_PAGE_SIZE) || 1, maxPages);

    for (let pagina = 2; pagina <= totalPages; pagina++) {
      const page = await pqrNpsService.listar(estado, {
        pagina,
        limite: EXPORT_PAGE_SIZE,
        q,
      });
      items.push(...(page.items ?? []));
      if (items.length >= EXPORT_MAX_ROWS) break;
    }

    const clipped = items.slice(0, EXPORT_MAX_ROWS);
    return {
      items: clipped,
      total,
      truncated: clipped.length < total,
    };
  },

  async obtenerGestion(fuente: string, idFuente: number): Promise<GestionPqrResponse | null> {
    const params = new URLSearchParams();
    params.append('fuente', fuente);
    params.append('idFuente', String(idFuente));
    const { data } = await apiClient.get<GestionPqrResponse | null>(
      `/informes/postventa/pqr-nps/gestion?${params.toString()}`,
    );
    return data;
  },

  async guardarGestion(payload: GestionPqrPayload): Promise<void> {
    await apiClient.put('/informes/postventa/pqr-nps/gestion', payload);
  },

  async crearPqr(payload: CrearPqrPayload): Promise<void> {
    await apiClient.post('/informes/postventa/pqr-nps/crear-pqr', payload);
  },

  async listarVerbalizaciones(idEncuestaFuente: number): Promise<VerbalizacionItem[]> {
    const { data } = await apiClient.get<VerbalizacionItem[]>(
      `/informes/postventa/pqr-nps/verbalizaciones/${idEncuestaFuente}`,
    );
    return data;
  },

  async crearVerbalizacion(payload: VerbalizacionPayload): Promise<void> {
    await apiClient.post('/informes/postventa/pqr-nps/verbalizaciones', payload);
  },

  async obtenerClientePorNit(nit: string): Promise<string | null> {
    const { data } = await apiClient.get<string | null>(
      `/informes/postventa/pqr-nps/auxiliares/cliente?nit=${encodeURIComponent(nit)}`,
    );
    return data;
  },

  async obtenerInfoVehiculo(placa: string): Promise<VehiculoPqrInfo | null> {
    const { data } = await apiClient.get<VehiculoPqrInfo | null>(
      `/informes/postventa/pqr-nps/auxiliares/vehiculo?placa=${encodeURIComponent(placa)}`,
    );
    return data;
  },

  async listarTecnicos(): Promise<TecnicoPqrItem[]> {
    const { data } = await apiClient.get<TecnicoPqrItem[]>('/informes/postventa/pqr-nps/auxiliares/tecnicos');
    return data;
  },
};

