'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Car,
  ClipboardList,
  FileBarChart,
  PlusCircle,
  Edit3,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";

interface SubmoduloCotizar {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  submenuId?: number;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS_COTIZAR: SubmoduloCotizar[] = [
  {
    id: "livianos",
    nombre: "Livianos",
    descripcion: "Cotizador de mantenimiento y repuestos para vehículos livianos.",
    ruta: "/dashboard/cotizar/livianos",
    submenuId: 90,
    icono: Car,
    color: "from-blue-500 to-blue-600",
  },
  /*
  {
    id: "pesados",
    nombre: "Pesados",
    descripcion: "Cotizador especializado para vehículos de carga y pesados.",
    ruta: "/dashboard/cotizar/pesados",
    icono: Truck,
    color: "from-emerald-500 to-emerald-600",
  },
  */
  {
    id: "informe-cotizaciones",
    nombre: "Informe de cotizaciones",
    descripcion: "Consulta histórica y analítica de cotizaciones generadas.",
    ruta: "/dashboard/cotizar/informe-cotizaciones",
    submenuId: 91,
    icono: FileBarChart,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "ejecucion-cotizado-vs-facturado",
    nombre: "Ejecución Cotizado vs Facturado",
    descripcion: "Comparativo entre lo cotizado y lo finalmente facturado.",
    ruta: "/dashboard/cotizar/ejecucion-cotizado-vs-facturado",
    submenuId: 110,
    icono: Layers,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "repuestos-no-disponibles",
    nombre: "Repuestos no disponibles",
    descripcion: "Control y seguimiento de repuestos no disponibles al momento de cotizar.",
    ruta: "/dashboard/cotizar/repuestos-no-disponibles",
    submenuId: 95,
    icono: AlertTriangle,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "control",
    nombre: "Control",
    descripcion: "Control detallado de repuestos y mano de obra asociados a las cotizaciones.",
    ruta: "/dashboard/cotizar/control",
    submenuId: 101,
    icono: ClipboardList,
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "adicionales-livianos",
    nombre: "Adicionales Livianos",
    descripcion: "Configuración de adicionales de repuestos y mano de obra para livianos.",
    ruta: "/dashboard/cotizar/adicionales-livianos",
    submenuId: 118,
    icono: PlusCircle,
    color: "from-purple-500 to-purple-600",
  },
  /*
  {
    id: "adicionales-pesados",
    nombre: "Adicionales Pesados",
    descripcion: "Configuración de adicionales para el cotizador de pesados.",
    ruta: "/dashboard/cotizar/adicionales-pesados",
    icono: PlusCircle,
    color: "from-pink-500 to-pink-600",
  },
  */
  {
    id: "editar-repuesto-mano-obra",
    nombre: "Editar repuesto / mano de obra",
    descripcion: "Edición masiva de configuraciones de repuestos y mano de obra.",
    ruta: "/dashboard/cotizar/editar-repuesto-mano-obra",
    submenuId: 196,
    icono: Edit3,
    color: "from-rose-500 to-rose-600",
  },
];

export default function CotizarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const submodulosFiltrados = useMemo(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions) {
      return SUBMODULOS_COTIZAR;
    }

    const submenusPermitidos = new Set(user?.submenus_permitidos || []);
    return SUBMODULOS_COTIZAR.filter((submodulo) => {
      if (typeof submodulo.submenuId !== "number") {
        return false;
      }

      return submenusPermitidos.has(submodulo.submenuId);
    });
  }, [user?.submenus_permitidos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Cotizar</h1>
          <p className="text-gray-500 mt-1">
            Gestiona todas las funcionalidades del cotizador (livianos, pesados, informes y configuración).
          </p>
        </div>
      </div>

      {/* Grid de Submódulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {submodulosFiltrados.map((submodulo, index) => (
          <motion.div
            key={submodulo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(submodulo.ruta)}
            className="bg-white brand-card-elevated rounded-2xl p-6 border brand-border-active cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group hover-lift"
          >
            <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${submodulo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <submodulo.icono size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:brand-text transition-colors">
              {submodulo.nombre}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {submodulo.descripcion}
            </p>
            <div className="mt-4 flex items-center brand-text text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Acceder</span>
              <motion.div
                initial={{ x: -5 }}
                animate={{ x: 0 }}
                className="ml-2"
              >
                →
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

