// app/dashboard/page.tsx
'use client';

import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const stats = [
  { icon: DollarSign, value: "$45,231", label: "Ingresos", change: "+12%" },
  { icon: Users, value: "+2,350", label: "Usuarios", change: "+18%" },
  { icon: TrendingUp, value: "12,234", label: "Ventas", change: "+8%" },
  { icon: Activity, value: "573", label: "Activos", change: "+5%" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-500 font-medium mt-1">{stat.change}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <stat.icon className="text-amber-600" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
          {/* Contenido del gráfico */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-4">Rendimiento</h3>
          {/* Contenido del rendimiento */}
        </motion.div>
      </div>
    </div>
  );
}