import { ITicket, EstadoTicket, Prioridad } from "../types";

// Simulación de variables de sesión hasta conectar con auth real
export const MOCK_SESSION_USER_ID = "1096219894";
export const MOCK_ADMIN_USER_ID = "1095944273";

export const empresasDisponibles = [
    // IDs alineados con los códigos que maneja el backend (ej: "1", "2", "4", ...)
    { id: "1", nombre: "Codiesel", logo: "🚗" },
    { id: "2", nombre: "Dieselco", logo: "🔧" },
    { id: "3", nombre: "Mitsubishi", logo: "⚡" },
    { id: "4", nombre: "BYD", logo: "🔋" },
];

export const encargadosDisponibles = [
    // IDs alineados con los códigos que maneja el backend
    { id: "1110602826", nombre: "Cristian Camilo Tunjano Diaz" },
    { id: "1102368016", nombre: "Edwin Manuel Ramirez Tami" },
    { id: "1098625558", nombre: "Zuly Nathalia Ramirez Burgos" },
    { id: "1095944273", nombre: "Cristhian Alberto Sanchez Murillo" },
];

export const sedesTicketsDisponibles = [
    "Giron",
    "Cucuta",
    "Barrancabermeja",
    "Bucaramanga"
];

export const COMPANY_STYLES: Record<string, string> = {
    Codiesel: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    Dieselco: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10",
    Mitsubishi: "bg-red-50 text-red-700 border-red-200 ring-red-500/10",
    BYD: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10",
    default: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10"
};

// ==== HELPERS DE MAPEOS DESDE LA API ====

// \"1, 2\" -> [\"1\",\"2\"] -> \"Codiesel, Dieselco\"
export function mapEmpresaCodesToNames(codes: string | null | undefined): string {
    if (!codes) return "N/A";
    const ids = codes.split(",").map((c) => c.trim()).filter(Boolean);
    if (!ids.length) return "N/A";

    const names = ids
        .map((id) => empresasDisponibles.find((e) => e.id === id)?.nombre)
        .filter(Boolean) as string[];

    return names.length ? names.join(", ") : "N/A";
}

export function mapEstadoFromApi(estadoApi: string | null | undefined): EstadoTicket {

    const value = (estadoApi || "").toLowerCase();

    if (value === "activo") {
        // Para mis tickets podríamos distinguir \"mio\" más adelante si la API lo soporta
        return "activo";
    }

    if (value === "en proceso") {
        return "en proceso";
    }


    if (value === "cerrado") {
        return "cerrado";
    }

    return "abierto";
}

export function normalizePrioridad(prioridad: string | null | undefined): Prioridad {
    const value = (prioridad || "").toLowerCase();

    if (value === "alta" || value === "alta ") return "alta";
    if (value === "baja" || value === "baja ") return "baja";

    return "media";
}

// Mantener algunos mocks por si en algún momento queremos usarlos
export const MOCK_TICKETS: ITicket[] = [
    {
        id: 1001,
        tipoSoporte: "Software",
        anydesk: "123-456-789",
        descripcion: "Al hacer click en 'Asignar flota' no aparece listado.",
        archivoUrl: null,
        empresa: "Codiesel",
        prioridad: "alta",
        usuario: "juan.perez",
        encargado: "soporte1",
        estado: "abierto",
        fechaCreacion: new Date().toISOString()
    },
];