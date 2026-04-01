'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, Wrench } from "lucide-react";

interface SubmoduloInformesRoot {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS_INFORMES_ROOT: SubmoduloInformesRoot[] = [
  {
    id: "gestion-humana",
    nombre: "Gestión Humana",
    descripcion: "Informes de ausentismos, tiempo suplementario, pausas activas y más.",
    ruta: "/dashboard/informes/gestion-humana",
    icono: Users,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "postventa",
    nombre: "Postventa",
    descripcion: "Informes operativos y de satisfacción de clientes en postventa.",
    ruta: "/dashboard/informes/postventa",
    icono: Wrench,
    color: "from-sky-500 to-sky-600",
  },
];

export default function InformesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informes</h1>
          <p className="text-gray-500 mt-1">
            Accede a los informes de Gestión Humana y Postventa con una experiencia moderna y unificada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SUBMODULOS_INFORMES_ROOT.map((submodulo, index) => (
          <motion.div
            key={submodulo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(submodulo.ruta)}
            className="bg-white brand-card-elevated rounded-2xl p-6 border brand-border-active cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group hover-lift"
          >
            <div
              className={`w-14 h-14 rounded-xl bg-linear-to-br ${submodulo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
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

