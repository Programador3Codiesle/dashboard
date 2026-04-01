import { apiClient } from "@/lib/api-client";

export interface KpiSedeMensual {
  sede: string;
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;
}

export interface KpiTecnicoMensual {
  operario: string;
  tecnico: string;
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;
}

export interface KpiTecnicoDetallado {
  operario: string;
  tecnico: string;
  ot: KpiTecnicoMensual;
  repuestos: KpiTecnicoMensual;
  manoObra: KpiTecnicoMensual;
}

export interface KpiResumen {
  mantenimientoPreventivo: KpiSedeMensual[];
  cargoCliente: KpiSedeMensual[];
  tecnicos: KpiTecnicoDetallado[];
}

export const kpiService = {
  async obtenerResumen(): Promise<KpiResumen> {
    const response = await apiClient.get<KpiResumen>("/informes/postventa/kpi");
    return response.data;
  },
};

