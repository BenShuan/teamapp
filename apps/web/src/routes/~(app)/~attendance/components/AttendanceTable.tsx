'use client';

import React, { useMemo, useState } from 'react';
import { useAttendance, useCreateAttendance } from '@/web/hooks/useAttendance';
import { AttendanceCell } from './AttendanceCell';
import { AttendanceTableProvider } from './AttendanceTableContext';
import { SelectionIndicator } from './SelectionIndicator';
import { DataTable, DataTableSearch } from '@/web/components/dataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Attendance, Fighter, FightersAttendance, NewAttendance, statusLocations } from '@teamapp/api/schema';
import { dateRangeBuilder, formatDateHeader } from '@teamapp/shared';
import { Button } from '@/web/components/ui/button';
import { cn } from '@/web/lib/utils';
import { Input } from '@/web/components/ui/input';
import { useFighters } from '@/web/hooks/useFighter';

interface AttendanceTableProps {
  startDate: string;
  endDate: string;
}




export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  startDate,
  endDate,
}) => {
  const { mutate, isPending } = useCreateAttendance()
  const { data: fighterArray } = useFighters()
  
  const [datesRangeToCreate, setdatesRangeToCreate] = useState<string[]>([])
  // Generate array of dates between startDate and endDate
  const dateRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return dateRangeBuilder(start, end);
    
  }, [startDate, endDate]);
  const { data: attendanceRecords = [], isLoading, error } = useAttendance(new Date(startDate),new Date(endDate));
  const attendanceColumns: ColumnDef<any>[] = useMemo(() => {
    const columns = ([
      {
        id: 'שם',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
        cell: (ctx) => ctx.getValue<string>(),

      },
      {
        accessorKey: 'personalNumber',
        id: 'מספר אישי',
        header: 'מספר אישי',
        enableSorting: true

      }
    ] as ColumnDef<FightersAttendance>[])

    for (const day of dateRange) {
      columns.push({
        id: day,
        accessorFn: (row) => row.attendances.find((a: Attendance) => a.workDate === day),
        header() {
          const { dayName, day: monthDay, month } = formatDateHeader(day);
          return (
            <div
              key={day}
              className="text-center min-w-24 whitespace-nowrap flex items-center align-middle justify-between"
            >
              <div className="text-xs font-semibold">
                {dayName}
              </div>
              <div className="text-xs">
                {monthDay}/{month}
              </div>
              <div >

                <Input type='checkbox' onChange={() => setdatesRangeToCreate((prev) => {
                  if (prev.find(d => d === day)) {
                    return prev.filter(d => d !== day);
                  } else {
                    return [...prev, day];
                  }
                })} />
              </div>

            </div>
          );
        },
        cell: (ctx) => {
          const att = ctx.getValue<Attendance | undefined>();
          const row = ctx.row.original as Partial<Fighter>;
          const fighterName = `${row.firstName} ${row.lastName}`.trim();
          return <AttendanceCell attendance={att} fighterName={fighterName} />;
        },
      })
    }
    return columns;
  }, [dateRange])

  if (isLoading || isPending) {
    return <div className="p-4">טוען...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">שגיאה בטעינת הנתונים</div>;
  }

  const createAttendenceForFighterByDates = async (dates: string[], fighterArray: Fighter[]) => {

    const creates: NewAttendance[] = [];
    const defaultLocation = (statusLocations && statusLocations.length > 0) ? statusLocations[0] : 'נוכח';
    fighterArray.forEach((f: any) => {
      dates.forEach((d) => {
        // create attendance with default location (undefined)
        creates.push({
          fighterId: f.id,
          workDate: d,
          location: defaultLocation as any,
        });
      });
    });

    mutate(creates);

    setdatesRangeToCreate([]);
  }

  const allAttendanceRecords:Attendance[] = (attendanceRecords as any[]?? []).flatMap((r: any) => r.attendances).filter((a: Attendance) => dateRange.includes(a.workDate));  

  return (
    <AttendanceTableProvider>
      <div className="w-full overflow-x-auto" dir="rtl">
        <DataTable columns={attendanceColumns} data={(attendanceRecords ?? []) as []} initialState={{}}>
          <DataTableSearch />
          <SelectionIndicator allItems={allAttendanceRecords } />
          <div className={cn("flex items-center gap-3 ", datesRangeToCreate.length === 0 && 'hidden')}>

            <Button onClick={() => createAttendenceForFighterByDates(datesRangeToCreate, (fighterArray ?? []) as Fighter[])}>צור נוכחות בתאריכים אלו</Button>
          </div>  
        </DataTable>

      </div>
    </AttendanceTableProvider>
  );
};
