'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceQueryOptions, createAttendance, updateAttendance, deleteAttendance } from '@/web/services/attendance.api';
import { NewAttendance, UpdateAttendance } from '@teamapp/api/schema';
import { toast } from 'sonner';

export const useAttendance = (startDate:Date,endDate:Date ) => {
  return useQuery(attendanceQueryOptions(startDate,endDate));
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
