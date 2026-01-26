import { useState, useEffect } from 'react';

/**
 * Hook que devuelve un valor con debounce.
 * Útil para inputs de búsqueda donde no queremos filtrar en cada keystroke.
 * 
 * @param value - El valor a debouncear
 * @param delay - El tiempo de espera en milisegundos (default: 300ms)
 * @returns El valor debounceado
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
