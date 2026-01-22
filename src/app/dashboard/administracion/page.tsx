'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Car,
  UserCheck,
  FileText,
  ShoppingCart,
  UserX,
  Calendar,
  FileCheck,
  Clock,
  CalendarDays,
  Shirt,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";

interface Submodulo {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS: Submodulo[] = [
  {
    id: "ajustes-valores",
    nombre: "Ajustes Valores Contables",
    descripcion: "Gestión y ajuste de valores contables multiempresa",
    ruta: "/dashboard/administracion/ajustes-valores-contables",
    icono: Calculator,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "control-vehiculos",
    nombre: "Control Ingreso y Salida de Vehículos",
    descripcion: "Registro y control de ingresos y salidas de vehículos",
    ruta: "/dashboard/administracion/control-vehiculos",
    icono: Car,
    color: "from-green-500 to-green-600",
  },
  {
    id: "evaluacion-desempeno",
    nombre: "Evaluación Desempeño Empleado",
    descripcion: "Evaluación de desempeño por jefe inmediato",
    ruta: "/dashboard/administracion/evaluacion-desempeno",
    icono: UserCheck,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "formato-desempeno",
    nombre: "Formato Desempeño Empleado",
    descripcion: "Autoevaluación de desempeño por empleado",
    ruta: "/dashboard/administracion/formato-desempeno-empleado",
    icono: FileText,
    color: "from-indigo-500 to-indigo-600",
  },  
  {
    id: "formato-orden-salida",
    nombre: "Formato Orden de Salida",
    descripcion: "Consulta de órdenes de salida por placa",
    ruta: "/dashboard/administracion/formato-orden-salida",
    icono: ClipboardList,
    color: "from-stone-500 to-stone-600",
  },
  {
    id: "gestion-compras",
    nombre: "Gestión de Compras",
    descripcion: "Solicitudes y gestión de compras multiempresa",
    ruta: "/dashboard/administracion/gestion-compras",
    icono: ShoppingCart,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "inasistencia",
    nombre: "Inasistencia",
    descripcion: "Informe de inasistencia de empleados",
    ruta: "/dashboard/administracion/inasistencia",
    icono: UserX,
    color: "from-red-500 to-red-600",
  },
  {
    id: "informe-ausentismo",
    nombre: "Informe Ausentismo",
    descripcion: "Informe detallado de ausentismo multiempresa",
    ruta: "/dashboard/administracion/informe-ausentismo",
    icono: Calendar,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "informe-sostenibilidad",
    nombre: "Informe de Sostenibilidad 2024",
    descripcion: "Visualización del informe de sostenibilidad",
    ruta: "/dashboard/administracion/informe-sostenibilidad",
    icono: FileCheck,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "informe-tiempo-suplementario",
    nombre: "Informe Tiempo Suplementario",
    descripcion: "Informe de tiempo suplementario multiempresa",
    ruta: "/dashboard/administracion/informe-tiempo-suplementario",
    icono: Clock,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "lista-ausentismo",
    nombre: "Lista Ausentismo",
    descripcion: "Ausentismos del día actual",
    ruta: "/dashboard/administracion/lista-ausentismo",
    icono: CalendarDays,
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "lista-horas-extras",
    nombre: "Lista Horas Extras",
    descripcion: "Horas extras del día actual",
    ruta: "/dashboard/administracion/lista-horas-extras",
    icono: TrendingUp,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "nuevo-ausentismo",
    nombre: "Nuevo Ausentismo",
    descripcion: "Registro de nuevos ausentismos",
    ruta: "/dashboard/administracion/nuevo-ausentismo",
    icono: AlertCircle,
    color: "from-violet-500 to-violet-600",
  },
  {
    id: "solicitud-tiempo-suplementario",
    nombre: "Solicitud Tiempo Suplementario",
    descripcion: "Solicitud de tiempo suplementario",
    ruta: "/dashboard/administracion/solicitud-tiempo-suplementario",
    icono: Users,
    color: "from-sky-500 to-sky-600",
  },
  {
    id: "tallas-dotacion",
    nombre: "Tallas Dotación",
    descripcion: "Actualización de tallas para dotación",
    ruta: "/dashboard/administracion/tallas-dotacion",
    icono: Shirt,
    color: "from-lime-500 to-lime-600",
  },
  {
    id: "reglamento-interno",
    nombre: "Reglamento Interno de Trabajo",
    descripcion: "Consulta del reglamento interno",
    ruta: "/dashboard/administracion/reglamento-interno",
    icono: BookOpen,
    color: "from-slate-500 to-slate-600",
  },

];

export default function AdministracionPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Administración</h1>
          <p className="text-gray-500 mt-1">Gestiona todos los módulos administrativos de la empresa</p>
        </div>
      </div>

      {/* Grid de Submódulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SUBMODULOS.map((submodulo, index) => (
          <motion.div
            key={submodulo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(submodulo.ruta)}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
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

