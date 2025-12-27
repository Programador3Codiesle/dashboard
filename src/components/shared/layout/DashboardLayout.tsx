'use client';

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false); // Controla el overlay/visibilidad en mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // ✨ NUEVO: Controla el estado colapsado/expandido

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(false); // En desktop, no mostrar overlay
      } else {
        setIsCollapsed(false); // En mobile, asegurar que no esté colapsado (usará el estado `showSidebar`)
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar al cambiar ruta en mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [pathname, isMobile]);

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h2>
          <p className="text-gray-600">Por favor inicia sesión para continuar</p>
        </motion.div>
      </div>
    );
  }

  // Ancho del margen en desktop (lg:ml-X)
  const desktopMargin = isCollapsed ? 'lg:ml-20' : 'lg:ml-80';

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-amber-50/30">
      <Sidebar 
        currentPath={pathname} 
        onNavigate={router.push} 
        user={user} 
        isVisible={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        // ✨ PROPS NUEVAS
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onLogout={logout}
      />
      
      {/* Contenido principal - margen izquierdo dinámico en desktop */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? '' : desktopMargin}`}>
        <Header 
          currentPath={pathname} 
          onToggleSidebar={() => setShowSidebar(!showSidebar)} 
          onLogout={logout}
          userName={user?.nombre_usuario}
        />
        
        <motion.main 
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};