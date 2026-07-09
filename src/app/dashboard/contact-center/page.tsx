'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  ClipboardCheck,
  Database,
  Grid3X3,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import {
  AGENDAMIENTO_LEADS_SUBMENU_ID,
  AUDITORIA_CC_SUBMENU_ID,
  CODIESEL_EMPRESA_ID,
  DISTRIBUCION_AGENTE_CC_SUBMENU_ID,
  DISTRIBUCION_CC_SUBMENU_ID,
  INFORME_BASE_DATOS_CC_SUBMENU_ID,
} from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';

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
    id: 'informe-base-datos',
    nombre: 'Bases de datos',
    descripcion: 'Informes de clientes por tiempo, kilometraje o fecha de entrega',
    ruta: '/dashboard/contact-center/informe-base-datos',
    submenuId: INFORME_BASE_DATOS_CC_SUBMENU_ID,
    icono: Database,
  },
  {
    id: 'distribucion',
    nombre: 'Distribución',
    descripcion: 'Matriz de asignación agente por bodega con porcentajes',
    ruta: '/dashboard/contact-center/distribucion',
    submenuId: DISTRIBUCION_CC_SUBMENU_ID,
    icono: Grid3X3,
  },
  {
    id: 'distribucion-agente',
    nombre: 'Distribución Agentes',
    descripcion: 'Gestiones actuales, futuras y recordación del agente',
    ruta: '/dashboard/contact-center/distribucion-agente',
    submenuId: DISTRIBUCION_AGENTE_CC_SUBMENU_ID,
    icono: UserCheck,
  },
  {
    id: 'agendamiento-leads',
    nombre: 'Admin LEADS',
    descripcion: 'Asignación y gestión de leads de postventa',
    ruta: '/dashboard/contact-center/agendamiento-leads',
    submenuId: AGENDAMIENTO_LEADS_SUBMENU_ID,
    icono: PhoneCall,
  },
  {
    id: 'auditoria',
    nombre: 'Auditoría',
    descripcion: 'Auditorías de agentes, configuración e informes detallados',
    ruta: '/dashboard/contact-center/auditoria',
    submenuId: AUDITORIA_CC_SUBMENU_ID,
    icono: ClipboardCheck,
  },
];

export default function ContactCenterPage() {
  const router = useRouter();
  const { user } = useAuth();
  useContactCenterPageGuard();

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
        <h1 className="app-title-xl brand-text">Contact Center</h1>
        <p className="text-gray-500 mt-1">
          Distribución de agentes, leads, auditorías e informes de bases de datos
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
