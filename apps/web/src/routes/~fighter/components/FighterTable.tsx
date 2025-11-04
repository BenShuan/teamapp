import { DataTableColumnHeader } from '@/web/components/dataTable/columnHeader';
import { DataTable } from '@/web/components/dataTable/DataTable'
import { useFighters } from '@/web/hooks/useFighter';
import { ColumnDef } from '@tanstack/react-table'
import type { Fighter } from '@teamapp/api/schema'

function FighterTable() {

  const { data, isLoading, isError, error } = useFighters();

  if (isLoading) return <div>Loading fighters…</div>;
  if (isError) return <div>Failed to load: {(error as Error)?.message}</div>;

  const fightersColumns: ColumnDef<Fighter>[] = [
    {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='שם' />,
      accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
      cell: (ctx) => ctx.getValue<string>(),
      enableSorting:true,
      enableHiding:true
      
    },
    {
      accessorKey: 'idNumber',
      header: 'ת.ז',
    },
    {
      accessorKey: 'personalNumber',
      header: 'מספר אישי',
    },
    {
      accessorKey: 'teamId',
      header: 'צוות',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'ironNumber',
      header: 'מספר ברזל',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v ?? '-';
      },
    },
    {
      accessorKey: 'class',
      header: 'כיתה',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'professional',
      header: 'מקצוע',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'phoneNumber',
      header: 'פלאפון',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'shoesSize',
      header: 'מידת נעליים',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v ?? '-';
      },
    },
    {
      accessorKey: 'מידת חולצה',
      header: 'Shirt',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
    },
    {
      accessorKey: 'מידת מכנס',
      header: 'Pants',
      cell: ({ getValue }) => getValue<string | null>() ?? '-',
      enableSorting:true
    },
    // {
    //   accessorKey: 'createdAt',
    //   header: 'Created',
    //   cell: ({ getValue }) => {
    //     const v = getValue<string | Date | null | undefined>();
    //     if (!v) return '-';
    //     const d = typeof v === 'string' ? new Date(v) : v;
    //     return dateFormatter.format(d);
    //   },
    // },
  ]


  return (
    
    <DataTable columns={fightersColumns} data={(data ?? []) as Fighter[]}/>
  )
}

export default FighterTable 


