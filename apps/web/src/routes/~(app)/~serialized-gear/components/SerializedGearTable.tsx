import { DataTableColumnHeader } from "@/web/components/dataTable/columnHeader";
import { DataTableViewOptions } from "@/web/components/dataTable/columnToggle";
import { DataTable, DataTableSearch } from "@/web/components/dataTable/DataTable";
import { useSerializedGear, useGearCatalog, useDeleteSerializedGear } from "@/web/hooks/useSerializedGear";
import { useFighters } from "@/web/hooks/useFighter";
import { useTeams } from "@/web/hooks/useTeams";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import type { SerializedGearFighter } from "@teamapp/api/schema";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/web/components/ui/button";

const initHiddenCols = ["תאריך הנפקה", "קטגוריה"];

function SerializedGearTable() {
  const { data, isLoading, isError, error } = useSerializedGear();
  const { catalogMap } = useGearCatalog();
  const { fightersMap } = useFighters();
  const { teamsMap } = useTeams();



  const serializedGearColumns: ColumnDef<SerializedGearFighter>[] = [
    {
      accessorKey: "serializedGearId",
      id: "סוג ציוד",
      cell: ({ getValue }: { getValue: () => any }) => {
        const gearId = getValue();
        const gear = catalogMap[gearId]?.label;
        return gear ? gear : "-";
      },
    },
    {
      accessorKey: "serializedGearId",
      id: "קטגוריה",
      cell: ({ getValue }: { getValue: () => any }) => {
        const gearId = getValue();
        const gear = catalogMap[gearId]?.value;
        return gear ? gear.type : "-";
      },
    },
    {
      accessorKey: "fighterId",
      id: "לוחם",
      cell: ({ getValue }: { getValue: () => any }) => {
        const fighterId = getValue();
        const fighter = fightersMap[fighterId]?.label;
        return fighter ? fighter : "-";
      },
    },
    {
      accessorKey: "fighterId",
      id: "צוות",
      cell: ({ getValue }: { getValue: () => any }) => {
        const fighterId = getValue();
        const fighter = fightersMap[fighterId]?.value;
        const teamId = fighter?.teamId;
        return teamId ? teamsMap?.[teamId]?.label ?? "-" : "-";
      },
    },
    {
      accessorKey: "serialNumber",
      id: "מספר סידורי",
      cell: ({ getValue }: { getValue: () => any }) => getValue() ?? "-",
    },
    {
      accessorKey: "location",
      id: "מיקום",
      cell: ({ getValue }: { getValue: () => any }) => getValue() ?? "-",
    },
    {
      accessorKey: "issuedDate",
      id: "תאריך הנפקה",
      cell: ({ getValue }: { getValue: () => any }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString("he-IL") : "-";
      },
    },
    {
      accessorKey: "lastCheckDate",
      id: "בדיקה אחרונה",
      cell: ({ getValue }: { getValue: () => any }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString("he-IL") : "-";
      },
    },
    {
      id: "פעולות",
      cell: ({ row }: { row: any }) => {
        const { mutate } = useDeleteSerializedGear(row.original.id);
        return (
          <div className="flex items-center gap-2">
            <Link to={`/serialized-gear/${row.original.id}`}>
              <Edit2 />
            </Link>
            <Button variant={"ghost"} onClick={() => mutate(row.original.id)}>

              <Trash2 className=" text-red-600" />
            </Button>
          </div>
        )
      },
    },
  ].map((col) => ({
    ...col,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={column.id} />
    ),
    enableHiding: true,
    enableSorting: true,
  })) as ColumnDef<SerializedGearFighter>[];

  if (isLoading) return <div>Loading serialized gear…</div>;
  if (isError)
    return <div>Failed to load: {(error as Error)?.message}</div>;

  const columnVisibility = serializedGearColumns.reduce(
    (acc, col) => {
      if (initHiddenCols.includes(col.id as string)) {
        acc[col.id as string] = false;
      } else {
        acc[col.id as string] = true;
      }
      return acc;
    },
    {} as Record<string, boolean>
  );

  return (
    <DataTable
      columns={serializedGearColumns}
      data={(data ?? []) as SerializedGearFighter[]}
      initialState={{ columnVisibility }}
    >
      <DataTableViewOptions />
      <DataTableSearch />
    </DataTable>
  );
}

export default SerializedGearTable;
