'use client';

import { Menu, LogOut, Bell, Search, User, Settings } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  currentPath: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  userName?: string; // Nombre completo del usuario
}

export const Header: React.FC<Props> = ({ currentPath, onToggleSidebar, onLogout, userName }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const currentTitle = useMemo(
    () => ROUTES.find(r => r.path === currentPath)?.name || "Dashboard",
    [currentPath]
  );

  // Función para formatear el nombre: convertir de mayúsculas a formato capitalizado
  // y reordenar de APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2 a NOMBRE1 NOMBRE2 APELLIDO1 APELLIDO2
  const formatNombre = (nombreCompleto: string): string => {
    if (!nombreCompleto) return '';
    
    const palabras = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (palabras.length === 0) return nombreCompleto;
    
    // Capitalizar cada palabra (primera letra mayúscula, resto minúscula)
    const palabrasCapitalizadas = palabras.map(palabra => 
      palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    );
    
    // Si tiene 1 o 2 palabras, devolver directamente capitalizadas
    if (palabrasCapitalizadas.length <= 2) {
      return palabrasCapitalizadas.join(' ');
    }
    
    // Para 3 palabras: asumimos formato APELLIDO1 APELLIDO2 NOMBRE
    // Resultado: NOMBRE APELLIDO1 APELLIDO2
    if (palabrasCapitalizadas.length === 3) {
      const [apellido1, apellido2, nombre] = palabrasCapitalizadas;
      return `${nombre} ${apellido1} ${apellido2}`;
    }
    
    // Para 4 o más palabras: asumimos formato APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2...
    // Separamos en dos mitades: primera mitad son apellidos, segunda mitad son nombres
    const mitad = Math.floor(palabrasCapitalizadas.length / 2);
    const apellidos = palabrasCapitalizadas.slice(0, mitad);
    const nombres = palabrasCapitalizadas.slice(mitad);
    
    // Retornar: NOMBRES APELLIDOS
    return [...nombres, ...apellidos].join(' ');
  };

  const formattedName = userName ? formatNombre(userName) : '';

  return (
    <motion.header 
      className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="px-6 py-4 max-w-8xl mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu size={20} />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {currentTitle}
            </h1>
            <p className="text-sm text-gray-500">Bienvenido de vuelta</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {formattedName && (
            <p className="text-lg text-gray-800 font-medium">{formattedName}</p>
          )}
          {/* Profile Menu */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 p-2 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-xl"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User size={18} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50">
                    <User size={16} className="mr-2" />
                    Mi Perfil
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50">
                    <Settings size={16} className="mr-2" />
                    Configuración
                  </button>
                  <div className="border-t my-1"></div>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};