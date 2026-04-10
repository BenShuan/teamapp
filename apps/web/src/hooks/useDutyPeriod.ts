'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dutyPeriodQueryOptions,
  createDutyPeriod,
  updateDutyPeriod,
  deleteDutyPeriod,
} from '@/web/services/dutyPeriod.api';
import { NewDutyPeriod, UpdateDutyPeriod } from '@teamapp/api/schema';
import { toast } from 'sonner';

export const useDutyPeriods = () => {
  return useQuery(dutyPeriodQueryOptions());
};

export const useCreateDutyPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewDutyPeriod) => createDutyPeriod(data),
    onSuccess: () => {
      toast.success("תקופת צו נוצרה בהצלחה");
      queryClient.invalidateQueries({ queryKey: ['duty-period'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateDutyPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateDutyPeriod }) =>
      updateDutyPeriod({ id, updates }),
    onSuccess: () => {
      toast.success("תקופת צו עודכנה בהצלחה");
      queryClient.invalidateQueries({ queryKey: ['duty-period'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteDutyPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDutyPeriod(id),
    onSuccess: () => {
      toast.success("תקופת צו נמחקה");
      queryClient.invalidateQueries({ queryKey: ['duty-period'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
