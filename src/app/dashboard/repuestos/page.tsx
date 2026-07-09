'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  ClipboardList,
  FileBarChart2,
  PackagePlus,
  ShoppingCart,
  TableProperties,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import {
  CODIESEL_EMPRESA_ID,
  ENTRADAS_VARIAS_SUBMENU_ID,
  INFORME_EV_SV_SUBMENU_ID,
  INFORME_OBSOLETOS_SUBMENU_ID,
  INVENTARIO_OBSOLETOS_SUBMENU_ID,
  ORDEN_COMPRA_SUBMENU_ID,
  SOLICITUDES_EV_SUBMENU_ID,
} from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';

interface Submodulo {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  submenuId: number;
  icono: React.ComponentType<{ size?: number; className?: string }>;
}

const SUBMODULOS: Submodulo[] = [
  {
    id: 'entradas-varias',
    nombre: 'Entradas Varias',
    descripcion: 'Crear solicitudes de entrada varia por orden de taller',
    ruta: '/dashboard/repuestos/entradas-varias',
    submenuId: ENTRADAS_VARIAS_SUBMENU_ID,
    icono: PackagePlus,
  },
  {
    id: 'solicitudes-ev',
    nombre: 'Gestión Entradas Varias',
    descripcion: 'Autorizar, registrar EV/SV y gestionar entregas de repuestos',
    ruta: '/dashboard/repuestos/solicitudes-ev',
    submenuId: SOLICITUDES_EV_SUBMENU_ID,
    icono: ClipboardList,
  },
  {
    id: 'informe-ev-sv',
    nombre: 'Informe Solicitudes EV y SV',
    descripcion: 'Seguimiento del flujo de solicitudes con estados por color',
    ruta: '/dashboard/repuestos/informe-ev-sv',
    submenuId: INFORME_EV_SV_SUBMENU_ID,
    icono: Truck,
  },
  {
    id: 'inventario-obsoletos',
    nombre: 'Inventario Obsoletos',
    descripcion: 'Resumen por categoría con detalle y simulación de descuentos',
    ruta: '/dashboard/repuestos/inventario-obsoletos',
    submenuId: INVENTARIO_OBSOLETOS_SUBMENU_ID,
    icono: TableProperties,
  },
  {
    id: 'informe-obsoletos',
    nombre: 'Informe Obsoletos',
    descripcion: 'Consulta filtrada por rangos de meses y costo promedio',
    ruta: '/dashboard/repuestos/informe-obsoletos',
    submenuId: INFORME_OBSOLETOS_SUBMENU_ID,
    icono: FileBarChart2,
  },
  {
    id: 'orden-compra',
    nombre: 'Órdenes de Compra',
    descripcion: 'Gestión, autorización y presupuesto de compras de repuestos',
    ruta: '/dashboard/repuestos/orden-compra',
    submenuId: ORDEN_COMPRA_SUBMENU_ID,
    icono: ShoppingCart,
  },
];

export default function RepuestosPage() {
  const router = useRouter();
  const { user } = useAuth();
  useRepuestosPageGuard();

  const submodulosFiltrados = useMemo(() => {
    if (user?.empresa !== CODIESEL_EMPRESA_ID) return [];

    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions) return SUBMODULOS;

    const submenusPermitidos = new Set(user.submenus_permitidos);
    return SUBMODULOS.filter((s) => submenusPermitidos.has(s.submenuId));
  }, [user?.submenus_permitidos, user?.empresa]);

  if (user && user.empresa !== CODIESEL_EMPRESA_ID) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Repuestos</h1>
        <p className="text-gray-500 mt-1">
          Gestión de entradas varias, inventario obsoleto y órdenes de compra
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
            <p className="text-sm text-gray-600 leading-relaxed">
              {submodulo.descripcion}
            </p>
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
