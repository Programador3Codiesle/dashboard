'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export type JefeAutorizaOption = { nit: number; nombre: string };

type JefeAutorizaComboboxProps = {
  id?: string;
  name?: string;
  jefes: JefeAutorizaOption[];
  value: number | null;
  onChange: (nit: number | null) => void;
  required?: boolean;
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const INPUT_CLASS =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-16 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors';

export function JefeAutorizaCombobox({
  id,
  name = 'jefe',
  jefes,
  value,
  onChange,
  required = false,
}: JefeAutorizaComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const seleccionado = useMemo(
    () => jefes.find((jefe) => jefe.nit === value) ?? null,
    [jefes, value],
  );

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return jefes;
    return jefes.filter(
      (jefe) =>
        normalizar(jefe.nombre).includes(q) || String(jefe.nit).includes(q),
    );
  }, [jefes, query]);

  const textoMostrado = abierto || !seleccionado ? query : seleccionado.nombre;

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const seleccionar = (option: JefeAutorizaOption | null) => {
    if (!option) {
      onChange(null);
      setQuery('');
      setAbierto(false);
      return;
    }
    onChange(option.nit);
    setQuery(option.nombre);
    setAbierto(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={textoMostrado}
        autoComplete="off"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={listId}
        aria-autocomplete="list"
        data-testid="adm-os-jefe"
        placeholder="Buscar por nombre..."
        className={INPUT_CLASS}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={() => {
          setQuery(seleccionado?.nombre ?? query);
          setAbierto(true);
        }}
        onKeyDown={(e) => {
          const maxActivo = Math.max(filtrados.length - 1, 0);
          if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setAbierto(true);
            return;
          }
          if (e.key === 'Escape') {
            setAbierto(false);
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActivo((i) => Math.min(i + 1, maxActivo));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActivo((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === 'Enter' && abierto) {
            e.preventDefault();
            const elegido = filtrados[activo];
            if (elegido) seleccionar(elegido);
          }
        }}
      />
      {value || query ? (
        <button
          type="button"
          aria-label="Quitar jefe"
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
      <input
        className="sr-only"
        tabIndex={-1}
        name={name}
        value={value ?? ''}
        required={required}
        onChange={() => undefined}
      />
      {abierto ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtrados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">
              Sin coincidencias
            </li>
          ) : (
            filtrados.map((jefe, index) => (
              <li
                key={jefe.nit}
                role="option"
                aria-selected={jefe.nit === value}
              >
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index === activo
                      ? 'brand-bg text-white'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setActivo(index)}
                  onClick={() => seleccionar(jefe)}
                >
                  {jefe.nombre}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
