'use client';

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, } from '@/web/components/ui/context-menu';
import { statusLocations, Attendance } from '@teamapp/api/schema';
import React, { createContext, useContext, useState } from 'react';
import { attendnanceColorMap } from './AttendanceCell';
import { cn } from '@/web/lib/utils';
import { useUpdateAttendance } from '@/web/hooks/useAttendance';
import { ChevronRight } from 'lucide-react';
import { AttendancePopover } from './AttendancePopover';

interface AttendanceTableContextType {
  pickedIds: Set<string>;
  togglePick: (id: string) => void;
  clearPicks: () => void;
  handleLocationChange: (attendanceId: string, newLocation: string) => void;
  isPending: boolean;
  setContextPos: (pos: { x: number, y: number }) => void;
  openAttendanceForm: (attendance: Attendance, fighterName: string) => void;
}

const AttendanceTableContext = createContext<AttendanceTableContextType | undefined>(undefined);

export const AttendanceTableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mutate: updateAttendance, isPending } = useUpdateAttendance();
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 })
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedFighterName, setSelectedFighterName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());

  const togglePick = (id: string) => {
    setPickedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const clearPicks = () => {
    setPickedIds(new Set());
  };

  const openAttendanceForm = (attendance: Attendance, fighterName: string) => {
    setSelectedAttendance(attendance);
    setSelectedFighterName(fighterName);
    setIsPopoverOpen(true);
  };

  const handleLocationChange = (attendanceId: string | null, newLocation: string) => {
    // if there are multiple picked ids, apply to all picked; otherwise single

    if (attendanceId) {
      return updateAttendance({
        id: attendanceId,
        attendance: {
          location: newLocation as (typeof statusLocations)[number],
        },
      });
    }

    const targets = (pickedIds.size > 0)
      ? Array.from(pickedIds)
      : [];

    if (targets.length === 0) return;

    for (const id of targets) {
      updateAttendance({
        id,
        attendance: {
          location: newLocation as (typeof statusLocations)[number],
        },
      });
    }
  };

  return (
    <AttendanceTableContext.Provider value={{ pickedIds, setContextPos, togglePick, clearPicks, handleLocationChange, isPending, openAttendanceForm }}>
      <ContextMenu  >
        {children}
        <ContextMenuContent style={{
          top: contextPos.y,
          left: contextPos.x
        }} className={cn('fixed  ')}  >
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>בחר מיקום <ChevronRight /></ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-44">
              {statusLocations.map((location) => (
                <ContextMenuItem
                  key={location}
                  onClick={() => handleLocationChange(null, location)}
                  className={cn(attendnanceColorMap[location] || 'bg-gray-200', "my-1  justify-center")}
                >
                  {location}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

        </ContextMenuContent>
      </ContextMenu>

      {/* Attendance Form Popover */}
      {selectedAttendance && (
        <AttendancePopover
          attendance={selectedAttendance}
          fighterName={selectedFighterName}
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        />
      )}
    </AttendanceTableContext.Provider>
  );
};

export const useAttendanceTable = () => {
  const ctx = useContext(AttendanceTableContext);
  if (!ctx) {
    throw new Error('useAttendanceTable must be used within AttendanceTableProvider');
  }
  return ctx;
};
