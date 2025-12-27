'use client';

import { ROUTES } from "@/utils/constants";
import { IUser } from "@/types/global";
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  ChevronLeft, // ✨ NUEVO: Icono para colapsar
  ChevronDown,
  TextAlignJustify, // ✨ NUEVO: Icono para dropdown
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: IUser | null;
  isVisible: boolean; // Controla la visibilidad en mobile
  onClose: () => void; // Cierra en mobile
  // ✨ PROPS NUEVAS
  isCollapsed: boolean; // Controla el estado colapsado/expandido en desktop
  onToggleCollapse: () => void; // Función para cambiar el estado de colapso
  onLogout?: () => void; // Función para cerrar sesión
}

export const Sidebar: React.FC<Props> = ({
  currentPath,
  onNavigate,
  user,
  isVisible,
  onClose,
  isCollapsed, // ✨ NUEVO
  onToggleCollapse, // ✨ NUEVO
  onLogout, // ✨ NUEVO
}) => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("Codiesel");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const companies = ["Codiesel", "Dieselco", "Mitsubishi", "ByD"];

  // ... (Tu useEffect de detección de mobile, es correcto y se mantiene)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Variantes de framer-motion para mobile/desktop
  const sidebarVariants = {
    // Mobile
    open: {
      x: 0,
      width: '20rem',
      transition: {
        type: "spring" as "spring",
        damping: 25
      }
    }, // 320px
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as "spring",
        damping: 25
      }
    },
    // Desktop (modificado para ser dinámico)
    expanded: {
      x: 0,
      width: '20rem', // w-80 (320px)
      transition: {
        type: "spring" as "spring",
        damping: 25,
        mass: 0.1
      }
    },
    collapsed: {
      x: 0,
      width: '5rem', // w-20 (80px)
      transition: {
        type: "spring" as "spring",
        damping: 25,
        mass: 0.1
      }
    }
  };

  // Determinar el estado de animación de desktop
  const desktopAnimationState = isCollapsed ? "collapsed" : "expanded";

  // En desktop siempre visible, en móvil controlado por isVisible (se mantiene)
  const shouldShowOverlay = isMobile && isVisible;

  // Función helper para determinar si una ruta está activa (incluye subrutas)
  const isRouteActive = (routePath: string) => {
    if (currentPath === routePath) return true;
    // Si la ruta es "/dashboard", solo coincidir exactamente (no con subrutas)
    if (routePath === "/dashboard") return currentPath === "/dashboard";
    // Para otras rutas, verificar si el pathname actual comienza con la ruta seguida de "/"
    return currentPath.startsWith(routePath + "/");
  };

  // Filtrar rutas según el perfil del usuario
  // Solo usuarios con perfil "20" o "2" pueden ver la opción de Usuarios
  const filteredRoutes = useMemo(() => {
    const canViewUsuarios = user?.perfil_postventa === "20" || user?.perfil_postventa === "2";
    
    return ROUTES.filter(route => {
      // Si es la ruta de usuarios, verificar permisos
      if (route.path === "/dashboard/usuarios") {
        return canViewUsuarios;
      }
      // Todas las demás rutas se muestran normalmente
      return true;
    });
  }, [user?.perfil_postventa]);

  return (
    <>
      <AnimatePresence>
        {shouldShowOverlay && (
          <motion.div
            // ... (Tu overlay se mantiene, es correcto)
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
            variants={{ open: { opacity: 1, pointerEvents: "auto" }, closed: { opacity: 0, pointerEvents: "none" } }}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        // Ancho y clases base: La clase w-80 ya no es fija, se define por `motion.aside`
        className="fixed inset-y-0 left-0 bg-linear-to-br from-gray-900 to-black border-r border-gray-800 text-white flex flex-col z-50 shadow-2xl overflow-hidden"
        variants={sidebarVariants}
        initial={isMobile ? "closed" : desktopAnimationState} // Inicializa con el estado correcto
        animate={isMobile ? (isVisible ? "open" : "closed") : desktopAnimationState} // Anima según mobile o desktop
      >
        {/* Header del Sidebar */}
        <div className={`p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center space-x-3 transition-opacity ${isCollapsed ? 'opacity-0 absolute' : 'opacity-100 relative'}`}>
            <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 font-bold text-lg bg-linear-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity"
                >
                  {selectedCompany}
                  <ChevronDown size={16} className={`text-amber-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {companies.map((company) => (
                        <button
                          key={company}
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${selectedCompany === company ? 'text-amber-400 font-medium bg-gray-800/50' : 'text-gray-300'
                            }`}
                        >
                          {company}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">Dashboard</p>
            </div>
          </div>

          {/* Botón de Colapsar/Cerrar */}
          <motion.button
            onClick={isMobile ? onClose : onToggleCollapse}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isMobile ? 0 : (isCollapsed ? 180 : 0) }}
          >
            {isMobile ? <X size={20} /> : <TextAlignJustify size={20} className="text-amber-400" />}
          </motion.button>
        </div>

        {/* Navegación */}
        <nav className="p-2 flex-1 overflow-y-auto">
          {/* Ocultar texto de 'Navegación Principal' si está colapsado */}
          <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100 h-auto p-4'}`}>
            Navegación Principal
          </p>

          <div className="space-y-2">
            {filteredRoutes.map((route) => (
              <motion.button
                key={route.path}
                onClick={() => {
                  onNavigate(route.path);
                  if (isMobile) onClose();
                }}
                onHoverStart={() => setIsHovered(route.path)}
                onHoverEnd={() => setIsHovered(null)}
                className={`
                  relative flex items-center w-full p-2 rounded-xl transition-all duration-300
                  ${isRouteActive(route.path)
                    ? "bg-linear-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "hover:bg-gray-800/50 border border-transparent"
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-between px-4'}
                `}
              >
                <div className="flex items-center">
                  {/* Icono (siempre visible) */}
                  <div className={`
                    p-2 rounded-lg mr-0 transition-colors shrink-0
                    ${isCollapsed ? 'mr-0' : 'mr-3'} 
                    ${isRouteActive(route.path)
                      ? "bg-amber-500 text-white"
                      : "bg-gray-800 text-amber-400"
                    }
                  `}>
                    <route.icon size={18} />
                  </div>
                  {/* Nombre de la ruta (ocultar si colapsado) */}
                  <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {route.name}
                  </span>
                </div>

                {/* Flecha (ocultar si colapsado, mostrar si activo o hover) */}
                {!isCollapsed && (
                  <motion.div
                    animate={{
                      x: isHovered === route.path || isRouteActive(route.path) ? 0 : -5,
                      opacity: isHovered === route.path || isRouteActive(route.path) ? 1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ChevronRight size={16} className="text-amber-400" />
                  </motion.div>
                )}

                {/* Indicador activo (ajustar posición si colapsado) */}
                {isRouteActive(route.path) && (
                  <motion.div
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-l-full`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className={`p-6 border-t border-gray-800 bg-gray-900/30 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-6'}`}>
          {/* Info de usuario: se vuelve solo un avatar al colapsar */}
          <div className={`flex items-center space-x-3 mb-4 p-3 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center bg-transparent' : 'bg-gray-800/50'}`}>
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.nombre_usuario?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {/* Ocultar texto al colapsar */}
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-semibold truncate">
                {user?.nombre_usuario 
                  ? user.nombre_usuario.split(' ')[0] // Solo primer nombre
                  : user?.name || 'Usuario'
                }
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button className={`p-2 hover:bg-gray-700 rounded-lg transition-colors shrink-0 ${isCollapsed ? 'hidden' : 'block'}`}>
              <Settings size={16} />
            </button>
          </div>

          {/* Botón de Cerrar Sesión: se vuelve solo un icono al colapsar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (onLogout) {
                onLogout();
              }
            }}
            className={`
              flex items-center w-full p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20
              ${isCollapsed ? 'justify-center p-2' : 'justify-start'}
            `}
          >
            <LogOut size={18} className={`${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              Cerrar Sesión
            </span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};