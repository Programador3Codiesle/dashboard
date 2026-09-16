"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type GerenteComboOption = { nit: string; nombres: string };

type GerenteAutorizaComboboxProps = {
  name: string;
  usuarios: GerenteComboOption[];
  cargando?: boolean;
  required?: boolean;
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function GerenteAutorizaCombobox({
  name,
  usuarios,
  cargando = false,
  required = false,
}: GerenteAutorizaComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [nit, setNit] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return usuarios;
    return usuarios.filter((u) => normalizar(u.nombres).includes(q));
  }, [usuarios, query]);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const seleccionar = (option: GerenteComboOption) => {
    setNit(option.nit);
    setQuery(option.nombres);
    setAbierto(false);
  };

  return (
    <div ref={rootRef} className="relative mt-1">
      <input
        type="text"
        value={query}
        disabled={cargando}
        autoComplete="off"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-required={required}
        placeholder={cargando ? "Cargando usuarios..." : "Buscar por nombre..."}
        className="block w-full min-h-10 sm:min-h-11 border border-gray-300 rounded-xl px-3 py-2 sm:py-2.5 pr-10 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none text-sm sm:text-base bg-white"
        onChange={(e) => {
          setQuery(e.target.value);
          setNit("");
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={(e) => {
          if (!abierto && (e.key === "ArrowDown" || e.key === "Enter")) {
            setAbierto(true);
            return;
          }
          if (e.key === "Escape") {
            setAbierto(false);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActivo((i) => Math.min(i + 1, Math.max(filtrados.length - 1, 0)));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActivo((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter" && abierto) {
            e.preventDefault();
            const elegido = filtrados[activo];
            if (elegido) seleccionar(elegido);
          }
        }}
      />
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={18}
      />
      <input
        className="sr-only"
        tabIndex={-1}
        name={name}
        value={nit}
        required={required}
        onChange={() => undefined}
      />
      {abierto && !cargando ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtrados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Sin coincidencias</li>
          ) : (
            filtrados.map((u, index) => (
              <li key={u.nit} role="option" aria-selected={u.nit === nit}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index === activo
                      ? "brand-bg text-white"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setActivo(index)}
                  onClick={() => seleccionar(u)}
                >
                  {u.nombres}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
