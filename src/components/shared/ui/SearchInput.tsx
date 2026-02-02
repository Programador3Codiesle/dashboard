'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

/**
 * Componente de búsqueda optimizado que usa useRef para evitar re-renders
 * Solo actualiza el estado cuando el usuario deja de escribir (debounce)
 */
export const SearchInput = React.memo(({
  placeholder = "Buscar...",
  onSearch,
  debounceMs = 500,
  className = ""
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const value = inputRef.current?.value || '';
      onSearch(value);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props importantes
  return (
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.debounceMs === nextProps.debounceMs &&
    prevProps.onSearch === nextProps.onSearch
  );
});

SearchInput.displayName = 'SearchInput';
