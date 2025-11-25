'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/web/components/ui/dropdown-menu';
import { Attendance, statusLocations } from '@teamapp/api/schema';
import { useUpdateAttendance } from '@/web/hooks/useAttendance';
import { Button } from '@/web/components/ui/button';
import { cn } from '@/web/lib/utils';

interface AttendanceCellProps {
  attendance: Attendance | undefined;
}

const attendnanceColorMap: Record<string, string> = {
  [statusLocations[0]]: 'bg-green-500',
  [statusLocations[1]]: 'bg-yellow-500',
  [statusLocations[2]]: 'bg-red-500',
  [statusLocations[3]]: 'bg-gray-500',
}

export const AttendanceCell: React.FC<AttendanceCellProps> = ({
 attendance
}) => {
  const { mutate: updateAttendance, isPending } = useUpdateAttendance();

  const handleLocationChange = (newLocation: string) => {
    updateAttendance({
      id: attendance!.id,
      attendance: {
        location: newLocation as (typeof statusLocations)[number],
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-8 text-xs w-full  ", attendnanceColorMap[attendance?.location ?? ""] || 'bg-gray-200')}
              disabled={isPending}
            >

              {attendance?.location ?? "אין נתונים"}
            </Button>
        
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='bg-background w-full'>

        {statusLocations.map((location) => (
          <DropdownMenuItem
            key={location}
            onClick={() => handleLocationChange(location)}
            className={cn(attendnanceColorMap[location] || 'bg-gray-200', "my-1  justify-center")}
          >
            {location}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
