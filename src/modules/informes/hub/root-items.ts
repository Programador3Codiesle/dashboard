import { Users, Wrench } from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';

export const INFORMES_ROOT_HUB_ITEMS: HubItem[] = [
  {
    id: 'gestion-humana',
    nombre: 'Gestión Humana',
    descripcion: 'Informes de ausentismos, tiempo suplementario, pausas activas y más.',
    ruta: '/dashboard/informes/gestion-humana',
    submenuId: 135,
    icono: Users,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'postventa',
    nombre: 'Postventa',
    descripcion: 'Informes operativos y de satisfacción de clientes en postventa.',
    ruta: '/dashboard/informes/postventa',
    submenuId: 137,
    icono: Wrench,
    color: 'from-sky-500 to-sky-600',
  },
];
