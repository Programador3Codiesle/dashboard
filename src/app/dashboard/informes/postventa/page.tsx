'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SmilePlus, ThumbsUp, FileBarChart2, MessageCircle, Users } from "lucide-react";

interface SubmoduloPostventa {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS_POSTVENTA: SubmoduloPostventa[] = [
  {
    id: "llegada-vehiculos",
    nombre: "Llegada de Vehículos",
    descripcion: "Informe de entrada de vehículos al taller y cumplimiento de citas.",
    ruta: "/dashboard/informes/postventa/llegada-vehiculos",
    icono: FileBarChart2,
    color: "from-sky-600 to-sky-700",
  },
  {
    id: "ventas-1a1",
    nombre: "Ventas 1 a 1",
    descripcion: "Informe de ventas 1 a 1 por asesor, utilidad y porcentaje de conversión.",
    ruta: "/dashboard/informes/postventa/ventas-1a1",
    icono: FileBarChart2,
    color: "from-indigo-600 to-indigo-700",
  },
  {
    id: "tiempo-entrevista-consultiva",
    nombre: "Tiempo Entrevista Consultiva",
    descripcion: "Informe de tiempos de entrevistas consultivas por bodega y cita.",
    ruta: "/dashboard/informes/postventa/tiempo-entrevista-consultiva",
    icono: FileBarChart2,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "inventario-obsoletos",
    nombre: "Inventario Obsoletos",
    descripcion: "Informe de inventario obsoleto con filtros por meses y costo.",
    ruta: "/dashboard/informes/postventa/inventario-obsoletos",
    icono: FileBarChart2,
    color: "from-slate-600 to-slate-700",
  },
  {
    id: "ticket-promedio-tecnico",
    nombre: "Ticket Promedio Técnico",
    descripcion: "Ticket promedio por técnico según ventas y órdenes por patio.",
    ruta: "/dashboard/informes/postventa/ticket-promedio-tecnico",
    icono: FileBarChart2,
    color: "from-fuchsia-500 to-fuchsia-600",
  },
  {
    id: "kpi",
    nombre: "KPI",
    descripcion: "Indicadores clave de mantenimiento preventivo, cargo a cliente y facturación por técnico.",
    ruta: "/dashboard/informes/postventa/kpi",
    icono: FileBarChart2,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "segunda-entrega",
    nombre: "Segunda Entrega",
    descripcion: "Informe de segundas entregas y agendas asociadas.",
    ruta: "/dashboard/informes/postventa/segunda-entrega",
    icono: FileBarChart2,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "retencion-72-0",
    nombre: "Retención 72-0",
    descripcion: "Informe de retención 72-0 para Flota y Retail.",
    ruta: "/dashboard/informes/postventa/retencion-72-0",
    icono: FileBarChart2,
    color: "from-red-500 to-rose-600",
  },
  {
    id: "nps-interno",
    nombre: "NPS Interno",
    descripcion: "Informe NPS interno por técnico, sedes y meses.",
    ruta: "/dashboard/informes/postventa/nps-interno",
    icono: FileBarChart2,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "productividad-tecnicos",
    nombre: "Productividad Técnicos",
    descripcion: "Horas trabajadas y productividad por técnico (mes actual y consolidado).",
    ruta: "/dashboard/informes/postventa/productividad-tecnicos",
    icono: FileBarChart2,
    color: "from-lime-500 to-lime-600",
  },
  {
    id: "nps-tecnicos",
    nombre: "NPS Técnicos",
    descripcion: "Detalle de NPS por técnico según sede y origen.",
    ruta: "/dashboard/informes/postventa/nps-tecnicos",
    icono: Users,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "mpc",
    nombre: "Mantenimiento Prepagado",
    descripcion: "Informe de planes de mantenimiento prepagado (MPC).",
    ruta: "/dashboard/informes/postventa/mpc",
    icono: FileBarChart2,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "encuesta-satisfaccion",
    nombre: "Encuesta de Satisfacción",
    descripcion: "Informe detallado de encuestas de satisfacción de clientes.",
    ruta: "/dashboard/informes/postventa/encuesta-satisfaccion",
    icono: SmilePlus,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "pqr-nps",
    nombre: "PQR / NPS",
    descripcion: "Gestión y seguimiento de PQR relacionadas con encuestas NPS.",
    ruta: "/dashboard/informes/postventa/pqr-nps",
    icono: MessageCircle,
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "pac-nps-interno-detallado",
    nombre: "Órdenes vs Encuestas (PAC NPS)",
    descripcion: "Resumen por bodega de órdenes finalizadas vs encuestas realizadas.",
    ruta: "/dashboard/informes/postventa/pac-nps-interno-detallado",
    icono: FileBarChart2,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "panel-nps",
    nombre: "Panel Gestión NPS",
    descripcion: "Panel de indicadores NPS general y por sede.",
    ruta: "/dashboard/informes/postventa/panel-nps",
    icono: FileBarChart2,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "encuestas-internas",
    nombre: "Encuestas Internas",
    descripcion: "Resultados y análisis de encuestas internas de postventa.",
    ruta: "/dashboard/informes/postventa/encuestas-internas",
    icono: MessageCircle,
    color: "from-violet-500 to-violet-600",
  },
];

export default function PostventaInformesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informes - Postventa</h1>
          <p className="text-gray-500 mt-1">
            Visualiza los principales informes operativos y de satisfacción del módulo de Postventa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SUBMODULOS_POSTVENTA.map((submodulo, index) => (
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

