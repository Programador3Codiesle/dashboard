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

export const pqrNpsService = {
  async listar(estado: EstadoPqr = 'abiertos'): Promise<PqrNpsItem[]> {
    const params = new URLSearchParams();
    params.append('estado', estado);

    const { data } = await apiClient.get<PqrNpsItem[]>(
      `/informes/postventa/pqr-nps?${params.toString()}`,
    );

    return data;
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

