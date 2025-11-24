import React from 'react';

interface CardProps {
  title: string;
  value: string;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, color }) => (
  <div className={`p-6 rounded-xl shadow-lg text-white ${color}`}>
    <p className="text-sm font-light uppercase opacity-90">{title}</p>
    <p className="text-3xl font-extrabold mt-1">{value}</p>
  </div>
);

const DashboardPage: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card title="Usuarios Activos" value="2,450" color="bg-indigo-500" />
    <Card title="Transacciones Hoy" value="$12,890" color="bg-green-500" />
    <Card title="Tickets Pendientes" value="14" color="bg-yellow-500" />
    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gráfico de Actividad Semanal</h2>
      <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
        [Simulación de componente de Gráfico aquí]
      </div>
    </div>
  </div>
);

export default DashboardPage;
