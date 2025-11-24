import { LayoutDashboard, ReceiptText, Calendar, ShieldCheck } from 'lucide-react';

export const ROUTES = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/nomina', name: 'Nómina', icon: ReceiptText },
  { path: '/citas', name: 'Citas', icon: Calendar },
  { path: '/garantias', name: 'Garantías', icon: ShieldCheck },
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
