import { LayoutDashboard, User, Ticket, Settings, FileText, FileBarChart2, Receipt, Wrench, Package, Phone, ClipboardCheck, Car, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";

export type EmpresaId = 1 | 2 | 3 | 4;

export interface EmpresaConfig {
  id: EmpresaId;
  nombre: string;
  color: string;
  colorHover?: string;
}

export const EMPRESAS: EmpresaConfig[] = [
  { id: 1, nombre: "Codiesel", color: "#f59e0b", colorHover: "#d97706" },
  { id: 2, nombre: "Dieselco", color: "#4CB8AA", colorHover: "#3da89a" },
  { id: 3, nombre: "Mitsubishi", color: "#ED0000", colorHover: "#cc0000" },
  { id: 4, nombre: "BYD", color: "#4F9EDD", colorHover: "#3d8bcc" },
];

export const ROUTES = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/usuarios", name: "Usuarios", icon: User },
  { path: "/dashboard/tickets", name: "Tickets", icon: Ticket },
  { path: "/dashboard/administracion", name: "Administración", icon: Settings },
  { path: "/dashboard/nomina", name: "Nomina", icon: Receipt },
  { path: "/dashboard/cotizar", name: "Cotizar", icon: FileText },
  { path: "/dashboard/informes", name: "Informes", icon: FileBarChart2 },
  { path: "/dashboard/taller", name: "Taller", icon: Wrench },
  { path: "/dashboard/repuestos", name: "Repuestos", icon: Package },
  { path: "/dashboard/contact-center", name: "Contact Center", icon: Phone },
  { path: "/dashboard/checklist", name: "Checklist", icon: ClipboardCheck },
  { path: "/dashboard/ordenes-tot", name: "Órdenes & TOT", icon: Car },
  { path: "/dashboard/indicadores", name: "Indicadores", icon: BarChart3 },
  { path: "/dashboard/encuestas", name: "Encuestas", icon: ClipboardList },
  { path: "/dashboard/auditoria", name: "Auditoría", icon: ShieldCheck },
];

export const MENU_ID_BY_ROUTE: Record<string, number> = {
  "/dashboard/usuarios": 1,
  "/dashboard/tickets": 9,
  "/dashboard/administracion": 11,
  "/dashboard/nomina": 3,
  "/dashboard/cotizar": 45,
  "/dashboard/informes": 5,
  "/dashboard/taller": 4,
  "/dashboard/repuestos": 47,
  "/dashboard/contact-center": 10,
  "/dashboard/checklist": 48,
  "/dashboard/ordenes-tot": 6,
  "/dashboard/indicadores": 2,
  "/dashboard/encuestas": 7,
  "/dashboard/auditoria": 49,
};

/** IDs de submenú MPVI (tabla menús legacy, id_menu padre = 4 Taller) */
export const MPVI_SUBMENU_IDS = {
  admin: 151,
  tecnicos: 180,
  jefeTaller: 181,
  contact: 182,
} as const;

/** Submenú Entrada de vehículo (Taller, id_menu = 4) */
export const ENTRADA_VEHICULO_SUBMENU_ID = 55;

/** Submenú Estado taller (Taller, id_menu = 4) */
export const ESTADO_TALLER_SUBMENU_ID = 40;

/** Submenú Informe órdenes taller abiertas (Taller, id_menu = 4) */
export const INFORME_OT_ABIERTAS_SUBMENU_ID = 41;

/** Submenú Informe posibles retornos (Taller, id_menu = 4) — solo Codiesel */
export const INFORME_POSIBLES_RETORNOS_SUBMENU_ID = 115;

/** Submenú Posibles retornos gestión (Taller, id_menu = 4) — solo Codiesel */
export const POSIBLES_RETORNOS_SUBMENU_ID = 113;

/** Submenú P&G Asesores de Repuestos (Taller, id_menu = 4) */
export const PYG_ASESORES_REPUESTOS_SUBMENU_ID = 177;

/** Submenú P&G Técnicos (Taller, id_menu = 4) */
export const PYG_TECNICOS_SUBMENU_ID = 173;

/** Submenú Presupuesto (Taller, id_menu = 4) — solo Codiesel */
export const PRESUPUESTO_SUBMENU_ID = 186;

/** Empresa Codiesel */
export const CODIESEL_EMPRESA_ID = 1 as const;

/** Menú Repuestos (id_menu = 47) — solo Codiesel */
export const REPUESTOS_MENU_ID = 47 as const;

/** Submenú Inventario Obsoletos resumen (Repuestos, id_menu = 47) */
export const INVENTARIO_OBSOLETOS_SUBMENU_ID = 128;

/** Submenú Informe Obsoletos con filtros (Repuestos, id_menu = 47) */
export const INFORME_OBSOLETOS_SUBMENU_ID = 129;

/** Submenú Órdenes de Compra repuestos (Repuestos, id_menu = 47) */
export const ORDEN_COMPRA_SUBMENU_ID = 156;

/** Submenú Entradas Varias (Repuestos, id_menu = 47) */
export const ENTRADAS_VARIAS_SUBMENU_ID = 174;

/** Submenú Gestión Entradas Varias / EV-SV (Repuestos, id_menu = 47) */
export const SOLICITUDES_EV_SUBMENU_ID = 175;

/** Submenú Informe Solicitudes EV y SV (Repuestos, id_menu = 47) */
export const INFORME_EV_SV_SUBMENU_ID = 176;

/** Menú Contact Center (id_menu = 10) — solo Codiesel */
export const CONTACT_CENTER_MENU_ID = 10 as const;

/** Submenú Distribución (Contact Center, id_menu = 10) */
export const DISTRIBUCION_CC_SUBMENU_ID = 38;

/** Submenú Distribución Agentes (Contact Center, id_menu = 10) */
export const DISTRIBUCION_AGENTE_CC_SUBMENU_ID = 39;

/** Submenú Auditoría (Contact Center, id_menu = 10) */
export const AUDITORIA_CC_SUBMENU_ID = 98;

/** Submenú Admin LEADS (Contact Center, id_menu = 10) */
export const AGENDAMIENTO_LEADS_SUBMENU_ID = 157;

/** Submenú Bases de datos (Contact Center, id_menu = 10) */
export const INFORME_BASE_DATOS_CC_SUBMENU_ID = 188;

/** Menú Checklist (id_menu = 48) */
export const CHECKLIST_MENU_ID = 48 as const;

/** Submenús Checklist (id_menu = 48) */
export const CHECKLIST_MOTOCICLETAS_SUBMENU_ID = 140;
export const CHECKLIST_VEHICULO_SUBMENU_ID = 141;
export const CHECKLIST_ALINEADORES_SUBMENU_ID = 145;
export const CHECKLIST_ELEVADORES_SUBMENU_ID = 146;
export const CHECKLIST_HIDRAULICOS_SUBMENU_ID = 147;
export const CHECKLIST_TRABAJO_CALIENTE_SUBMENU_ID = 148;
export const CHECKLIST_PORTICO_SUBMENU_ID = 149;
export const CHECKLIST_TIJERA_SUBMENU_ID = 150;
export const CHECKLIST_CABINA_PINTURA_SUBMENU_ID = 158;

/** Menú Órdenes & TOT Taller (id_menu = 6) — solo Codiesel */
export const ORDENES_TOT_MENU_ID = 6 as const;

/** Submenús Órdenes & TOT (id_menu = 6) */
export const DAR_SALIDA_VEHICULOS_SUBMENU_ID = 11;
export const BUSCAR_ORDENES_SUBMENU_ID = 12;
export const DAR_SALIDA_TOT_SUBMENU_ID = 16;
export const INGRESO_REPUESTOS_SUBMENU_ID = 17;

/** Menú Indicadores (id_menu = 2) — solo Codiesel / Chevrolet */
export const INDICADORES_MENU_ID = 2 as const;

/** Submenú Presupuesto POSVENTA (Indicadores, id_menu = 2) */
export const PRESUPUESTO_POSVENTA_SUBMENU_ID = 2;

/** Menú Encuestas (id_menu = 7) — solo Codiesel */
export const ENCUESTAS_MENU_ID = 7 as const;

/** Submenús Encuestas (id_menu = 7) */
export const SATISFACCION_SUBMENU_ID = 21;
export const NPS_COLMOTORES_SUBMENU_ID = 23;
export const NPS_TECNICOS_INGRESO_SUBMENU_ID = 26;
export const SATISFACCION_QR_SUBMENU_ID = 120;

/** Menú Auditoría (id_menu = 49) — solo Codiesel */
export const AUDITORIA_MENU_ID = 49 as const;

/** Submenús Auditoría (id_menu = 49) */
export const RANKING_NPS_TECNICOS_SUBMENU_ID = 159;
export const CONTROL_ORDENES_DIARIAS_SUBMENU_ID = 160;
export const RETORNOS_POR_SEDE_SUBMENU_ID = 161;
export const PQR_AUDITORIA_SUBMENU_ID = 162;
export const NPS_FABRICA_SUBMENU_ID = 164;
export const ORDENES_MTTO_PREVENTIVO_SUBMENU_ID = 167;
export const FACTURACION_TALLER_SUBMENU_ID = 169;
export const FACTURACION_TECNICO_SUBMENU_ID = 170;
export const ORDENES_TECNICOS_SUBMENU_ID = 171;
export const ENTREGAS_AUDITORIA_SUBMENU_ID = 194;

// Colores para tarjetas del Dashboard (opcional)
export const DASHBOARD_CARD_COLORS = {
  users: 'bg-indigo-500',
  transactions: 'bg-green-500',
  tickets: 'bg-yellow-500',
};

// Mensajes globales (pueden usarse para alerts, modals, tooltips)
export const MESSAGES = {
  errorFetch: 'Ocurrió un error al cargar los datos. Intenta nuevamente.',
  successAction: 'La acción se completó correctamente.',
};

// Formatos de fecha y moneda
export const FORMAT = {
  currency: (amount: number) => `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
};
