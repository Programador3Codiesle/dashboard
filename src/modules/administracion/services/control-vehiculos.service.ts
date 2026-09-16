import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  ModeloVehiculo,
  RegistrarLlegadaDTO,
  RegistrarSalidaDTO,
  VehiculoSalidaAPI,
} from "@/modules/administracion/types";

const API_URL = getApiBaseUrl();

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

export const controlVehiculosService = {
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

  async obtenerModelos(): Promise<ModeloVehiculo[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/control-vehiculos/vehiculos/modelos`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar los modelos de vehículos");
    }

    const data: ModeloVehiculo[] = await response.json();
    return data;
  },

  async registrarSalida(dto: RegistrarSalidaDTO): Promise<VehiculoSalidaAPI> {
    const body = {
      placa: dto.placa,
      km_salida: dto.km_salida,
      tipo_vehiculo: dto.tipo_vehiculo,
      modelo: dto.modelo,
      taller: dto.taller,
      conductor: dto.conductor,
      persona_autorizo: dto.persona_autorizo,
      pasajeros: dto.pasajeros,
      otra_marca: dto.otra_marca || undefined,
      placa_grua: dto.placa_grua || undefined,
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
