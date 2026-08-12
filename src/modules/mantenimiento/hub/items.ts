import {
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  HardHat,
  Wrench,
} from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  CODIESEL_EMPRESA_ID,
  EQUIPOS_MANTENIMIENTO_SUBMENU_ID,
  INFORME_CORRECTIVO_SUBMENU_ID,
  INFORME_PREVENTIVO_SUBMENU_ID,
  MTTO_CORRECTIVO_SUBMENU_ID,
  MTTO_PREVENTIVO_SUBMENU_ID,
} from '@/utils/constants';

export const MANTENIMIENTO_HUB_ITEMS: HubItem[] = [
  {
    id: 'equipos',
    nombre: 'Equipos',
    descripcion: 'Gestión de equipos e inventario de mantenimiento',
    ruta: '/dashboard/mantenimiento/equipos',
    submenuId: EQUIPOS_MANTENIMIENTO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: HardHat,
  },
  {
    id: 'mtto-correctivo',
    nombre: 'Mtto correctivo',
    descripcion: 'Solicitudes de mantenimiento correctivo',
    ruta: '/dashboard/mantenimiento/mtto-correctivo',
    submenuId: MTTO_CORRECTIVO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: Wrench,
  },
  {
    id: 'mtto-preventivo',
    nombre: 'Mtto preventivo',
    descripcion: 'Cronograma y plan de mantenimiento preventivo',
    ruta: '/dashboard/mantenimiento/mtto-preventivo',
    submenuId: MTTO_PREVENTIVO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: CalendarDays,
  },
  {
    id: 'informe-correctivo',
    nombre: 'Informe Correctivo',
    descripcion: 'Informe de mantenimientos correctivos',
    ruta: '/dashboard/mantenimiento/informe-correctivo',
    submenuId: INFORME_CORRECTIVO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: FileBarChart2,
  },
  {
    id: 'informe-preventivo',
    nombre: 'Informe Preventivo',
    descripcion: 'Informe de mantenimientos preventivos',
    ruta: '/dashboard/mantenimiento/informe-preventivo',
    submenuId: INFORME_PREVENTIVO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: ClipboardList,
  },
];
