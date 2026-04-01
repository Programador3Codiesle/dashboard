import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ControlComprasAPI {
  numero: number;
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
  calificacionAbc: string | null;
  ultimaCompra: string | null;
  ultimaVenta: string | null;
  giron: number;
  chevropartes: number;
  barranca: number;
  rosita: number;
  villa: number;
  solochevrolet: number;
}

export interface ControlCompras extends ControlComprasAPI {}

export interface FiltrosControlCompras {
  orden: number;
  pagina?: number;
  limite?: number;
}

export const controlComprasService = {
  async listar(
    filtros: FiltrosControlCompras,
  ): Promise<{ items: ControlCompras[]; total: number }> {
    const params = new URLSearchParams({ orden: String(filtros.orden) });
    if (filtros.pagina != null) params.append("pagina", String(filtros.pagina));
    if (filtros.limite != null) params.append("limite", String(filtros.limite));

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-control-compras?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el informe de control de compras.");
    }

    const data: { items: ControlComprasAPI[]; total: number } = await response.json();
    return {
      items: data?.items ?? [],
      total: data?.total ?? 0,
    };
  },
};

