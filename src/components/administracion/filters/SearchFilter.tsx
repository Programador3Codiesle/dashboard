'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { SearchInput } from '@/components/shared/ui/SearchInput';

interface SearchFilterProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de filtro de búsqueda optimizado
 * El estado del input está aislado en este componente
 */
export const SearchFilter = React.memo(({
  onSearch,
  placeholder = "Buscar...",
  className = ""
}: SearchFilterProps) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch(value);
  }, [onSearch]);

  return (
    <div className={className}>
      <SearchInput
        placeholder={placeholder}
        onSearch={handleSearch}
        debounceMs={500}
      />
    </div>
  );
});

SearchFilter.displayName = 'SearchFilter';
