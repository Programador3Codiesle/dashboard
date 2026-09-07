import {
  ClipboardList,
  FileSpreadsheet,
  QrCode,
  Star,
} from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  CODIESEL_EMPRESA_ID,
  NPS_COLMOTORES_SUBMENU_ID,
  NPS_TECNICOS_INGRESO_SUBMENU_ID,
  SATISFACCION_QR_SUBMENU_ID,
  SATISFACCION_SUBMENU_ID,
} from '@/utils/constants';

export const ENCUESTAS_HUB_ITEMS: HubItem[] = [
  {
    id: 'satisfaccion',
    nombre: 'Satisfacción',
    descripcion: 'Listado y detalle de encuestas de satisfacción por orden',
    ruta: '/dashboard/encuestas/satisfaccion',
    submenuId: SATISFACCION_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: Star,
  },
  {
    id: 'nps-colmotores',
    nombre: 'Ingreso NPS Colmotores',
    descripcion: 'Registro manual de NPS por sede y por técnico',
    ruta: '/dashboard/encuestas/nps-colmotores',
    submenuId: NPS_COLMOTORES_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: ClipboardList,
  },
  {
    id: 'nps-tecnicos',
    nombre: 'Ingreso NPS Técnicos',
    descripcion: 'Carga masiva de encuestas NPS técnicos desde Excel GM',
    ruta: '/dashboard/encuestas/nps-tecnicos',
    submenuId: NPS_TECNICOS_INGRESO_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: FileSpreadsheet,
  },
  {
    id: 'satisfaccion-qr',
    nombre: 'Satisfacción QR',
    descripcion: 'Carga de encuesta QR por ventanilla (taller y placa)',
    ruta: '/dashboard/encuestas/satisfaccion-qr',
    submenuId: SATISFACCION_QR_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: QrCode,
  },
];
