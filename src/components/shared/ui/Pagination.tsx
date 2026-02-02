'use client';

import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onChange: (page: number) => void;
}

/**
 * Componente de paginación memoizado
 * Evita re-renders innecesarios cuando las props no cambian
 */
export const Pagination = React.memo(({ currentPage, totalPages, onChange }: PaginationProps) => {
  const handlePrev = useCallback(() => {
    onChange(currentPage - 1);
  }, [currentPage, onChange]);

  const handleNext = useCallback(() => {
    onChange(currentPage + 1);
  }, [currentPage, onChange]);
    return (
        <div className="flex justify-center items-center gap-4 bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-xl shadow-md border border-gray-200">
            {/* Botón Anterior */}
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                    transition-all duration-200 ease-in-out
                    ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }
                `}
            >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Indicador de página */}
            <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-lg border border-gray-300 shadow-sm">
                <span className="text-sm font-medium text-gray-600">Página</span>
                <span className="flex items-center justify-center min-w-[32px] h-8 px-3 brand-bg-gradient text-white font-bold rounded-md shadow-md">
                    {currentPage}
                </span>
                <span className="text-sm font-medium text-gray-600">de</span>
                <span className="flex items-center justify-center min-w-[32px] h-8 px-3 bg-gray-100 text-gray-700 font-semibold rounded-md border border-gray-300">
                    {totalPages}
                </span>
            </div>

            {/* Botón Siguiente */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                    transition-all duration-200 ease-in-out
                    ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }
                `}
            >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight size={18} />
            </button>
        </div>
    );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props relevantes
  return (
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.onChange === nextProps.onChange
  );
});

Pagination.displayName = 'Pagination';
