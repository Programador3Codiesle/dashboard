import {
  BriefcaseBusiness,
  Paintbrush,
  Palette,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import type { HubItem } from "@/components/shared/hub/types";
import {
  COMISIONES_ASESORES_REPUESTOS_SUBMENU_ID,
  COMISIONES_JEFES_SUBMENU_ID,
  COMISIONES_LAMINA_PINTURA_SUBMENU_ID,
  COMISIONES_TECNICOS_SUBMENU_ID,
  NOMINA_DIRECTOR_FLOTAS_SUBMENU_ID,
  RELACION_MARGEN_MATERIALES_COLORISTA_SUBMENU_ID,
} from "@/utils/constants";

export const NOMINA_HUB_ITEMS: HubItem[] = [
  {
    id: "comisiones-asesores-repuestos",
    nombre: "Comisiones asesores repuestos",
    descripcion:
      "Gestiona y consulta las comisiones del equipo asesor de repuestos.",
    ruta: "/dashboard/nomina/comisiones-asesores-repuestos",
    submenuId: COMISIONES_ASESORES_REPUESTOS_SUBMENU_ID,
    icono: UserCog,
  },
  {
    id: "comisiones-jefes",
    nombre: "Comisiones jefes",
    descripcion: "Consulta de comisiones asignadas a jefaturas por periodo.",
    ruta: "/dashboard/nomina/comisiones-jefes",
    submenuId: COMISIONES_JEFES_SUBMENU_ID,
    icono: Users,
  },
  {
    id: "comisiones-lamina-pintura",
    nombre: "Comisiones lámina y pintura",
    descripcion: "Seguimiento de comisiones del área de lámina y pintura.",
    ruta: "/dashboard/nomina/comisiones-lamina-pintura",
    submenuId: COMISIONES_LAMINA_PINTURA_SUBMENU_ID,
    icono: Paintbrush,
  },
  {
    id: "comisiones-tecnicos",
    nombre: "Comisiones técnicos",
    descripcion:
      "Control de comisiones para técnicos por desempeño y productividad.",
    ruta: "/dashboard/nomina/comisiones-tecnicos",
    submenuId: COMISIONES_TECNICOS_SUBMENU_ID,
    icono: Wrench,
  },
  {
    id: "nomina-director-flotas",
    nombre: "Nómina director flotas",
    descripcion:
      "Gestión de novedades y cálculos del esquema para director de flotas.",
    ruta: "/dashboard/nomina/nomina-director-flotas",
    submenuId: NOMINA_DIRECTOR_FLOTAS_SUBMENU_ID,
    icono: BriefcaseBusiness,
  },
  {
    id: "relacion-margen-materiales-colorista",
    nombre: "Relación margen materiales - Colorista",
    descripcion:
      "Análisis de margen de materiales asociado a la gestión del colorista.",
    ruta: "/dashboard/nomina/relacion-margen-materiales-colorista",
    submenuId: RELACION_MARGEN_MATERIALES_COLORISTA_SUBMENU_ID,
    icono: Palette,
  },
];
