"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export type EmpleadoComboOption = { nit: string; nombres: string };

const MAX_VISIBLE = 80;
const INPUT_CLASS =
  "w-full border border-gray-300 rounded-xl px-3 py-2 pr-16 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type EmpleadoSearchComboboxProps = {
  id?: string;
  empleados: EmpleadoComboOption[];
  value: string;
  onChange: (nit: string) => void;
  cargando?: boolean;
  placeholder?: string;
};

export function EmpleadoSearchCombobox({
  id,
  empleados,
  value,
  onChange,
  cargando = false,
  placeholder = "Buscar por nombre...",
}: EmpleadoSearchComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const seleccionado = useMemo(
    () => empleados.find((empleado) => empleado.nit === value) ?? null,
    [empleados, value],
  );

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return empleados;
    return empleados.filter(
      (empleado) =>
        normalizar(empleado.nombres).includes(q) ||
        normalizar(empleado.nit).includes(q),
    );
  }, [empleados, query]);

  const visibles = filtrados.slice(0, MAX_VISIBLE);
  const textoMostrado = abierto || !seleccionado ? query : seleccionado.nombres;

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const seleccionar = (option: EmpleadoComboOption | null) => {
    if (!option) {
      onChange("");
      setQuery("");
      setAbierto(false);
      return;
    }
    onChange(option.nit);
    setQuery(option.nombres);
    setAbierto(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={textoMostrado}
        disabled={cargando}
        autoComplete="off"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={cargando ? "Cargando empleados..." : placeholder}
        className={INPUT_CLASS}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange("");
          setAbierto(true);
          setActivo(e.target.value.trim() ? 1 : 0);
        }}
        onFocus={() => {
          setQuery(seleccionado?.nombres ?? query);
          setAbierto(true);
        }}
        onKeyDown={(e) => {
          const maxActivo = visibles.length;
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
            setActivo((i) => Math.min(i + 1, maxActivo));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActivo((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter" && abierto) {
            e.preventDefault();
            if (activo === 0) {
              seleccionar(null);
              return;
            }
            const elegido = visibles[activo - 1];
            if (elegido) seleccionar(elegido);
          }
        }}
      />
      {value || query ? (
        <button
          type="button"
          aria-label="Quitar empleado"
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:text-gray-700"
          onClick={() => seleccionar(null)}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={18}
        aria-hidden="true"
      />
      {abierto && !cargando ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <li role="option" aria-selected={!value}>
            <button
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm ${
                activo === 0
                  ? "brand-bg text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onMouseEnter={() => setActivo(0)}
              onClick={() => seleccionar(null)}
            >
              Todos los empleados
            </button>
          </li>
          {visibles.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">
              Sin coincidencias
            </li>
          ) : (
            visibles.map((empleado, index) => (
              <li
                key={empleado.nit}
                role="option"
                aria-selected={empleado.nit === value}
              >
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index + 1 === activo
                      ? "brand-bg text-white"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setActivo(index + 1)}
                  onClick={() => seleccionar(empleado)}
                >
                  {empleado.nombres}
                </button>
              </li>
            ))
          )}
          {filtrados.length > MAX_VISIBLE ? (
            <li className="px-3 py-2 text-xs text-gray-500">
              Mostrando {MAX_VISIBLE} de {filtrados.length}. Escriba para
              acotar.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
