'use client';

import { Menu, LogOut, User, Settings } from "lucide-react";
import { ROUTES, EMPRESAS } from "@/utils/constants";
import React, { useMemo, useState, memo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  currentPath: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  userName?: string;
  /** Nombre del perfil (postv_perfiles.nom_perfil), viene del login */
  nomPerfil?: string;
  empresaId?: number;
}

function formatNombre(nombreCompleto: string): string {
  if (!nombreCompleto) return '';

  const palabras = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 0);
  if (palabras.length === 0) return nombreCompleto;

  const palabrasCapitalizadas = palabras.map(palabra =>
    palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
  );

  if (palabrasCapitalizadas.length <= 2) {
    return palabrasCapitalizadas.join(' ');
  }

  if (palabrasCapitalizadas.length === 3) {
    const [apellido1, apellido2, nombre] = palabrasCapitalizadas;
    return `${nombre} ${apellido1} ${apellido2}`;
  }

  const mitad = Math.floor(palabrasCapitalizadas.length / 2);
  const apellidos = palabrasCapitalizadas.slice(0, mitad);
  const nombres = palabrasCapitalizadas.slice(mitad);

  return [...nombres, ...apellidos].join(' ');
}

/** Vista corta tipo "Cristhian Sanchez" a partir del nombre ya formateado para pantalla */
function nombreCompacto(nombreFormateado: string): string {
  const w = nombreFormateado.trim().split(/\s+/).filter(Boolean);
  if (w.length <= 2) return nombreFormateado.trim();
  if (w.length === 3) return `${w[0]} ${w[1]}`;
  return `${w[0]} ${w[2]}`;
}

function HeaderComponent({ currentPath, onToggleSidebar, onLogout, userName, nomPerfil, empresaId }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const empresa = empresaId != null ? EMPRESAS.find((e) => e.id === empresaId) : null;

  const currentTitle = useMemo(() => {

    const exactMatch = ROUTES.find(r => r.path === currentPath);
    if (exactMatch) return exactMatch.name;

    const sortedRoutes = [...ROUTES].sort((a, b) => b.path.length - a.path.length);
    const matchingRoute = sortedRoutes.find(r => {
      if (r.path === "/dashboard") {
        return currentPath === "/dashboard";
      }
      return currentPath.startsWith(r.path + "/") || currentPath === r.path;
    });

    return matchingRoute?.name || "Dashboard";
  }, [currentPath]);

  const formattedFullName = userName ? formatNombre(userName) : '';
  const formattedShortName = formattedFullName ? nombreCompacto(formattedFullName) : '';

  const rolEtiqueta = nomPerfil?.trim() || '';

  useEffect(() => {
    if (!showProfile) return;
    const onDocClick = (e: MouseEvent) => {
      const el = profileWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showProfile]);

  return (
    <motion.header
      className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-8xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden shrink-0 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu size={20} />
          </motion.button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-linear-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                {currentTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Bienvenido de vuelta</p>
            </div>
            {empresa && (
              <span
                className="hidden sm:inline-flex shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: empresa.color }}
              >
                {empresa.nombre}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {(formattedFullName || rolEtiqueta) && (
            <div className="hidden md:flex flex-col items-end text-right max-w-[min(20rem,42vw)]">
              {formattedFullName && (
                <p className="text-base font-semibold text-gray-900 leading-snug truncate w-full">
                  {formattedFullName}
                </p>
              )}
              {rolEtiqueta && (
                <span className="mt-0.5 inline-flex items-center rounded-md border border-gray-200/80 bg-linear-to-br from-gray-50 to-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                  {rolEtiqueta}
                </span>
              )}
            </div>
          )}

          {(formattedFullName || rolEtiqueta) && (
            <div className="flex md:hidden flex-col items-end text-right max-w-40 sm:max-w-56">
              {formattedShortName && (
                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                  {formattedShortName}
                </p>
              )}
              {rolEtiqueta && (
                <span className="mt-0.5 inline-flex max-w-full truncate rounded-md border border-gray-200/80 bg-gray-50/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  {rolEtiqueta}
                </span>
              )}
            </div>
          )}

          <motion.div className="relative shrink-0" ref={profileWrapRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-expanded={showProfile}
              aria-haspopup="true"
              className="flex items-center justify-center p-2 sm:p-2.5 brand-bg-gradient text-white rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-black/10"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User size={18} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-2 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button type="button" className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                    <User size={16} className="mr-2 shrink-0" />
                    Mi Perfil
                  </button>
                  <button type="button" className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                    <Settings size={16} className="mr-2 shrink-0" />
                    Configuración
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    onClick={() => {
                      setShowProfile(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} className="mr-2 shrink-0" />
                    Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      {empresa && <div className="h-0.5 w-full brand-bg" />}
    </motion.header>
  );
}

export const Header = memo(HeaderComponent);
