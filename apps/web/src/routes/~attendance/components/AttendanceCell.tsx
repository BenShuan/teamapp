'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/web/components/ui/dropdown-menu';
import {
  ContextMenuTrigger,
} from '@/web/components/ui/context-menu';
import { Attendance, statusLocations } from '@teamapp/api/schema';
import { Button } from '@/web/components/ui/button';
import { cn } from '@/web/lib/utils';
import { useAttendanceTable } from './AttendanceTableContext';

interface AttendanceCellProps {
  attendance: Attendance | undefined;
  fighterName?: string;
}

export const attendnanceColorMap: Record<string, string> = {
  [statusLocations[0]]: 'bg-green-500',
  [statusLocations[1]]: 'bg-yellow-500',
  [statusLocations[2]]: 'bg-red-500',
  [statusLocations[3]]: 'bg-gray-500',
}

export const AttendanceCell: React.FC<AttendanceCellProps> = ({ attendance, fighterName = 'לוחם' }) => {
  const { pickedIds, togglePick, handleLocationChange, isPending, setContextPos, openAttendanceForm } = useAttendanceTable();

  const attendanceId = attendance?.id ?? "";
  const isPicked = attendanceId ? pickedIds.has(attendanceId) : false;


  // toggle pick on ctrl+click
  const onClick: React.MouseEventHandler = (e) => {
    if (!attendanceId) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      togglePick(attendanceId);
      return;
    }
    // otherwise let the dropdown open (no-op here)
  };

  const onDoubleClick: React.MouseEventHandler = () => {
    console.log('attendance', attendance)
    if (!attendance) return;
    openAttendanceForm(attendance, fighterName);
  };


  return (
    <DropdownMenu >

      <ContextMenuTrigger asChild onContextMenu={(event)=>setContextPos({x:event!.clientX,y:event!.clientY})}>
        <DropdownMenuTrigger asChild >

          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={cn(
              "h-8 text-xs w-full",
              attendnanceColorMap[attendance?.location ?? ""] || 'bg-gray-200',
              isPicked ? 'ring-2 ring-offset-1 ring-primary' : ''
            )}
            disabled={isPending }
          >

            {attendance?.location ?? "אין נתונים"}
          </Button>

        </DropdownMenuTrigger>
      </ContextMenuTrigger>
      <DropdownMenuContent align="end" className='bg-background w-full'>

        {statusLocations.map((location) => (
          <DropdownMenuItem
            key={location}
            onClick={() => handleLocationChange(attendanceId, location)}
            className={cn(attendnanceColorMap[location] || 'bg-gray-200', "my-1  justify-center")}
          >
            {location}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
