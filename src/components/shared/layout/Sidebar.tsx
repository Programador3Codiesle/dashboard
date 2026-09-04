'use client';

import { EMPRESAS } from "@/utils/constants";
import { IUser } from "@/types/global";
import {
  X,
  LogOut,
  Settings,
  ChevronDown,
  TextAlignJustify,
} from "lucide-react";
import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav } from "./SidebarNav";
import { EmpresaIcon } from "@/components/shared/brand/EmpresaIcon";

interface SidebarProps {
  user: IUser | null;
  isVisible: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
  isMobile: boolean;
  updateUser: (partial: Partial<IUser>) => void;
}

function SidebarComponent({
  user,
  isVisible,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  isMobile,
  updateUser,
}: SidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const empresasDisponibles = useMemo(() => {
    const idsPermitidos = new Set(user?.empresas_asignadas || []);
    return EMPRESAS.filter((empresa) => idsPermitidos.has(empresa.id));
  }, [user?.empresas_asignadas]);

  const selectedEmpresa = user?.empresa != null ? EMPRESAS.find((e) => e.id === user.empresa) : null;
  const selectedCompanyName = selectedEmpresa?.nombre ?? "Seleccionar";
  const shouldShowOverlay = isMobile && isVisible;

  const asideClassName = isMobile
    ? `fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden border-r border-gray-800 bg-linear-to-br from-gray-900 to-black text-white shadow-2xl transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "-translate-x-full"}`
    : `fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-gray-800 bg-linear-to-br from-gray-900 to-black text-white shadow-2xl transition-[width] duration-300 ease-out ${isCollapsed ? "w-20" : "w-80 2xl:w-88"}`;

  return (
    <>
      <AnimatePresence>
        {shouldShowOverlay && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={asideClassName}>
        <div
          className={`flex border-b border-gray-800 bg-gray-900/50 ${
            isCollapsed && !isMobile
              ? "flex-col items-center justify-center gap-2 p-3"
              : "items-center justify-between p-6"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed && !isMobile ? "hidden" : "space-x-3"
            }`}
          >
            <EmpresaIcon
              empresaId={user?.empresa}
              size={56}
              className="h-14 w-14"
            />
            <div
              className={
                isCollapsed && !isMobile ? "hidden" : "relative"
              }
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 whitespace-nowrap text-lg font-bold brand-text transition-opacity hover:opacity-80"
                >
                  {selectedCompanyName}
                  <ChevronDown size={16} className={`brand-text transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
                    {empresasDisponibles.map((empresa) => (
                      <button
                        key={empresa.id}
                        type="button"
                        onClick={() => {
                          updateUser({ empresa: empresa.id });
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-800 ${user?.empresa === empresa.id ? "bg-gray-800/50 font-medium brand-text" : "text-gray-300"}`}
                      >
                        <EmpresaIcon empresaId={empresa.id} size={20} className="h-5 w-5" />
                        {empresa.nombre}
                      </button>
                    ))}
                    {empresasDisponibles.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400">Sin empresas asignadas</div>
                    )}
                  </div>
                )}
              </div>
              <p className="whitespace-nowrap text-xs text-gray-400">Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={isMobile ? onClose : onToggleCollapse}
            className="shrink-0 rounded-lg p-2 transition-all duration-200 hover:scale-105 hover:bg-gray-800 active:scale-95"
            style={{ transform: !isMobile && isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            {isMobile ? <X size={20} /> : <TextAlignJustify size={20} className="brand-text" />}
          </button>
        </div>

        <SidebarNav
          user={user}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          onClose={onClose}
          onExpand={!isMobile && isCollapsed ? onToggleCollapse : undefined}
        />

        <div className={`border-t border-gray-800 bg-gray-900/30 transition-all duration-300 ${isCollapsed ? "p-2" : "p-6"}`}>
          <div className={`mb-4 flex items-center rounded-xl transition-all duration-300 ${isCollapsed ? "justify-center bg-transparent p-0" : "space-x-3 bg-gray-800/50 p-3"}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-bg-gradient">
              <span className="text-sm font-bold text-white">
                {user?.nombre_usuario?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className={`min-w-0 flex-1 transition-opacity duration-300 ${isCollapsed ? "hidden w-0 opacity-0" : "w-auto opacity-100"}`}>
              <p className="truncate text-sm font-semibold">
                {user?.nombre_usuario ? user.nombre_usuario.split(" ")[0] : user?.name || "Usuario"}
              </p>
              <p className="text-xs capitalize text-gray-400">{user?.role}</p>
            </div>
            <button type="button" className={`shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-700 ${isCollapsed ? "hidden" : "block"}`}>
              <Settings size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onLogout?.()}
            className={`flex w-full items-center rounded-lg border border-red-500/20 p-3 text-red-400 transition-all duration-200 hover:scale-[1.02] hover:bg-red-500/10 active:scale-[0.98] ${isCollapsed ? "justify-center p-2" : "justify-start"}`}
          >
            <LogOut size={18} className={isCollapsed ? "mr-0" : "mr-3"} />
            <span className={`whitespace-nowrap font-medium transition-all duration-300 ${isCollapsed ? "hidden w-0 opacity-0" : "w-auto opacity-100"}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export const Sidebar = memo(SidebarComponent);
