'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  UserCog,
  Users,
  Paintbrush,
  Wrench,
  BriefcaseBusiness,
  Palette,
} from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";

interface SubmoduloNomina {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  submenuId?: number;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS_NOMINA: SubmoduloNomina[] = [
  {
    id: "comisiones-asesores-repuestos",
    nombre: "Comisiones asesores repuestos",
    descripcion: "Gestiona y consulta las comisiones del equipo asesor de repuestos.",
    ruta: "/dashboard/nomina/comisiones-asesores-repuestos",
    submenuId: 32,
    icono: UserCog,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "comisiones-jefes",
    nombre: "Comisiones jefes",
    descripcion: "Consulta de comisiones asignadas a jefaturas por periodo.",
    ruta: "/dashboard/nomina/comisiones-jefes",
    submenuId: 78,
    icono: Users,
    color: "from-violet-500 to-violet-600",
  },
  {
    id: "comisiones-lamina-pintura",
    nombre: "Comisiones lamina y pintura",
    descripcion: "Seguimiento de comisiones del area de lamina y pintura.",
    ruta: "/dashboard/nomina/comisiones-lamina-pintura",
    submenuId: 42,
    icono: Paintbrush,
    color: "from-rose-500 to-rose-600",
  },
  /*
  {
    id: "comisiones-lyp-por-nit",
    nombre: "Comisiones LYP por NIT",
    descripcion: "Liquidacion y consulta de comisiones LYP agrupadas por NIT.",
    ruta: "/dashboard/nomina/comisiones-lyp-por-nit",
    icono: Building2,
    color: "from-emerald-500 to-emerald-600",
  },
  */
  {
    id: "comisiones-tecnicos",
    nombre: "Comisiones tecnicos",
    descripcion: "Control de comisiones para tecnicos por desempeno y productividad.",
    ruta: "/dashboard/nomina/comisiones-tecnicos",
    submenuId: 77,
    icono: Wrench,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "nomina-director-flotas",
    nombre: "Nomina director flotas",
    descripcion: "Gestion de novedades y calculos del esquema para director de flotas.",
    ruta: "/dashboard/nomina/nomina-director-flotas",
    submenuId: 122,
    icono: BriefcaseBusiness,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "relacion-margen-materiales-colorista",
    nombre: "Relacion margen materiales - Colorista",
    descripcion: "Analisis de margen de materiales asociado a la gestion del colorista.",
    ruta: "/dashboard/nomina/relacion-margen-materiales-colorista",
    submenuId: 185,
    icono: Palette,
    color: "from-fuchsia-500 to-fuchsia-600",
  },
];

export default function NominaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const submodulosFiltrados = useMemo(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions) {
      return SUBMODULOS_NOMINA;
    }

    const submenusPermitidos = new Set(user?.submenus_permitidos || []);
    return SUBMODULOS_NOMINA.filter((submodulo) => {
      if (typeof submodulo.submenuId !== "number") {
        return false;
      }

      return submenusPermitidos.has(submodulo.submenuId);
    });
  }, [user?.submenus_permitidos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Nomina</h1>
          <p className="text-gray-500 mt-1">
            Administra los submodulos de nomina y migra sus procesos desde legacy.
          </p>
        </div>
      </div>

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
            <p className="text-sm text-gray-600 leading-relaxed">{submodulo.descripcion}</p>
            <div className="mt-4 flex items-center brand-text text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Acceder</span>
              <motion.div initial={{ x: -5 }} animate={{ x: 0 }} className="ml-2">
                →
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
