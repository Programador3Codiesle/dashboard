import {
  AlertTriangle,
  Car,
  ClipboardList,
  Edit3,
  FileBarChart,
  Layers,
  PlusCircle,
} from "lucide-react";
import type { HubItem } from "@/components/shared/hub/types";
import {
  ADICIONALES_LIVIANOS_SUBMENU_ID,
  COTIZAR_CONTROL_SUBMENU_ID,
  COTIZAR_LIVIANOS_SUBMENU_ID,
  EDITAR_REPUESTO_MANO_OBRA_SUBMENU_ID,
  EJECUCION_COTIZADO_VS_FACTURADO_SUBMENU_ID,
  INFORME_COTIZACIONES_SUBMENU_ID,
  REPUESTOS_NO_DISPONIBLES_SUBMENU_ID,
} from "@/utils/constants";

export const COTIZAR_HUB_ITEMS: HubItem[] = [
  {
    id: "livianos",
    nombre: "Livianos",
    descripcion:
      "Cotizador de mantenimiento y repuestos para vehículos livianos.",
    ruta: "/dashboard/cotizar/livianos",
    submenuId: COTIZAR_LIVIANOS_SUBMENU_ID,
    icono: Car,
  },
  {
    id: "informe-cotizaciones",
    nombre: "Informe de cotizaciones",
    descripcion: "Consulta histórica y analítica de cotizaciones generadas.",
    ruta: "/dashboard/cotizar/informe-cotizaciones",
    submenuId: INFORME_COTIZACIONES_SUBMENU_ID,
    icono: FileBarChart,
  },
  {
    id: "ejecucion-cotizado-vs-facturado",
    nombre: "Ejecución Cotizado vs Facturado",
    descripcion: "Comparativo entre lo cotizado y lo finalmente facturado.",
    ruta: "/dashboard/cotizar/ejecucion-cotizado-vs-facturado",
    submenuId: EJECUCION_COTIZADO_VS_FACTURADO_SUBMENU_ID,
    icono: Layers,
  },
  {
    id: "repuestos-no-disponibles",
    nombre: "Repuestos no disponibles",
    descripcion:
      "Control y seguimiento de repuestos no disponibles al momento de cotizar.",
    ruta: "/dashboard/cotizar/repuestos-no-disponibles",
    submenuId: REPUESTOS_NO_DISPONIBLES_SUBMENU_ID,
    icono: AlertTriangle,
  },
  {
    id: "control",
    nombre: "Control",
    descripcion:
      "Control detallado de repuestos y mano de obra asociados a las cotizaciones.",
    ruta: "/dashboard/cotizar/control",
    submenuId: COTIZAR_CONTROL_SUBMENU_ID,
    icono: ClipboardList,
  },
  {
    id: "adicionales-livianos",
    nombre: "Adicionales Livianos",
    descripcion:
      "Configuración de adicionales de repuestos y mano de obra para livianos.",
    ruta: "/dashboard/cotizar/adicionales-livianos",
    submenuId: ADICIONALES_LIVIANOS_SUBMENU_ID,
    icono: PlusCircle,
  },
  {
    id: "editar-repuesto-mano-obra",
    nombre: "Editar repuesto / mano de obra",
    descripcion:
      "Edición masiva de configuraciones de repuestos y mano de obra.",
    ruta: "/dashboard/cotizar/editar-repuesto-mano-obra",
    submenuId: EDITAR_REPUESTO_MANO_OBRA_SUBMENU_ID,
    icono: Edit3,
  },
];
