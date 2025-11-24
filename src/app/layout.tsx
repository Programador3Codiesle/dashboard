'use client';

import React, { useState, useMemo } from 'react';
import { LayoutDashboard, ReceiptText, Calendar, ShieldCheck, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/shared/atoms/Button';
import { IUser } from '@/types/global';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/core/auth/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

// Sidebar
const Sidebar: React.FC<{
  currentPath: string;
  onNavigate: (path: string) => void;
  user: IUser | null;
  isVisible: boolean;
  onClose: () => void;
}> = ({ currentPath, onNavigate, user, isVisible, onClose }) => {
  const sidebarClasses = isVisible
    ? 'fixed inset-y-0 left-0 transform translate-x-0 w-64 z-40'
    : 'fixed inset-y-0 left-0 transform -translate-x-full w-64 z-40 lg:translate-x-0 lg:w-64';

  return (
    <>
      {isVisible && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={onClose}></div>}
      <div className={`transition-transform duration-300 ease-in-out ${sidebarClasses} bg-gray-900 text-white flex flex-col`}>
        {/* Contenido Sidebar */}
      </div>
    </>
  );
};

// Header
const Header: React.FC<{
  currentPath: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
}> = ({ currentPath, onLogout, onToggleSidebar }) => {
  const currentRoute = useMemo(() => ROUTES.find(r => r.path === currentPath)?.name || '404', [currentPath]);

  return (
    <header className="sticky top-0 z-20 bg-white shadow-md p-4 flex justify-between items-center">
      {/* Contenido Header */}
    </header>
  );
};

// Layout raíz
const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleToggleSidebar = () => setIsSidebarVisible(prev => !prev);
  const handleCloseSidebar = () => setIsSidebarVisible(false);

  return (
    <html lang="es">
      <body className="bg-gray-50">
        {!isAuthenticated ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-10 bg-white rounded-xl shadow-2xl text-center">
              <h1 className="text-3xl font-bold text-indigo-600 mb-4">Acceso Denegado</h1>
              <p className="mb-6 text-gray-600">Por favor, inicia sesión para continuar.</p>
              <Button onClick={() => console.log('Simulando login...')}>Simular Login</Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar currentPath="/dashboard" onNavigate={() => {}} user={user} isVisible={isSidebarVisible} onClose={handleCloseSidebar} />
            <div className="flex-1 lg:ml-64 flex flex-col">
              <Header currentPath="/dashboard" onLogout={logout} onToggleSidebar={handleToggleSidebar} />
              <main className="p-4 md:p-8 flex-1">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
};

export default RootLayout;
