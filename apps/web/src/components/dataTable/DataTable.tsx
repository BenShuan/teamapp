
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  InitialTableState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table"
import { PropsWithChildren, useState } from "react"
import { TableProvider, useTableContext } from "./TableContext"
import { useEffect } from "react"
type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  initialState: InitialTableState,
} & PropsWithChildren

export function DataTable<TData, TValue>({
  columns,
  data,
  children,
  initialState
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting ?? [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters ?? []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialState.columnVisibility ?? {})
  const [rowSelection, setRowSelection] = useState(initialState.rowSelection ?? {})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: "includesString"
  })
  return (
    <TableProvider table={table} >
      <div className="flex flex-row overflow-auto my-2 gap-4  ">
        {children}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  אין תוצאות.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TableProvider>

  )
}

type DataTableSearchProps = {
  placeholder?: string
  debounceMs?: number
}

export function DataTableSearch({
  placeholder = "חפש...",
  debounceMs = 200,
}: DataTableSearchProps) {

  const {table} = useTableContext()
  const initial = table?.getState?.().globalFilter ?? ""
  const [value, setValue] = useState(initial)

  // keep local input in sync if external code changes global filter
  useEffect(() => {
    const external = table?.getState?.().globalFilter ?? ""
    if (external !== value) setValue(external)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table?.getState?.().globalFilter])

  // debounce updating the table global filter
  useEffect(() => {
    const t = setTimeout(() => {
      table?.setGlobalFilter?.(value ?? undefined)
    }, debounceMs)
    return () => clearTimeout(t)
  }, [table, value, debounceMs])

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search table"
        className="rounded border px-3 py-1 text-sm focus:outline-none"
      />
      {value ? (
        <button
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="text-sm text-gray-500 hover:text-gray-700"
          type="button"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}
