"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Settings2 } from "lucide-react"

import { Button } from "@/web/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/web/components/ui/dropdown-menu"
import { useTableContext } from "./TableContext"
import { useCallback, useState } from "react"

export function DataTableViewOptions<TData>() {

  const { table } = useTableContext<TData>()

  const [selectAll, setSelectAll] = useState(false)

  const handleSelecctAll = useCallback((value: boolean) => { table.toggleAllColumnsVisible(!!value); setSelectAll(!!value) }
    ,
    [selectAll],
  )


  return (  
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 md:flex"
        >
          <Settings2 />
          עמודות
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px] bg-background">
        <DropdownMenuLabel className="text-right">בחר עמודות</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          key={"all"}
          className="capitalize flex-row-reverse "
          checked={selectAll}
          onCheckedChange={handleSelecctAll}
        >
          בחר הכל
        </DropdownMenuCheckboxItem>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize flex-row-reverse "
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
