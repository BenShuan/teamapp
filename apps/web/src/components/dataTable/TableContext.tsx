import React, { createContext, useContext } from 'react';
import type { Table } from '@tanstack/react-table';

type TableContextType<TData> = {
  table: Table<TData>;
};

const TableContext = createContext<TableContextType<any> | null>(null);

export function TableProvider<TData>({
  table,
  children,
}: {
  table: Table<TData>;
  children: React.ReactNode;
}) {
  
  return <TableContext.Provider value={{ table }}>{children}</TableContext.Provider>;
}

/**
 * Hook to access the tanstack table instance from context.
 * Throws if used outside of a TableProvider.
 */
export function useTableContext<TData>() {
  const ctx = useContext(TableContext) as TableContextType<TData> | null;
  if (!ctx) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return ctx;
}