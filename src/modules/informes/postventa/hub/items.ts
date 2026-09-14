import { FileBarChart2, MessageCircle, SmilePlus, Users } from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { POSTVENTA_HUB_NAV } from './nav';

export const POSTVENTA_HUB_ITEMS = attachHubIcons(POSTVENTA_HUB_NAV, {
  'llegada-vehiculos': FileBarChart2,
  'ventas-1a1': FileBarChart2,
  'tiempo-entrevista-consultiva': FileBarChart2,
  'inventario-obsoletos': FileBarChart2,
  'ticket-promedio-tecnico': FileBarChart2,
  'kpi': FileBarChart2,
  'segunda-entrega': FileBarChart2,
  'retencion-72-0': FileBarChart2,
  'nps-interno': FileBarChart2,
  'productividad-tecnicos': FileBarChart2,
  'nps-tecnicos': Users,
  'mpc': FileBarChart2,
  'encuesta-satisfaccion': SmilePlus,
  'pqr-nps': MessageCircle,
  'pac-nps-interno-detallado': FileBarChart2,
  'pac': FileBarChart2,
  'panel-nps': FileBarChart2,
  'encuestas-internas': MessageCircle,
});
