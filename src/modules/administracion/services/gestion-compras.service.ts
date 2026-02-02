import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface SolicitudCompraAPI {
  id_solicitud: string;
  fecha_solicitud: string;
  area: string;
  sede: string;
  usu_solicita: number;
  cargo_usu_solicita: string;
  gerente_autoriza: number;
  descri_prod: string;
  caracteristicas?: string | null;
  proveedor?: string | null;
  area_cargar?: string | null;
  urgencia: number;
  fecha_tentativa: string;
  estado: number;
  fecha_autorizacion?: string | null;
  cotizacion_file?: string | null;
  estado_autorizacion: number;
  con_factura?: string | null;
  usuario_reg?: string;
  nit_usu_reg?: number;
  gerente?: string;
  nit_gerente?: number;
  dias_gest?: number;
}

export interface SolicitudCompra {
  id: number;
  numero: number;
  descripcion: string;
  mensajes: string;
  conFactura: boolean;
  estado: string;
  estadoNumero: number; // Estado numérico para operaciones
  estadoAutorizacion: string;
  estadoAutorizacionNumero: number; // Estado autorización numérico
  usuarioSolicita: string;
  gerenteAutoriza: string;
  fechaSolicitud: string;
  fechaAutorizacion?: string;
  gestionDias: number;
  urgencia: number;
  areaSolicita: string;
  sede: string;
  proveedoresSugeridos?: string;
  areaCarga?: string;
  cargo?: string;
}

// Debe coincidir con la forma usada en los tipos de administración y el modal
export interface NuevaSolicitudCompraDTO {
  areaSolicita: string;
  sede: string;
  nombrePersona: string;
  cargoPersona: string;
  gerenteAutoriza: string;
  proveedoresSugeridos?: string;
  nivelUrgencia: number;
  areaCarga: string;
  descripcion: string;
  fechaTentativa: string;
}

export interface FiltrosCompras {
  buscar?: string;
  pagina?: number;
  limite?: number;
  estado?: number;
  estadoAutorizacion?: number;
}

export interface ListarComprasResponse {
  items: SolicitudCompraAPI[];
  total: number;
  page: number;
  limit: number;
}

export interface MensajeCompra {
  id_mensaje: string;
  nit_usu: number;
  nombres: string;
  mensaje: string;
  fecha: string;
  solicitud_compra: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// Mapeo de estados (según código legacy)
const ESTADOS: Record<number, string> = {
  1: "Sin revisar",
  2: "En proceso",
  3: "En tránsito",
  4: "Despachada",
  5: "Negada",
};

const ESTADOS_AUTORIZACION: Record<number, string> = {
  1: "Sin autorización",
  2: "Pendiente de autorización",
  3: "Autorizado",
  4: "No autorizado",
};

// ========== Servicio ==========

export const gestionComprasService = {
  /**
   * Listar solicitudes de compra con filtros y paginación server-side
   */
  async listarSolicitudes(filtros?: FiltrosCompras): Promise<{ items: SolicitudCompra[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (filtros?.buscar) params.append("buscar", filtros.buscar);
    if (filtros?.pagina) params.append("pagina", filtros.pagina.toString());
    if (filtros?.limite) params.append("limite", filtros.limite.toString());
    if (filtros?.estado !== undefined) params.append("estado", filtros.estado.toString());
    if (filtros?.estadoAutorizacion !== undefined) params.append("estado_autorizacion", filtros.estadoAutorizacion.toString());

    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: ListarComprasResponse = await response.json();

    // Mapear respuesta del API al formato del frontend
    return {
      items: data.items.map((item) => ({
        id: Number(item.id_solicitud),
        numero: Number(item.id_solicitud),
        descripcion: item.descri_prod,
        mensajes: item.cotizacion_file ? "Con cotización" : "Sin cotización",
        conFactura: item.con_factura === "Sí" || item.con_factura === "Si",
        estado: ESTADOS[item.estado] || "Desconocido",
        estadoNumero: item.estado,
        estadoAutorizacion: ESTADOS_AUTORIZACION[item.estado_autorizacion] || "Desconocido",
        estadoAutorizacionNumero: item.estado_autorizacion,
        usuarioSolicita: item.usuario_reg || `Usuario ${item.usu_solicita}`,
        gerenteAutoriza: item.gerente || `Gerente ${item.gerente_autoriza}`,
        // El backend ya envía fecha_solicitud como YYYY-MM-DD en zona Bogotá
        fechaSolicitud: item.fecha_solicitud,
        fechaAutorizacion: item.fecha_autorizacion
          ? item.fecha_autorizacion
          : undefined,
        gestionDias: item.dias_gest || 0,
        urgencia: item.urgencia,
        areaSolicita: item.area,
        sede: item.sede,
        proveedoresSugeridos: item.proveedor || undefined,
        areaCarga: item.area_cargar || undefined,
        cargo: item.cargo_usu_solicita || undefined,
      })),
      total: data.total,
      page: data.page,
      limit: data.limit
    };
  },

  /**
   * Crear nueva solicitud de compra.
   * id_empresa se envía en el body (igual que formato-orden-salida) para evitar CORS preflight por headers custom.
   */
  async crearSolicitud(dto: NuevaSolicitudCompraDTO, empresaId?: number): Promise<SolicitudCompra> {
    const response = await fetchWithAuth(`${API_URL}/administracion/gestion-compras`, {
      method: "POST",
      body: JSON.stringify({
        area: dto.areaSolicita,
        sede: dto.sede,
        nombre_solicitante: dto.nombrePersona,
        cargo_usu_solicita: dto.cargoPersona,
        gerente_autoriza: dto.gerenteAutoriza ? Number(dto.gerenteAutoriza) : undefined,
        descri_prod: dto.descripcion,
        proveedor: dto.proveedoresSugeridos || null,
        urgencia: dto.nivelUrgencia,
        area_cargar: dto.areaCarga,
        fecha_tentativa: dto.fechaTentativa,
        id_empresa: empresaId ?? undefined,
      }),
    });

    const result = await response.json() as ApiMessageResponse<SolicitudCompraAPI> & { message?: string | string[] };

    if (!response.ok) {
      const msg = typeof result?.message === 'string'
        ? result.message
        : Array.isArray(result?.message)
          ? result.message[0]
          : (result as ApiMessageResponse<SolicitudCompraAPI>)?.message || "Error al crear la solicitud";
      throw new Error(msg);
    }

    if (!result.status || !result.data) {
      throw new Error((result as ApiMessageResponse<SolicitudCompraAPI>).message || "No se pudo crear la solicitud");
    }

    const item = result.data;
    return {
      id: Number(item.id_solicitud),
      numero: Number(item.id_solicitud),
      descripcion: item.descri_prod,
      mensajes: "Pendiente aprobación",
      conFactura: false,
      estado: ESTADOS[item.estado] || "Pendiente",
      estadoNumero: item.estado,
      estadoAutorizacion: ESTADOS_AUTORIZACION[item.estado_autorizacion] || "Sin autorizar",
      estadoAutorizacionNumero: item.estado_autorizacion,
      usuarioSolicita: item.usuario_reg || `Usuario ${item.usu_solicita}`,
      gerenteAutoriza: item.gerente || `Gerente ${item.gerente_autoriza}`,
      // El backend ya envía fecha_solicitud como YYYY-MM-DD en zona Bogotá
      fechaSolicitud: item.fecha_solicitud,
      gestionDias: 0,
      urgencia: item.urgencia,
      areaSolicita: item.area,
      sede: item.sede,
      proveedoresSugeridos: item.proveedor || undefined,
      areaCarga: item.area_cargar || undefined,
    };
  },

  /**
   * Cambiar estado de una solicitud de compra
   */
  async cambiarEstado(id: number, estado: number): Promise<ApiMessageResponse> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras/${id}/estado`,
      {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al cambiar el estado");
    }

    return response.json();
  },

  /**
   * Marcar solicitud como con/sin factura
   */
  async marcarConFactura(id: number, conFactura: string): Promise<ApiMessageResponse> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras/${id}/con-factura`,
      {
        method: "PATCH",
        body: JSON.stringify({ conFactura }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al marcar con factura");
    }

    return response.json();
  },

  /**
   * Listar mensajes de una solicitud
   */
  async listarMensajes(id: number): Promise<MensajeCompra[]> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras/${id}/mensajes`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener mensajes");
    }

    const result: ApiMessageResponse<MensajeCompra[]> = await response.json();
    return result.data || [];
  },

  /**
   * Crear mensaje en una solicitud
   */
  async crearMensaje(id: number, mensaje: string): Promise<ApiMessageResponse> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras/${id}/mensajes`,
      {
        method: "POST",
        body: JSON.stringify({ mensaje }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al crear mensaje");
    }

    return response.json();
  },

  /**
   * Enviar autorización con archivos y comentarios
   */
  async enviarAutorizacion(id: number, comentarios: string, files?: File[]): Promise<ApiMessageResponse> {
    const formData = new FormData();
    formData.append("comentarios", comentarios);
    (files || []).forEach((f) => formData.append("files", f));

    const response = await fetchWithAuth(`${API_URL}/administracion/gestion-compras/${id}/autorizacion`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al enviar autorización");
    }

    return response.json();
  },

  /**
   * Exportar solicitudes a Excel
   */
  async exportarExcel(filtros?: FiltrosCompras): Promise<Blob> {
    const params = new URLSearchParams();
    if (filtros?.buscar) params.append("buscar", filtros.buscar);
    if (filtros?.estado !== undefined) params.append("estado", filtros.estado.toString());
    if (filtros?.estadoAutorizacion !== undefined) params.append("estado_autorizacion", filtros.estadoAutorizacion.toString());

    const response = await fetchWithAuth(
      `${API_URL}/administracion/gestion-compras/exportar?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al exportar a Excel");
    }

    return response.blob();
  },
};
