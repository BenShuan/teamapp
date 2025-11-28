import { DataTableColumnHeader } from '@/web/components/dataTable/columnHeader';
import { DataTableViewOptions } from '@/web/components/dataTable/columnToggle';
import { DataTable, DataTableSearch } from '@/web/components/dataTable/DataTable'
import { useFighters } from '@/web/hooks/useFighter';
import { useTeams } from '@/web/hooks/useTeams';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table'
import type { Fighter } from '@teamapp/api/schema'
import { Edit2 } from 'lucide-react';
import { useMemo } from 'react';


const initHiddenCols = ['מידת מכנס', 'מידת חולצה', 'מידת נעליים', 'מקצוע', 'כיתה']

function FighterTable() {

  const { data, isLoading, isError, error } = useFighters();
  const { teamsMap } = useTeams()
  const fightersColumns: ColumnDef<Fighter>[] = useMemo(()=>([
    {
      id: 'שם',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
      cell: (ctx) => ctx.getValue<string>(),

    },
    {
      accessorKey: 'idNumber',
      id: 'ת.ז',
    },
    {
      accessorKey: 'personalNumber',
      id: 'מספר אישי',
    },
    {
      accessorKey: 'teamId',
      id: 'צוות',
      cell: ({ getValue }) => teamsMap?.[getValue<string | null>() ?? '']?.name ?? '-',

    },
    {
      accessorKey: 'ironNumber',
      id: 'מספר ברזל',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v ?? '-';
      },
    },
    {
      accessorKey: 'class',
      id: 'כיתה',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'professional',
      id: 'מקצוע',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'phoneNumber',
      id: 'פלאפון',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'email',
      id: 'Email',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'shoesSize',
      id: 'מידת נעליים',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v ?? '-';
      },
    },
    {
      accessorKey: 'מידת חולצה',
      id: 'מידת חולצה',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',

    },
    {
      accessorKey: 'מידת מכנס',
      id: 'מידת מכנס',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      id: "פעולות",
      cell: ({ row }) => <><Link to={`/fighter/${row.original.id}`}><Edit2></Edit2></Link></>
    }

  ] as ColumnDef<Fighter>[])
    .map((col) => ({
      ...col,
      header: ({ column }) => <DataTableColumnHeader column={column} title={column.id} />,
      enableHiding: true,
      enableSorting: true
    })) as ColumnDef<Fighter>[], [data])

  if (isLoading) return <div>Loading fighters…</div>;
  if (isError) return <div>Failed to load: {(error as Error)?.message}</div>;

  const columnVisibility = fightersColumns.reduce((acc, col) => {
    if (initHiddenCols.includes(col.id as string)) {
      acc[col.id as string] = false;
    } else {
      acc[col.id as string] = true;
    }
    return acc;
  }, {} as Record<string, boolean>);
  return (

    <DataTable columns={fightersColumns} data={(data ?? []) as Fighter[]} initialState={{ columnVisibility }}>
      <DataTableViewOptions />
      <DataTableSearch />
    </DataTable>
  )
}

export default FighterTable


