import { LayoutDashboard, User, Ticket, Settings } from "lucide-react";

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
];

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
