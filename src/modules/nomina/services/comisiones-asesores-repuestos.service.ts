import { apiClient } from '@/lib/api-client';

export interface ComisionAsesorRepuesto {
  sede: string;
  nombre: string;
  ventaNeta: number;
  margenBruto: number;
  utilidadBruta: number;
  comisionPorcentaje: number;
  valorComision: number;
  comisionVentasPorcentaje: number;
  valorComisionVentas: number;
  totalComision: number;
  color: string;
}

export interface DetalleComisionAsesorRepuesto {
  nombre: string;
  subtotal: number;
  descuento: number;
  ventaNeta: number;
  costoNeto: number;
  utilidad: number;
  margenBruto: number;
  tipo: string;
}

export const comisionesAsesoresRepuestosService = {
  async listar(params: {
    mes: number;
    ano: number;
    asesorNombre?: string | null;
  }): Promise<ComisionAsesorRepuesto[]> {
    const query = new URLSearchParams();
    query.set('mes', String(params.mes));
    query.set('ano', String(params.ano));
    if (params.asesorNombre && params.asesorNombre.trim() !== '') {
      query.set('asesorNombre', params.asesorNombre.trim());
    }

    const response = await apiClient.get<ComisionAsesorRepuesto[]>(
      `/nomina/comisiones-asesores-repuestos?${query.toString()}`,
    );
    return response.data;
  },

  async obtenerDetalle(params: {
    nom: string;
    sede: string;
    mes: number;
    ano: number;
  }): Promise<DetalleComisionAsesorRepuesto[]> {
    const query = new URLSearchParams();
    query.set('nom', params.nom);
    query.set('sede', params.sede);
    query.set('mes', String(params.mes));
    query.set('ano', String(params.ano));

    const response = await apiClient.get<DetalleComisionAsesorRepuesto[]>(
      `/nomina/comisiones-asesores-repuestos/detalle?${query.toString()}`,
    );
    return response.data;
  },
};

