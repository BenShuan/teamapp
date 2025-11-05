import { DataTableColumnHeader } from '@/web/components/dataTable/columnHeader';
import { DataTable } from '@/web/components/dataTable/DataTable'
import { useFighters } from '@/web/hooks/useFighter';
import { ColumnDef } from '@tanstack/react-table'
import type { Fighter } from '@teamapp/api/schema'

function FighterTable() {

  const { data, isLoading, isError, error } = useFighters();

  if (isLoading) return <div>Loading fighters…</div>;
  if (isError) return <div>Failed to load: {(error as Error)?.message}</div>;

  const fightersColumns: ColumnDef<Fighter>[] = ([
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
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
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
    // {
    //   accessorKey: 'createdAt',
    //   id: 'Created',
    //   cell: ({ getValue }) => {
    //     const v = getValue<string | Date | null | undefined>();
    //     if (!v) return '-';
    //     const d = typeof v === 'string' ? new Date(v) : v;
    //     return dateFormatter.format(d);
    //   },
    // },

  ] as ColumnDef<Fighter>[])
  .map((col) => ({ ...col,
    header: ({ column }) => <DataTableColumnHeader column={column} title={column.id} />, 
    enableHiding: true, 
    enableSorting: true 
  })) as ColumnDef<Fighter>[]

  return (

    <DataTable columns={fightersColumns} data={(data ?? []) as Fighter[]}>

    </DataTable>
  )
}

export default FighterTable


