'use client';

import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente memoizado para filas de tabla
 * Evita re-renders innecesarios cuando los datos no cambian
 */
export const TableRow = React.memo(({ children, className = "" }: TableRowProps) => {
  return <tr className={className}>{children}</tr>;
});

TableRow.displayName = 'TableRow';
