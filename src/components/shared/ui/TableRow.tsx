'use client';

import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente memoizado para filas de tabla
 * Evita re-renders innecesarios cuando los datos no cambian
 */
export const TableRow = React.memo(({ children, className = "", style }: TableRowProps) => {
  return <tr className={className} style={style}>{children}</tr>;
});

TableRow.displayName = 'TableRow';
