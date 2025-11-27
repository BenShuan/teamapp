'use client';

import { useCallback } from 'react';
import { Attendance, statusLocations } from '@teamapp/api/schema';
import { useCreateAttendance, useUpdateAttendance } from '@/web/hooks/useAttendance';
import { DragItem, DroppableContainerConfig } from './DragDropManager';

export interface AttendanceDragItem extends DragItem {
  fighterId: string;
  fighterName: string;
  personalNumber?: string;
  attendanceId?: string;
  attendance?: Attendance;
}

/**
 * Hook for managing attendance-specific drag and drop logic
 */
export const useAttendanceDragDrop = (
  attendanceRecords: any[],
  fighters: any[],
  selectedDate: string
) => {
  const { mutate: updateAttendance } = useUpdateAttendance();
  const { mutate: createAttendance } = useCreateAttendance();

 

  /**
   * Build drag drop container configurations from attendance data
   */
  const buildContainers = useCallback((): DroppableContainerConfig[] => {
    const containers: DroppableContainerConfig[] = [];

    statusLocations.forEach((location) => {
      const items: AttendanceDragItem[] = [];

      // Find all attendance records for this location on the selected date
      const locationRecords = attendanceRecords.filter(
        (record: any) =>
          record.workDate === selectedDate && record.location === location
      );

      // Add existing attendance records
      locationRecords.forEach((record: any) => {
        const fighter = fighters.find((f: any) => f.id === record.fighterId);
        if (fighter) {
          items.push({
            id: record.id,
            fighterId: fighter.id,
            fighterName: `${fighter.firstName} ${fighter.lastName}`,
            personalNumber: fighter.personalNumber,
            attendanceId: record.id,
            attendance:record,
          });
        }
      });

      // Find fighters without attendance records for this location
      const attendedFighterIds = new Set(
        attendanceRecords
          .filter((r: any) => r.workDate === selectedDate)
          .map((r: any) => r.fighterId)
      );

      // Add missing fighters only to the last location (unassigned)
      if (location === statusLocations[statusLocations.length - 1]) {
        fighters.forEach((fighter: any) => {
          if (!attendedFighterIds.has(fighter.id)) {
            items.push({
              id: `new-${fighter.id}`,
              fighterId: fighter.id,
              fighterName: `${fighter.firstName} ${fighter.lastName}`,
              personalNumber: fighter.personalNumber,
            });
          }
        });
      }

      containers.push({
        id: location,
        label: location,
        items,
        onDrop: (item: DragItem, sourceContainerId: string, targetContainerId: string) => {
          handleAttendanceUpdate(item as AttendanceDragItem, sourceContainerId, targetContainerId);
        },
      });
    });

    return containers;
  }, [attendanceRecords, fighters, selectedDate]);

  /**
   * Handle attendance update when item is dropped
   */
  const handleAttendanceUpdate = useCallback(
    (item: AttendanceDragItem, sourceContainerId: string, targetContainerId: string) => {
      // If dragging to the same location, do nothing
      if (sourceContainerId === targetContainerId) {
        return;
      }

      const newLocation = targetContainerId as (typeof statusLocations)[number];

      // Update existing attendance record
      if (item.attendanceId) {
        updateAttendance({
          id: item.attendanceId,
          attendance: {
            location: newLocation,
          },
        });
      } else {
        // Create new attendance record
        createAttendance([{
            location: newLocation,
            fighterId: item.fighterId,
            workDate: selectedDate,
        }]);
      }
    },
    [updateAttendance, selectedDate]
  );

  return {
    buildContainers,
    handleAttendanceUpdate,
  };
};
