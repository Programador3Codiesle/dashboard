'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  CarFront,
  ClipboardList,
  ClipboardCheck,
  FileBarChart2,
  Headphones,
  Settings,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import {
  ENTRADA_VEHICULO_SUBMENU_ID,
  ESTADO_TALLER_SUBMENU_ID,
  INFORME_OT_ABIERTAS_SUBMENU_ID,
  MPVI_SUBMENU_IDS,
} from "@/utils/constants";

interface Submodulo {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  submenuId?: number;
  icono: React.ComponentType<{ size?: number; className?: string }>;
}

const SUBMODULOS: Submodulo[] = [
  {
    id: "estado-taller",
    nombre: "Estado taller",
    descripcion: "Órdenes abiertas, historial, valores estimados y seguimiento",
    ruta: "/dashboard/taller/estado-taller",
    submenuId: ESTADO_TALLER_SUBMENU_ID,
    icono: ClipboardCheck,
  },
  {
    id: "informe-ordenes-abiertas",
    nombre: "Informe órdenes taller",
    descripcion: "Resumen por sede y detalle de órdenes de trabajo abiertas",
    ruta: "/dashboard/taller/informe-ordenes-abiertas",
    submenuId: INFORME_OT_ABIERTAS_SUBMENU_ID,
    icono: FileBarChart2,
  },
  {
    id: "entrada-vehiculo",
    nombre: "Entrada de vehículo",
    descripcion: "Registro de ingreso al taller, citas y vehículos sin cita",
    ruta: "/dashboard/taller/entrada-vehiculo",
    submenuId: ENTRADA_VEHICULO_SUBMENU_ID,
    icono: CarFront,
  },
  {
    id: "mpvi-admin",
    nombre: "Administración MPVI",
    descripcion: "Carga de plantillas y catálogos",
    ruta: "/dashboard/taller/mpvi/mpvi-admin",
    submenuId: MPVI_SUBMENU_IDS.admin,
    icono: Settings,
  },
  {
    id: "mpvi-tecnicos",
    nombre: "MPVI Técnicos",
    descripcion: "Cotización MPVI por técnico de taller",
    ruta: "/dashboard/taller/mpvi/mpvi-tecnicos",
    submenuId: MPVI_SUBMENU_IDS.tecnicos,
    icono: Wrench,
  },
  {
    id: "mpvi-jefe-taller",
    nombre: "MPVI Jefe de Taller",
    descripcion: "Autorización y gestión de servicios MPVI",
    ruta: "/dashboard/taller/mpvi/mpvi-jefe-taller",
    submenuId: MPVI_SUBMENU_IDS.jefeTaller,
    icono: ClipboardList,
  },
  {
    id: "mpvi-contact",
    nombre: "MPVI Contact",
    descripcion: "Seguimiento de cotizaciones y contacto con clientes",
    ruta: "/dashboard/taller/mpvi/mpvi-contact",
    submenuId: MPVI_SUBMENU_IDS.contact,
    icono: Headphones,
  },
];

export default function TallerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const submodulosFiltrados = useMemo(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions) {
      return SUBMODULOS;
    }

    const submenusPermitidos = new Set(user?.submenus_permitidos || []);
    return SUBMODULOS.filter((submodulo) => {
      if (typeof submodulo.submenuId !== "number") {
        return false;
      }
      return submenusPermitidos.has(submodulo.submenuId);
    });
  }, [user?.submenus_permitidos]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Taller</h1>
        <p className="text-gray-500 mt-1">Módulos de gestión de taller y MPVI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {submodulosFiltrados.map((submodulo, index) => (
          <motion.div
            key={submodulo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(submodulo.ruta)}
            className="bg-white brand-card-elevated rounded-2xl p-4 sm:p-6 border brand-border-active cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group hover-lift"
          >
            <div className="w-14 h-14 rounded-xl bg-white border-2 brand-border-active flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[var(--color-primary)] transition-all duration-300">
              <submodulo.icono size={28} className="brand-text" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:brand-text transition-colors">
              {submodulo.nombre}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{submodulo.descripcion}</p>
            <div className="mt-4 flex items-center brand-text text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Acceder</span>
              <span className="ml-2">→</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
