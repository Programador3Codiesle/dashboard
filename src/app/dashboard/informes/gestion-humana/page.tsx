'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CalendarRange, Clock, Activity, ClipboardList, LogIn, LogOut, Truck, ListChecks, ShoppingCart, Car, Bike } from "lucide-react";

interface SubmoduloGestionHumana {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SUBMODULOS_GESTION_HUMANA: SubmoduloGestionHumana[] = [
  {
    id: "inf-ausentismos",
    nombre: "Informe Tiempo de Ausentismos",
    descripcion: "Consulta de tiempo de ausentismos por empleado y mes, con exportación a Excel.",
    ruta: "/dashboard/informes/gestion-humana/inf-ausentismos",
    icono: CalendarRange,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "checklist-carro",
    nombre: "Checklist Carro",
    descripcion: "Informe detallado de checklist de vehículos por sede y fechas.",
    ruta: "/dashboard/informes/gestion-humana/checklist-carro",
    icono: Car,
    color: "from-sky-600 to-sky-700",
  },
  {
    id: "checklist-moto",
    nombre: "Checklist Moto",
    descripcion: "Informe detallado de checklist de motos por sede y fechas.",
    ruta: "/dashboard/informes/gestion-humana/checklist-moto",
    icono: Bike,
    color: "from-teal-600 to-teal-700",
  },
  {
    id: "control-compras",
    nombre: "Control Compras",
    descripcion: "Control de compras por número de orden con existencias por bodega.",
    ruta: "/dashboard/informes/gestion-humana/control-compras",
    icono: ShoppingCart,
    color: "from-amber-600 to-amber-700",
  },
  {
    id: "indicador-checklist",
    nombre: "Indicador Checklist",
    descripcion: "Número de registros por sede para los diferentes checklists de equipos.",
    ruta: "/dashboard/informes/gestion-humana/indicador-checklist",
    icono: ListChecks,
    color: "from-lime-500 to-lime-600",
  },
  {
    id: "indicador-checklist-pesv",
    nombre: "Indicador Checklist PESV",
    descripcion: "Número de registros de checklist PESV por placa y tipo de vehículo.",
    ruta: "/dashboard/informes/gestion-humana/indicador-checklist-pesv",
    icono: ListChecks,
    color: "from-lime-600 to-lime-700",
  },
  {
    id: "checklists-equipos",
    nombre: "Checklist Equipos",
    descripcion: "Detalle de los diferentes checklists de equipos por rango de fechas.",
    ruta: "/dashboard/informes/gestion-humana/checklists",
    icono: ListChecks,
    color: "from-lime-700 to-lime-800",
  },
  {
    id: "informe-ordenes-salida",
    nombre: "Informe Órdenes de Salida",
    descripcion: "Consulta y gestión de observaciones de las órdenes de salida.",
    ruta: "/dashboard/informes/gestion-humana/ordenes-salida",
    icono: ClipboardList,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "tallas-personal",
    nombre: "Tallas dotación",
    descripcion: "Informe de tallas de camisa, pantalón y botas del personal.",
    ruta: "/dashboard/informes/gestion-humana/tallas-personal",
    icono: ClipboardList,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "desempeno-empleado",
    nombre: "Desempeño Empleado",
    descripcion: "Informe de desempeño de empleados por año y sede.",
    ruta: "/dashboard/informes/gestion-humana/desempeno-empleado",
    icono: ClipboardList,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "tiempo-gestion-compras",
    nombre: "Tiempo Gestión Compras",
    descripcion: "Informe de tiempos de gestión de compras por fecha y estado.",
    ruta: "/dashboard/informes/gestion-humana/tiempo-gestion-compras",
    icono: Clock,
    color: "from-sky-700 to-sky-800",
  },
  {
    id: "llegadas-tarde",
    nombre: "Llegadas Tarde",
    descripcion: "Informe de llegadas tarde por sede, empleado y rango de fechas.",
    ruta: "/dashboard/informes/gestion-humana/llegadas-tarde",
    icono: Clock,
    color: "from-red-500 to-red-600",
  },
  {
    id: "control-vehicular",
    nombre: "Informe Control Vehicular",
    descripcion: "Ingreso y salida de vehículos por portería, con detalle por registro.",
    ruta: "/dashboard/informes/gestion-humana/control-vehicular",
    icono: Truck,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "entradas-salidas",
    nombre: "Entradas y salidas",
    descripcion: "Resumen de movimientos de entrada y salida por sede y fecha.",
    ruta: "/dashboard/informes/gestion-humana/entradas-salidas",
    icono: LogOut,
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "ingreso-empleados",
    nombre: "Ingreso de empleados",
    descripcion: "Reporte detallado de horarios de llegada y salida por empleado.",
    ruta: "/dashboard/informes/gestion-humana/ingreso-empleados",
    icono: LogIn,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "informe-tiempo-suplementario",
    nombre: "Informe Tiempo Suplementario",
    descripcion: "Listado y análisis de tiempo suplementario (horas extra) por empleado.",
    ruta: "/dashboard/informes/gestion-humana/informe-tiempo-suplementario",
    icono: Clock,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "informe-pausas-activas",
    nombre: "Informe Pausas Activas",
    descripcion: "Control de pausas activas por sede, empleado y fecha.",
    ruta: "/dashboard/informes/gestion-humana/informe-pausas-activas",
    icono: Activity,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "informe-ausentismo-detallado",
    nombre: "Informe Ausentismo Detallado",
    descripcion: "Detalle de ausentismos por rangos de fechas, sede y área.",
    ruta: "/dashboard/informes/gestion-humana/informe-ausentismo-detallado",
    icono: ClipboardList,
    color: "from-rose-500 to-rose-600",
  },
];

export default function GestionHumanaInformesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informes - Gestión Humana</h1>
          <p className="text-gray-500 mt-1">
            Consulta y analiza la información de ausentismos, tiempo suplementario y otros indicadores de talento humano.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SUBMODULOS_GESTION_HUMANA.map((submodulo, index) => (
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

