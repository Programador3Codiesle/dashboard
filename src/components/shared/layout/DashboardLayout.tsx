'use client';

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { SelectorEmpresaModal } from "@/components/auth/SelectorEmpresaModal";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, updateUser, isAuthenticated, loading } = useAuth();
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

  // Redirigir al login solo cuando la verificación de sesión haya terminado y no esté autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleEmpresaSelect = useCallback((empresaId: number) => {
    updateUser({ empresa: empresaId });
  }, [updateUser]);

  // Mostrar loading mientras se verifica la sesión (evita redirección prematura al recargar)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h2>
          <p className="text-gray-600">Por favor inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  // Ancho del margen en desktop (lg:ml-X)
  const desktopMargin = isCollapsed ? 'lg:ml-20' : 'lg:ml-80';

  const needsEmpresa = isAuthenticated && user && user.empresa == null;

  return (
    <div className="flex min-h-screen brand-dashboard-bg">
      <Sidebar 
        currentPath={pathname} 
        onNavigate={router.push} 
        user={user} 
        isVisible={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onLogout={logout}
        isMobile={isMobile}
        updateUser={updateUser}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? '' : desktopMargin}`}>
        <Header 
          currentPath={pathname} 
          onToggleSidebar={() => setShowSidebar(!showSidebar)} 
          onLogout={logout}
          userName={user?.nombre_usuario}
          nomPerfil={user?.nom_perfil}
          empresaId={user?.empresa}
        />
        
        <main className="flex-1 p-6 border-l-2 border-[var(--color-primary)]/20 min-h-0">
          {children}
        </main>
      </div>

      {needsEmpresa && (
        <SelectorEmpresaModal
          open
          onClose={() => {}}
          onSelect={handleEmpresaSelect}
        />
      )}
    </div>
  );
};