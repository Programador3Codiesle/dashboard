'use client';

import { Menu, LogOut, User, Settings } from "lucide-react";
import { EMPRESAS } from "@/utils/constants";
import React, { useState, memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderPageTitle } from "./HeaderPageTitle";

interface HeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  userName?: string;
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

function nombreCompacto(nombreFormateado: string): string {
  const w = nombreFormateado.trim().split(/\s+/).filter(Boolean);
  if (w.length <= 2) return nombreFormateado.trim();
  if (w.length === 3) return `${w[0]} ${w[1]}`;
  return `${w[0]} ${w[2]}`;
}

function HeaderComponent({ onToggleSidebar, onLogout, userName, nomPerfil, empresaId }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const empresa = empresaId != null ? EMPRESAS.find((e) => e.id === empresaId) : null;

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
    <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1760px] items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-6 xl:px-8 2xl:px-10">
        <div className="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            className="shrink-0 rounded-xl bg-gray-100 p-2 transition-colors hover:scale-105 hover:bg-gray-200 active:scale-95 lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0">
              <HeaderPageTitle />
              <p className="truncate text-[11px] text-gray-500 sm:text-xs md:text-sm">Bienvenido de vuelta</p>
            </div>
            {empresa && (
              <span
                className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:inline-flex sm:px-3 sm:text-xs"
                style={{ backgroundColor: empresa.color }}
              >
                {empresa.nombre}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {(formattedFullName || rolEtiqueta) && (
            <div className="hidden max-w-[min(20rem,42vw)] flex-col items-end text-right md:flex">
              {formattedFullName && (
                <p className="w-full truncate text-base font-semibold leading-snug text-gray-900">
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
            <div className="flex max-w-32 flex-col items-end text-right sm:max-w-56 md:hidden">
              {formattedShortName && (
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
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

          <div className="relative shrink-0" ref={profileWrapRef}>
            <button
              type="button"
              aria-expanded={showProfile}
              aria-haspopup="true"
              className="flex items-center justify-center rounded-xl brand-bg-gradient p-2 text-white shadow-md shadow-black/10 transition-opacity hover:scale-105 hover:opacity-90 active:scale-95 sm:p-2.5"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User size={18} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-gray-200/80 bg-white py-2 shadow-2xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button type="button" className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-50">
                    <User size={16} className="mr-2 shrink-0" />
                    Mi Perfil
                  </button>
                  <button type="button" className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-50">
                    <Settings size={16} className="mr-2 shrink-0" />
                    Configuración
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    type="button"
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
          </div>
        </div>
      </div>
      {empresa && <div className="h-0.5 w-full brand-bg" />}
    </header>
  );
}

export const Header = memo(HeaderComponent);
