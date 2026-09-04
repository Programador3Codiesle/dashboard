'use client';

import { IUser } from "@/types/global";
import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVisibleSidebarRoutes } from "./sidebar-hub-access";
import { getSidebarSearchCatalog, searchSidebarCatalog } from "./sidebar-search";
import type { SidebarSearchHit } from "./sidebar-search";

interface SidebarNavProps {
  user: IUser | null;
  isCollapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  onExpand?: () => void;
}

function isRouteActive(currentPath: string, routePath: string) {
  if (currentPath === routePath) return true;
  if (routePath === "/dashboard") return currentPath === "/dashboard";
  return currentPath.startsWith(`${routePath}/`);
}

function isMacShortcut() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

function SidebarNavComponent({
  user,
  isCollapsed,
  isMobile,
  onClose,
  onExpand,
}: SidebarNavProps) {
  const currentPath = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef(false);

  const filteredRoutes = useMemo(() => getVisibleSidebarRoutes(user), [user]);
  const catalog = useMemo(() => getSidebarSearchCatalog(user), [user]);
  const results = useMemo(() => searchSidebarCatalog(catalog, query), [catalog, query]);
  const isSearching = query.trim().length > 0;

  const handleNavClick = useCallback(() => {
    setQuery("");
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isModK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isModK) return;
      event.preventDefault();
      if (isCollapsed && onExpand) {
        pendingFocusRef.current = true;
        onExpand();
        return;
      }
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCollapsed, onExpand]);

  useEffect(() => {
    if (isCollapsed || !pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    inputRef.current?.focus();
  }, [isCollapsed]);

  const shortcutLabel = isMacShortcut() ? "⌘K" : "Ctrl K";

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
      {isCollapsed && !isMobile ? (
        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              pendingFocusRef.current = true;
              onExpand?.();
            }}
            className="rounded-xl border border-gray-700/80 bg-gray-800/70 p-2.5 text-gray-400 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            title="Buscar módulos"
            aria-label="Buscar módulos"
          >
            <Search size={18} />
          </button>
        </div>
      ) : (
        <div className="mb-3 px-2">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setQuery("");
                  inputRef.current?.blur();
                  return;
                }
                if (event.key !== "Enter") return;
                const first = results[0];
                if (!first) return;
                event.preventDefault();
                if (first.external) {
                  window.open(first.ruta, "_blank", "noopener,noreferrer");
                } else {
                  router.push(first.ruta);
                }
                handleNavClick();
              }}
              placeholder="Buscar módulos..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-gray-700/80 bg-gray-800/70 py-2.5 pl-10 pr-16 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-[var(--color-primary)] focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/25"
            />
            {isSearching ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-gray-700 bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                {shortcutLabel}
              </kbd>
            )}
          </div>
        </div>
      )}

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isSearching && !isCollapsed ? (
          <SearchResults
            results={results}
            query={query}
            currentPath={currentPath}
            onNavigate={handleNavClick}
          />
        ) : (
          <>
            <p
              className={`mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-300 ${isCollapsed ? "h-0 p-0 opacity-0" : "h-auto p-4 opacity-100"}`}
            >
              Navegación Principal
            </p>

            <div className="space-y-2">
              {filteredRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  prefetch
                  onClick={handleNavClick}
                  onMouseEnter={() => setIsHovered(route.path)}
                  onMouseLeave={() => setIsHovered(null)}
                  className={`
                    relative flex w-full items-center rounded-xl border p-2 transition-all duration-300
                    ${isRouteActive(currentPath, route.path)
                      ? "brand-bg-active brand-border-active shadow-lg"
                      : "border-transparent hover:bg-gray-800/50"
                    }
                    ${isCollapsed ? "justify-center" : "justify-between px-4"}
                  `}
                >
                  <div className="flex min-w-0 items-center">
                    <div
                      className={`
                        mr-0 shrink-0 rounded-lg p-2 transition-colors
                        ${isCollapsed ? "mr-0" : "mr-3"}
                        ${isRouteActive(currentPath, route.path)
                          ? "brand-bg text-white"
                          : "bg-gray-800 brand-text"
                        }
                      `}
                    >
                      <route.icon size={18} />
                    </div>
                    <span
                      className={`truncate overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
                    >
                      {route.name}
                    </span>
                  </div>

                  {!isCollapsed && (
                    <div
                      className={`transition-all duration-200 ${
                        isHovered === route.path || isRouteActive(currentPath, route.path)
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0"
                      }`}
                    >
                      <ChevronRight size={16} className="brand-text" />
                    </div>
                  )}

                  {isRouteActive(currentPath, route.path) && (
                    <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full brand-bg" />
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function SearchResults({
  results,
  query,
  currentPath,
  onNavigate,
}: {
  results: SidebarSearchHit[];
  query: string;
  currentPath: string;
  onNavigate: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800/80 text-gray-500">
          <Search size={20} />
        </div>
        <p className="text-sm font-medium text-gray-300">Sin coincidencias</p>
        <p className="mt-1 text-xs text-gray-500">
          No hay módulos para “{query.trim()}”
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 px-1">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {results.length} {results.length === 1 ? "resultado" : "resultados"}
      </p>
      {results.map((hit) => {
        const Icon = hit.icono;
        const active = currentPath === hit.ruta;
        const className = `
          group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all
          ${active
            ? "brand-bg-active brand-border-active shadow-lg"
            : "border-transparent hover:bg-gray-800/70"
          }
        `;

        const body = (
          <>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                active ? "brand-bg text-white" : "bg-gray-800 brand-text"
              }`}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              {hit.crumbs.length > 0 && (
                <p className="truncate text-[11px] text-gray-500">
                  {hit.crumbs.join(" › ")}
                </p>
              )}
              <p className="truncate text-sm font-medium text-white">{hit.nombre}</p>
            </div>
            <ChevronRight
              size={14}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 brand-text"
            />
          </>
        );

        if (hit.external) {
          return (
            <a
              key={hit.id}
              href={hit.ruta}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={className}
            >
              {body}
            </a>
          );
        }

        return (
          <Link
            key={hit.id}
            href={hit.ruta}
            prefetch
            onClick={onNavigate}
            className={className}
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}

export const SidebarNav = memo(SidebarNavComponent);
