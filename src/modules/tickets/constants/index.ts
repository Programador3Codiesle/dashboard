import { ITicket } from "../types";

export const COMPANY_STYLES: Record<string, string> = {
    Codiesel: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    Dieselco: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    Mitsubishi: "bg-red-50 text-red-700 border-red-200 ring-red-500/10",
    BYD: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10",
    default: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10"
};

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
    {
        id: 1002,
        tipoSoporte: "Hardware",
        anydesk: "",
        descripcion: "Pantalla táctil no responde.",
        archivoUrl: null,
        empresa: "Dieselco",
        prioridad: "media",
        usuario: "maria.gomez",
        encargado: "soporte2",
        estado: "cerrado",
        fechaCreacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
        id: 1003,
        tipoSoporte: "Software",
        anydesk: "123-456-789",
        descripcion: "Al hacer click en 'Asignar flota' no aparece listado.",
        archivoUrl: null,
        empresa: "BYD",
        prioridad: "alta",
        usuario: "juan.perez",
        encargado: "soporte1",
        estado: "abierto",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 1004,
        tipoSoporte: "Hardware",
        anydesk: "123-456-789",
        descripcion: "Al hacer click en 'Asignar flota' no aparece listado.",
        archivoUrl: null,
        empresa: "BYD",
        prioridad: "alta",
        usuario: "juan.perez",
        encargado: "soporte1",
        estado: "abierto",
        fechaCreacion: new Date().toISOString()
    },
];