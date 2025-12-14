'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceQueryOptions, createAttendance, updateAttendance, deleteAttendance } from '@/web/services/attendance.api';
import { Attendance, FightersAttendance, NewAttendance, UpdateAttendance } from '@teamapp/api/schema';
import { toast } from 'sonner';
import { dateRangeBuilder } from '@teamapp/shared';
import { queriesMap } from '../lib/queries';

export const useAttendance = (startDate: Date, endDate: Date) => {
  const query = useQuery(attendanceQueryOptions(startDate, endDate));

  const dateRange = dateRangeBuilder(startDate, endDate);
  const attendanceMapByDate: queriesMap<Record<string, Attendance[]>> = {};
  for (const date of dateRange) {
    attendanceMapByDate[date] = {
      label: date,
      value: {}
    };
  }

  if (Array.isArray(query.data)) {
    query.data.forEach((attendanceRecord: FightersAttendance ) => {
      for (const attendance of attendanceRecord.attendances) {
        const dateKey = new Date(attendance.workDate).toISOString().split('T')[0];
        if (attendanceMapByDate[dateKey]) {
          if (!attendanceMapByDate[dateKey].value[attendance.location]) {
            attendanceMapByDate[dateKey].value[attendance.location] = [];
          }
          attendanceMapByDate[dateKey].value[attendance.location].push(attendance);
        }
      }


    })
  }



  return { ...query,attendanceMapByDate };
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attendance: NewAttendance[]) => createAttendance(attendance),
    onSuccess: () => {
      toast.success("רשומה נוצרה בהצלחה")
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attendance }: { id: string; attendance: UpdateAttendance }) =>
      updateAttendance({ id, attendance }),
    onSuccess: () => {
      toast.success("רשומה עודכנה בהצלחה")

      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};
