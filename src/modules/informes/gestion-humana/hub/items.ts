import {
  Activity,
  Bike,
  CalendarRange,
  Car,
  ClipboardList,
  Clock,
  ListChecks,
  LogIn,
  LogOut,
  ShoppingCart,
  Truck,
  UserX,
  Wrench,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { GESTION_HUMANA_HUB_NAV } from './nav';

export const GESTION_HUMANA_HUB_ITEMS = attachHubIcons(GESTION_HUMANA_HUB_NAV, {
  'inf-ausentismos': CalendarRange,
  'checklist-carro': Car,
  'checklist-moto': Bike,
  'control-compras': ShoppingCart,
  'indicador-checklist': ListChecks,
  'indicador-checklist-pesv': ListChecks,
  'checklists-equipos': ListChecks,
  'informe-ordenes-salida': ClipboardList,
  'tallas-personal': ClipboardList,
  'desempeno-empleado': ClipboardList,
  'tiempo-gestion-compras': Clock,
  'llegadas-tarde': Clock,
  'control-vehicular': Truck,
  'mtto-preventivo-vehiculos-propios': Wrench,
  'entradas-salidas': LogOut,
  'ingreso-empleados': LogIn,
  'informe-tiempo-suplementario': Clock,
  'informe-pausas-activas': Activity,
  'inasistencia': UserX,
});
