import { fetchWithAuth } from "@/utils/api";
import { getUser } from "@/utils/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface VehiculoSalidaAPI {
  id: number;
  fecha_salida: string;
  hora_salida: string;
  km_salida: number;
  placa: string;
  tipo_vehiculo: string;
  modelo: string;
  conductor: string;
  pasajeros: string;
  persona_autorizo: string;
  fecha_llegada: string | null;
  hora_llegada: string | null;
  km_llegada: number | null;
  observacion: string | null;
  placa_vh_remolcado: string | null;
  taller: string;
  empresa_nombre: string;
}

export interface ModeloVehiculoAPI {
  id: number;
  descripcion: string;
}

export interface RegistrarSalidaDTO {
  placa: string;
  km_salida: number;
  tipo_vehiculo: string;
  modelo: number;
  taller: string;
  conductor: string;
  persona_autorizo: string;
  pasajeros: string;
  porteria?: number;
  id_empresa?: number;
  otra_marca?: string;
  placa_vh_remolcado?: string;
}

export interface RegistrarLlegadaDTO {
  km_llegada: number;
  observacion: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ========== Servicio ==========

export const controlVehiculosService = {
  /**
   * Listar todos los registros de salida y llegada
   */
  async listarRegistros(): Promise<VehiculoSalidaAPI[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/control-vehiculos`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar los registros de vehículos");
    }

    const data: VehiculoSalidaAPI[] = await response.json();
    return data;
  },

  /**
   * Obtener modelos de vehículos disponibles
   */
  async obtenerModelos(): Promise<ModeloVehiculoAPI[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/control-vehiculos/vehiculos/modelos`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar los modelos de vehículos");
    }

    const data: ModeloVehiculoAPI[] = await response.json();
    return data;
  },

  /**
   * Registrar salida de vehículo
   */
  async registrarSalida(dto: RegistrarSalidaDTO): Promise<VehiculoSalidaAPI> {
    const user = getUser();
    
    // Preparar body con datos adicionales si son necesarios
    const body = {
      placa: dto.placa,
      km_salida: dto.km_salida,
      tipo_vehiculo: dto.tipo_vehiculo,
      modelo: dto.modelo,
      taller: dto.taller,
      conductor: dto.conductor,
      persona_autorizo: dto.persona_autorizo,
      pasajeros: dto.pasajeros,
      porteria: dto.porteria || 7, // Default o desde config
      id_empresa: dto.id_empresa || 1, // Default o desde user context
      otra_marca: dto.otra_marca || "",
      placa_vh_remolcado: dto.placa_vh_remolcado || null,
    };

    const response = await fetchWithAuth(`${API_URL}/administracion/control-vehiculos/salida`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("No se pudo registrar la salida del vehículo");
    }

    const data: ApiMessageResponse<VehiculoSalidaAPI> = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo registrar la salida del vehículo");
    }

    return data.data;
  },

  /**
   * Registrar llegada de vehículo
   */
  async registrarLlegada(id: number, dto: RegistrarLlegadaDTO): Promise<VehiculoSalidaAPI> {
    const response = await fetchWithAuth(`${API_URL}/administracion/control-vehiculos/${id}/llegada`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("No se pudo registrar la llegada del vehículo");
    }

    const data: ApiMessageResponse<VehiculoSalidaAPI> = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo registrar la llegada del vehículo");
    }

    return data.data;
  },
};

