'use client';

import React, { useState, useMemo } from 'react';
import { useAttendance } from '@/web/hooks/useAttendance';
import { useFighters } from '@/web/hooks/useFighter';
import { Button } from '@/web/components/ui/button';
import { cn } from '@/web/lib/utils';
import { attendnanceColorMap } from './AttendanceCell';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DragDropManager, DraggableItem, DragItem, DroppableContainer, DroppableContainerConfig } from '@/web/lib/drag-drop/DragDropManager';
import { useAttendanceDragDrop, AttendanceDragItem } from '@/web/lib/drag-drop/useAttendanceDragDrop';
import { AttendancePopover } from './AttendancePopover';
import { formatDateHeader, getDatesByRange } from '@teamapp/shared';

interface MobileAttendanceViewProps {
  startDate: string;
  endDate: string;
}

/**
 * Draggable fighter item component
 */
const FighterCard: React.FC<{
  item: AttendanceDragItem;
  location: string;
  onOpenAttendanceForm?: (attendance: any, fighterName: string) => void;
}> = ({ item, location, onOpenAttendanceForm }) => {

  const timeDay = item.attendance?.checkIn? new Date(item.attendance.checkIn).getHours() + ':' + new Date(item.attendance.checkIn).getMinutes() : '';

  const handleDoubleClick = () => {
    if (item.attendance && onOpenAttendanceForm) {
      onOpenAttendanceForm(item.attendance, item.fighterName);
    }
  };

  return (
    <DraggableItem item={item} id={item.id}>
      <div
        className={cn(
          'cursor-move rounded-md bg-white p-3 text-xs font-medium shadow-sm transition-all select-none',
          'touch-manipulation active:scale-105',
          'hover:shadow-md active:opacity-75',
          attendnanceColorMap[location] + ' bg-opacity-20'
        )}
        onDoubleClick={handleDoubleClick}
        
      >
        <div className="font-semibold">{`${item.fighterName} ${timeDay}` } </div>
        <div className="text-xs text-muted-foreground">{item.personalNumber}</div>
      </div>
    </DraggableItem>
  );
};

/**
 * Droppable location container with drop zone detection
 */
const LocationContainer: React.FC<{
  location: string;
  children: React.ReactNode;
  isEmpty: boolean;
}> = ({ location, children, isEmpty }) => {

  const colorBg = attendnanceColorMap[location] || 'bg-gray-500';

  return (
    <DroppableContainer id={location} label={location} colorClass={colorBg}>

      {isEmpty ? (
        <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
          אין לוחמים כאן
        </div>
      ) : (
        children
      )}
    </DroppableContainer >
  );
};

export const MobileAttendanceView: React.FC<MobileAttendanceViewProps> = ({

}) => {
  const { data: fighterArray = [] } = useFighters();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [selectedFighterName, setSelectedFighterName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: attendanceRecords = [], isLoading } = useAttendance(new Date(selectedDate),new Date(selectedDate));

  const { buildContainers } = useAttendanceDragDrop(
    Array.isArray(attendanceRecords) ? attendanceRecords.flatMap((record: any) => record.attendances) : [],
    Array.isArray(fighterArray) ? fighterArray : [],
    selectedDate
  );


  // Build containers for drag and drop
  const containers = useMemo(() => buildContainers(), [buildContainers]);

  const { dayName, day, month } = formatDateHeader(selectedDate);

  const goToPreviousDate = () => {
    const prevDate = getDatesByRange(new Date(selectedDate), 1, 0).startDate;
    setSelectedDate(prevDate);
  };

  const goToNextDate = () => {
    const nextDate = getDatesByRange(new Date(selectedDate), 0, 1).endDate;
    setSelectedDate(nextDate);
  };

  const handleOpenAttendanceForm = (attendance: any, fighterName: string) => {
    setSelectedAttendance(attendance);
    setSelectedFighterName(fighterName);
    setIsPopoverOpen(true);
  };

  if (isLoading) {
    return <div className="p-4 text-center">טוען...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-6 min-h-screen">
      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={goToPreviousDate}
          className="h-10 w-10 p-0 touch-manipulation active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <div className="text-base font-semibold">{dayName} - {day}/{month}</div>
          <div className="text-xs text-muted-foreground">
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={goToNextDate}
          className="h-10 w-10 p-0 touch-manipulation active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Drag and Drop Interface */}
      <DragDropManager
        containers={containers}
        renderItem={(item: DragItem, containerId: string) => (
          <FighterCard
            item={item as AttendanceDragItem}
            location={containerId}
            onOpenAttendanceForm={handleOpenAttendanceForm}
          />
        )}
        renderContainer={(config: DroppableContainerConfig, children: React.ReactNode) => (
          <LocationContainer
            location={config.label}
            isEmpty={config.items.length === 0}
          >
            {children}
          </LocationContainer>
        )}
        renderOverlay={(item: DragItem) => (
          <div className="cursor-grabbing rounded-md p-3 text-xs font-medium shadow-2xl opacity-90 border-2 border-primary">
            <div className="font-semibold">{(item as AttendanceDragItem).fighterName}</div>
            <div className="text-xs text-muted-foreground">{(item as AttendanceDragItem).personalNumber}</div>
          </div>
        )}
      />

      {/* Info Text */}
      <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>👆 גרור שם לוחם לעמודה חדשה לעדכון המיקום</p>
      </div>

      {/* Attendance Form Popover */}
      {selectedAttendance && (
        <AttendancePopover
          attendance={selectedAttendance}
          fighterName={selectedFighterName}
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        />
      )}
    </div>
  );
};
